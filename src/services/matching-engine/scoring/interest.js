const dayjs = require('dayjs');

/**
 * Interest Scoring (INTEREST_SCORE)
 * 
 * Rules from AFTERHOURS Spec:
 * - They liked me this week FOR day d (+90)
 * - Rematch opt-in (+60) - Decays -10/week, 3 retries
 * - I liked them, they didn't see me (+45) - Decays -10/retry, 3 retries
 * - I liked them last week, they ignored (+25) - Retry after 14 days
 * - Active 24h (+13) / Active 7d (+8)
 * - Profile/Availability updated <= 72h (+5)
 * - Premium candidate (+12)
 * - New user boost (+20 for 3d / +10 for 14d)
 */

const POINTS = {
    LIKED_THIS_WEEK: 90,
    REMATCH_OPT_IN: 60,
    LIKED_UNSEEN: 45,
    LIKED_IGNORED: 25,
    ACTIVE_24H: 13,
    ACTIVE_7D: 8,
    UPDATED_72H: 5,
    PREMIUM_CANDIDATE: 12,
    NEW_USER_3D: 20,
    NEW_USER_14D: 10,
    NOSTALGIA_NUDGE: 15,
    FAIRNESS_BOOST: 10
};


const calculateInterestScore = (candidate, pairState) => {
    let score = 0;
    const breakdown = [];
    const now = dayjs();

    // 1. Pair State Signals (Dynamic Behavior)
    if (pairState) {
        // They liked me for an overlapping day
        if (pairState.inbound_like_day) {
            const likeDate = dayjs(pairState.inbound_like_day);
            if (now.diff(likeDate, 'day') <= 7) {
                score += POINTS.LIKED_THIS_WEEK;
                breakdown.push('🔥 Likes you for today');
            }
        }

        // Rematch logic
        if (pairState.is_rematch_ready) {
            const retryCount = pairState.rematch_retries || 0;
            const decay = retryCount * 10;
            score += Math.max(0, POINTS.REMATCH_OPT_IN - decay);
            breakdown.push('✨ Rematch potential');
        }

        // I liked them, but they haven't seen me yet
        if (pairState.last_swipe === 'like' && pairState.exposures_this_week === 0) {
            const retryCount = pairState.unseen_retries || 0;
            const decay = retryCount * 10;
            score += Math.max(0, POINTS.LIKED_UNSEEN - decay);
            breakdown.push('🤞 Waiting for them');
        }

        // I liked them before, they saw but took no action
        if (pairState.last_swipe === 'like' && pairState.exposures_this_week > 0) {
            const lastExposed = dayjs(pairState.last_seen_at);
            if (now.diff(lastExposed, 'day') >= 14) {
                score += POINTS.LIKED_IGNORED;
                breakdown.push('🔄 Connection retry');
            }
        }

        // Nostalgia: Chat closed >= 30d
        if (pairState.closed_match_at) {
            const closedAt = dayjs(pairState.closed_match_at);
            if (now.diff(closedAt, 'day') >= 30) {
                score += POINTS.NOSTALGIA_NUDGE;
                breakdown.push('⏳ Old spark');
            }
        }
    }


    // 2. Candidate Global Signals (Engagement)
    const lastActive = dayjs(candidate.user_id?.lastActiveAt || candidate.updatedAt);
    const profileUpdated = dayjs(candidate.updatedAt);

    if (now.diff(lastActive, 'hour') <= 24) {
        score += POINTS.ACTIVE_24H;
        breakdown.push('⚡ Active now');
    } else if (now.diff(lastActive, 'day') <= 7) {
        score += POINTS.ACTIVE_7D;
        breakdown.push('Active this week');
    }

    if (now.diff(profileUpdated, 'hour') <= 72) {
        score += POINTS.UPDATED_72H;
        breakdown.push('✨ Fresh profile');
    }

    // 3. Status & Quality Boosts
    if (candidate.user_id?.is_subscribed) {
        score += POINTS.PREMIUM_CANDIDATE;
        breakdown.push('💎 Premium member');
    }

    // Profile Quality (Completeness)
    if (candidate.bio && candidate.bio.length > 30) {
        score += 5;
        breakdown.push('📖 Great bio');
    }
    if (candidate.images?.length >= 3) {
        score += 10;
        breakdown.push('📸 Photo rich');
    }

    // New User
    const createdAt = dayjs(candidate.createdAt);
    if (now.diff(createdAt, 'day') <= 3) {
        score += POINTS.NEW_USER_3D;
        breakdown.push('🆕 New face');
    } else if (now.diff(createdAt, 'day') <= 14) {
        score += POINTS.NEW_USER_14D;
        breakdown.push('New to Adam');
    }

    // Base Engagement (Prevent 0 for active, non-interacting users)
    if (score < 15 && now.diff(lastActive, 'day') < 30) {
        score += 10;
        breakdown.push('🌟 Active presence');
    }

    // 4. Fairness Boost (Undiscovered profiles)
    const exposures = candidate.total_exposures_count || 0;
    if (exposures < 15) {
        score += POINTS.FAIRNESS_BOOST;
        breakdown.push('✨ Fresh discovery');
    }

    // Normalize to 0-100 (Spec says interest score is capped at 100)
    return {
        score: Math.min(100, Math.max(0, score)),
        breakdown
    };
};

module.exports = {
    calculateInterestScore
};

const dayjs = require('dayjs');

/**
 * Repetition & Penalty Logic
 * 
 * Rules:
 * - Swiped YES: -40
 * - Swiped NO: -60 / -85 / -110 (Escalating)
 * - Exposed Today: -25
 * - Consecutive No-Swipe: -10 * count
 */

const PENALTIES = {
    SWIPED_YES: -40,
    SWIPED_NO_1: -80,
    SWIPED_NO_2: -100,
    SWIPED_NO_3: -130,
    EXPOSED_TODAY: -25,
    CONSECUTIVE_NO_SWIPE: -10, // per count
    WEEKLY_EXPOSURE_CAP: -120, // Seen 2+ times this week with no action
    TOP_3_YESTERDAY: -15
};

const WEEKLY_SEEN_PENALTIES = [
    { minDays: 0, maxDays: 7, penalty: -35 },
    { minDays: 8, maxDays: 14, penalty: -20 },
    { minDays: 15, maxDays: 28, penalty: -10 }
];

const calculateRepetitionPenalty = (pairState) => {
    let penalty = 0;
    if (!pairState) return 0;

    const now = dayjs();

    // 1. Swipes (Governs long-term cool-downs)
    if (pairState.last_swipe === 'like') {
        penalty += PENALTIES.SWIPED_YES;
    } else if (pairState.last_swipe === 'pass') {
        const count = pairState.pass_count || 1;
        if (count >= 3) penalty += PENALTIES.SWIPED_NO_3;
        else if (count === 2) penalty += PENALTIES.SWIPED_NO_2;
        else penalty += PENALTIES.SWIPED_NO_1;
    }

    // 2. Exposures (Governs short-term variety)
    // Check if the exposure count is from the current week
    const currentWeekId = dayjs().startOf('week').format('YYYY-[W]ww');
    const isCurrentWeek = pairState.week_id === currentWeekId;
    const weeklyExposures = isCurrentWeek ? (pairState.exposures_this_week || 0) : 0;

    // If exposed 2+ times this week without a swipe, apply heavy sink
    if (weeklyExposures >= 2 && pairState.last_swipe === 'none') {
        penalty += PENALTIES.WEEKLY_EXPOSURE_CAP;
    }

    // Exposed Today (no swipe) -> -25 next day
    if (pairState.last_seen_at) {
        const lastExposed = dayjs(pairState.last_seen_at);
        if (now.isSame(lastExposed, 'day') && pairState.last_swipe === 'none') {
            penalty += PENALTIES.EXPOSED_TODAY;
        }
    }

    // Consecutive exposures without swipe (nudge logic)
    if (pairState.consecutive_exposures_no_swipe > 0) {
        penalty += (pairState.consecutive_exposures_no_swipe * PENALTIES.CONSECUTIVE_NO_SWIPE);
    }

    // 3. Weekly Freshness Memory
    if (pairState.last_seen_at) {
        const daysSinceSeen = now.diff(dayjs(pairState.last_seen_at), 'day');
        const weeklyPenalty = WEEKLY_SEEN_PENALTIES.find(p => daysSinceSeen >= p.minDays && daysSinceSeen <= p.maxDays);
        if (weeklyPenalty) {
            penalty += weeklyPenalty.penalty;
        }
    }

    // 4. Top-3 Yesterday
    if (pairState.was_top_3_yesterday) {
        penalty += PENALTIES.TOP_3_YESTERDAY;
    }

    // Cap Max Penalty (from Spec)
    // "Don't let total drop below -150"
    return Math.max(penalty, -150);
};



module.exports = {
    calculateRepetitionPenalty
};

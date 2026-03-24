const dayjs = require('dayjs');

/**
 * Compatibility Scoring (COMP_SCORE)
 * 
 * Rules from AFTERHOURS Spec:
 * - Harmonic Mean of forward (A->B) and reverse (B->A) scores.
 * - Free Seekers: Points for Age, Distance, Looking-for, Trust, Verification, Completeness, Organic match.
 * - Premium Seekers: Advanced preferences with Very Important (VI) flags.
 * - Never penalize missing fields; only add points when info exists.
 */

const POINTS = {
    // Basic (Free)
    AGE_IN_PREFERRED: 10,
    DIST_IN_PREFERRED: 10,
    LOOKING_FOR_MATCH: 18,
    LOOKING_FOR_VI_MATCH: 40,
    LOOKING_FOR_MISMATCH: -30,
    TRUST_HIGH: 12,    // >= 75
    TRUST_MID: 8,      // 40-74.99
    TRUST_LOW: 2,      // < 40
    ID_VERIFIED: 5,
    PHOTO_VERIFIED: 3,
    ORGANIC_MATCH: 3,

    // Premium Advanced (Major: Height, Religion, Politics, Ethnicity)
    PREM_MAJOR_MATCH: 10,
    PREM_MAJOR_VI_MATCH: 35,
    PREM_MAJOR_VI_MISMATCH: -14,

    // Premium Advanced (Minor: Kids, Exercise, Diet, Drink, etc)
    PREM_MINOR_MATCH: 8,
    PREM_MINOR_VI_MATCH: 25,
    PREM_MINOR_VI_MISMATCH: -10,

    // Boosts only (Languages, Cultural)
    PREM_BOOST_MATCH: 7,
    PREM_BOOST_VI_MATCH: 14
};

// Distance Bonus Mapping (Explicit buckets from spec)
const getDistanceBonus = (miles) => {
    if (miles <= 1.0) return 10;
    if (miles <= 2.0) return 8;
    if (miles <= 3.0) return 6;
    if (miles <= 4.0) return 4;
    if (miles <= 5.0) return 2;
    return 0;
};

const harmonicMean = (a, b) => {
    if (a <= 0 || b <= 0) return 0;
    return 2 / ((1 / a) + (1 / b));
};

const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

/**
 * Helper to check overlap between array of preference IDs and a single/multiple candidate attribute(s)
 */
const hasOverlap = (prefIds, candIds) => {
    if (!prefIds || !candIds) return false;

    // Normalize preference IDs to string array
    const pIds = (Array.isArray(prefIds) ? prefIds : [prefIds])
        .map(id => id?.toString())
        .filter(id => !!id);

    // Normalize candidate IDs/Objects to string array
    const cIds = (Array.isArray(candIds) ? candIds : [candIds])
        .map(item => {
            if (!item) return null;
            if (typeof item === 'object') {
                return (item._id || item.id || item).toString();
            }
            return item.toString();
        })
        .filter(id => !!id && id !== '[object Object]');

    return pIds.some(id => cIds.includes(id));
};

/**
 * Directional Compatibility (Seeker -> Candidate)
 */
const calculateDirectionalScore = (seekerProfile, seekerPrefs, candidateProfile) => {
    let score = 0;
    const breakdown = [];
    const isPremium = seekerProfile.is_subscribed || false;

    // 1. Age (Granular Preferred Ring)
    const age = dayjs().diff(dayjs(candidateProfile.date_of_birth), 'year');
    const prefMin = seekerPrefs.age?.min || 18;
    const prefMax = seekerPrefs.age?.max || 100;
    if (age >= prefMin && age <= prefMax) {
        score += POINTS.AGE_IN_PREFERRED;
    } else {
        const gap = age < prefMin ? prefMin - age : age - prefMax;
        if (gap <= 3) score += Math.max(0, 5 - gap); // Soft penalty
    }

    // 2. Distance Ring (Decay based)
    const distanceMiles = candidateProfile.distanceMiles || 999;
    const prefDist = seekerPrefs.distance?.value || 50;
    if (distanceMiles <= prefDist) {
        score += POINTS.DIST_IN_PREFERRED;
        score += (1 - (distanceMiles / prefDist)) * 5; // Closeness bonus (0-5)
    }
    score += getDistanceBonus(distanceMiles);
    if (distanceMiles < 5) breakdown.push('📍 Close to you');

    // 3. Trust & Verification
    const trust = candidateProfile.trust_score || 0;
    if (trust >= 75) score += POINTS.TRUST_HIGH;
    else if (trust >= 40) score += POINTS.TRUST_MID;
    else score += POINTS.TRUST_LOW;

    if (candidateProfile.id_verified) {
        score += POINTS.ID_VERIFIED;
        breakdown.push('✅ ID Verified');
    }
    if (candidateProfile.photo_verified) {
        score += POINTS.PHOTO_VERIFIED;
        breakdown.push('📸 Photo Verified');
    }

    // 4. Looking For (Intent)
    const seekerLook = seekerPrefs.looking_for?.looking || [];
    const candLook = candidateProfile.looking_for || [];
    if (hasOverlap(seekerLook, candLook)) {
        score += seekerPrefs.looking_for?.isImportant ? POINTS.LOOKING_FOR_VI_MATCH : POINTS.LOOKING_FOR_MATCH;
        breakdown.push('🤝 Similar Intent');
    } else if (seekerLook.length > 0 && candLook.length > 0) {
        score += POINTS.LOOKING_FOR_MISMATCH;
    }

    // 5. Effort & Completeness
    const completeness = candidateProfile.profile_completeness_percent || 0;
    score += (completeness / 100) * 10;

    if (candidateProfile.bio) {
        const bioLen = candidateProfile.bio.length;
        if (bioLen > 200) score += 5;
        else if (bioLen > 50) score += 3;
        else if (bioLen > 10) score += 1;
    }

    // 6. Organic Similarities (Shared Interests/Attributes)
    const organicFields = ['religion', 'ethnicity', 'exercise', 'diet', 'drink', 'smoking', 'interests'];
    let sharedCount = 0;
    organicFields.forEach(field => {
        if (seekerProfile[field] && candidateProfile[field]) {
            if (hasOverlap(seekerProfile[field], candidateProfile[field])) {
                score += POINTS.ORGANIC_MATCH;
                sharedCount++;
            }
        }
    });
    if (sharedCount >= 2) breakdown.push('🧩 Common Ground');

    // 7. Micro-Jitter (Entropy): Stable per-user variance
    const userHash = parseInt(candidateProfile.user_id?._id?.toString().slice(-2), 16) || 0;
    score += (userHash % 30) / 10; // Adds 0.0 to 3.0 points uniquely

    // 7. Advanced Premium Preferences
    if (isPremium) {
        let advBonus = 0;
        let advPenalty = 0;

        const majorFields = [
            { prefKey: 'religion', candKey: 'religion', label: '🙏 Shared Beliefs' },
            { prefKey: 'political', candKey: 'politics', label: '⚖️ Political Match' },
            { prefKey: 'ethnicity', candKey: 'ethnicity', label: '🌍 Cultural Match' }
        ];

        majorFields.forEach(({ prefKey, candKey, label }) => {
            const pref = seekerPrefs[prefKey];
            if (!pref || !candidateProfile[candKey]) return;

            const match = hasOverlap(pref[prefKey + 's'] || pref[prefKey], candidateProfile[candKey]);
            if (match) {
                advBonus += pref.isImportant ? POINTS.PREM_MAJOR_VI_MATCH : POINTS.PREM_MAJOR_MATCH;
                if (pref.isImportant) breakdown.push(label);
            } else if (pref.isImportant) {
                advPenalty += POINTS.PREM_MAJOR_VI_MISMATCH;
            }
        });

        const minorFields = [
            { prefKey: 'kid', candKey: 'kids', label: '👶 Family Plans' },
            { prefKey: 'family_plan', candKey: 'family_plan', label: '👶 Family Plans' },
            { prefKey: 'exercise', candKey: 'exercise' },
            { prefKey: 'diet', candKey: 'diet' },
            { prefKey: 'drink', candKey: 'drink' },
            { prefKey: 'smoke', candKey: 'smoking' },
            { prefKey: 'pets', candKey: 'pets', label: '🐾 Pet Lover' },
            { prefKey: 'zodiac', candKey: 'zodiac' },
            { prefKey: 'education_level', candKey: 'education_level' }
        ];

        minorFields.forEach(({ prefKey, candKey, label }) => {
            const pref = seekerPrefs[prefKey];
            if (!pref || !candidateProfile[candKey]) return;

            const match = hasOverlap(pref[prefKey + 's'] || pref[prefKey], candidateProfile[candKey]);
            if (match) {
                advBonus += pref.isImportant ? POINTS.PREM_MINOR_VI_MATCH : POINTS.PREM_MINOR_MATCH;
                if (label && pref.isImportant) breakdown.push(label);
            } else if (pref.isImportant) {
                advPenalty += POINTS.PREM_MINOR_VI_MISMATCH;
            }
        });

        // Language / Cultural (Boost only)
        const boostFields = [
            { prefKey: 'languages', candKey: 'languages', label: '💬 Speaks your language' },
            { prefKey: 'cultural_background', candKey: 'cultural_background', label: '🌍 Common Background' }
        ];

        boostFields.forEach(({ prefKey, candKey, label }) => {
            const pref = seekerPrefs[prefKey];
            if (!pref || !candidateProfile[candKey]) return;

            const match = hasOverlap(pref[prefKey] || pref[prefKey + 's'], candidateProfile[candKey]);
            if (match) {
                advBonus += pref.isImportant ? POINTS.PREM_BOOST_VI_MATCH : POINTS.PREM_BOOST_MATCH;
                if (label && pref.isImportant) breakdown.push(label);
            }
        });

        // Apply Caps
        score += clamp(advBonus, 0, 50);
        score += Math.max(advPenalty, -35);
    }

    return { score: Math.max(0, score), breakdown };
};

const calculateMutualCompatibility = (userAProfile, userAPrefs, userBProfile, userBPrefs) => {
    // Forward Score (A looks at B)
    const { score: scoreAtoB, breakdown } = calculateDirectionalScore(userAProfile, userAPrefs, userBProfile);

    // Reverse Score (B looks at A)
    const { score: scoreBtoA } = userBPrefs?.age ? calculateDirectionalScore(userBProfile, userBPrefs, userAProfile) : { score: scoreAtoB };

    const mutual = harmonicMean(scoreAtoB, scoreBtoA);

    if (mutual > 85) breakdown.push('⭐ Perfect Fit');
    else if (mutual > 70) breakdown.push('✨ Great Match');

    return {
        mutual_score: clamp(mutual, 0, 100),
        forward: scoreAtoB,
        reverse: scoreBtoA,
        breakdown: [...new Set(breakdown)]
    };
};

module.exports = {
    calculateMutualCompatibility
};

const dayjs = require('dayjs');
const mongoose = require('mongoose');
const { User, UserPrefs, Interaction, PairState, DateDay, Match, Gender, InterestedIn } = require('../../models');

/**
 * Stage 1: Hard Gates (Eligibility)
 * If any gate fails, candidate is excluded.
 * 
 * Gates:
 * 1. Gender Match
 * 2. Availability Overlap (Day d)
 * 3. Safety (Blocked/Banned/Active Chat)
 * 4. Age & Distance (Expanded Ring)
 */

const passesHardGates = async (viewerId, candidateId) => {
    // Check for Active Chat
    const activeMatch = await Match.findOne({
        users: { $all: [viewerId, candidateId] },
        isActive: true
    });
    if (activeMatch) return false;

    // Additional safety checks can go here
    return true;
};

/**
 * Candidate Query Construction
 * Returns the MongoDB query object to fetch initial pool.
 */
const buildCandidateQuery = async (viewer, viewerPrefs, dayString, viewerProfile) => {
    // Prefer location from Prefs (the 'discovery' location), fallback to Profile (Home)
    const currentlocation = viewerPrefs?.currentlocation || viewerProfile?.location;
    const { age, distance, interested_in } = viewerPrefs || {};

    let genderSearchNames = [];
    let resolutionType = "NONE";

    // Common mapping function for Interest -> Gender
    const mapInterestToGender = (interestNames) => {
        const targetNames = [];
        interestNames.forEach(n => {
            const clean = n.replace(/\s+/g, '').toLowerCase();
            if (clean === 'men' || clean === 'man' || clean === 'male') targetNames.push('Male');
            else if (clean === 'women' || clean === 'woman' || clean === 'female') targetNames.push('Female');
            else if (clean === 'nonbinary' || clean === 'non-binary') targetNames.push('Non - Binary');
            else if (clean === 'all') targetNames.push('Male', 'Female', 'Non - Binary', 'Other');
            else targetNames.push(n);
        });
        return [...new Set(targetNames)];
    };

    // 2. Resolve Gender Gate IDs (Phase 1: Determine target gender names)
    if (interested_in?.interests?.length > 0) {
        resolutionType = "PREFERENCE-BYPASS";
        const interests = await InterestedIn.find({ _id: { $in: interested_in.interests } });
        genderSearchNames = mapInterestToGender(interests.map(i => i.name));
    } else if (viewerProfile?.interested_in) {
        resolutionType = "PROFILE-ORIENTATION";
        genderSearchNames = mapInterestToGender([viewerProfile.interested_in.name]);
    } else if (viewerProfile?.gender) {
        resolutionType = "GENDER-SMART-DEFAULT";
        const viewerGender = await Gender.findById(viewerProfile.gender);
        if (viewerGender) {
            if (viewerGender.name === 'Male') genderSearchNames.push('Female');
            else if (viewerGender.name === 'Female') genderSearchNames.push('Male');
        }
    }

    // 0. Smart Day Resolution & 2. Resolve Gender Gate IDs (Parallelized)
    let dayDoc = null;
    let targetGenders = [];
    let genderFilter = {};

    const tasks = [];

    // Day Resolution Task
    if (dayString) {
        if (mongoose.Types.ObjectId.isValid(dayString)) {
            tasks.push(DateDay.findById(dayString).then(doc => dayDoc = doc));
        } else {
            let searchDayName = dayString;
            if (/^\d{4}-\d{2}-\d{2}$/.test(dayString)) {
                searchDayName = dayjs(dayString).format('dddd');
            }
            tasks.push(DateDay.findOne({
                $or: [
                    { name: new RegExp(`^${searchDayName}$`, 'i') },
                    { name: new RegExp(`^${dayString}$`, 'i') }
                ]
            }).then(doc => dayDoc = doc));
        }
    }

    // Gender Resolution Task
    if (genderSearchNames.length > 0) {
        const genderRegexes = genderSearchNames.map(name => {
            const n = name.toLowerCase().trim();
            if (n.includes('non')) return /^non.*binary$/i;
            if (n === 'male' || n === 'men' || n === 'man') return /^(male|man|men)$/i;
            if (n === 'female' || n === 'woman' || n === 'women') return /^(female|woman|women)$/i;
            return new RegExp(`^${name}$`, 'i');
        });
        tasks.push(Gender.find({
            $or: genderRegexes.map(reg => ({ name: reg }))
        }).then(docs => targetGenders = docs));
    }

    await Promise.all(tasks);

    if (dayDoc) {
        console.log(`[MATCHING ENGINE] Day Resolution: Resolved [${dayString}] to Day [${dayDoc.name}] (${dayDoc._id})`);
    } else {
        console.warn(`[MATCHING ENGINE] Day Resolution: Failed to resolve [${dayString}]. Using WIDE availability.`);
    }

    if (targetGenders.length > 0) {
        const genderIds = targetGenders.map(g => g._id);
        genderFilter = { gender: { $in: genderIds } };
        console.log(`[MATCHING ENGINE] ${resolutionType} Gender Filter: ${genderSearchNames.join(', ')} (${genderIds.length} IDs)`);
    } else {
        console.warn(`[MATCHING ENGINE] No gender filter applied. Range is WIDE OPEN.`);
    }

    // 3. Hybrid Gating Logic: Verifier (Strict) vs Suggester (Expanded)
    // opt_run_out === false means strictly stick to my preferences.
    const isAgeStrict = viewerPrefs.age?.opt_run_out === false;
    const isDistStrict = viewerPrefs.distance?.opt_run_out === false;

    // Suggester Mode: Age +/- 3 years, Distance + 25-100% based on density
    // Verifier Mode: Exact match
    const minAge = isAgeStrict ? (age?.min || 18) : Math.max(18, (age?.min || 18) - 3);
    const maxAge = isAgeStrict ? (age?.max || 100) : (age?.max || 100) + 3;

    //   Rule: Elastic Discovery. If not strict, we expand distance.
    let expansionFactor = isDistStrict ? 1.0 : 2.5;
    let maxDistanceMeters = (distance?.value || 50) * 1609.34 * expansionFactor;

    const query = {
        ...genderFilter,
        dates_days: dayDoc ? dayDoc._id : { $exists: true },
        date_of_birth: {
            $gte: dayjs().subtract(maxAge + 1, 'year').toDate(),
            $lte: dayjs().subtract(minAge, 'year').toDate(),
        }
    };

    const appliedFilters = ['gender', 'age'];
    if (dayDoc) appliedFilters.push('dates_days');

    // Add Iron Gates
    const adv = viewerPrefs.advance_filter || {};
    const gen = viewerPrefs.general_filter || {};

    const filterKeys = ['religion', 'ethnicity', 'exercise', 'diet', 'drink', 'smoke', 'political', 'kid', 'pets', 'zodiac', 'education_level', 'cultural_background', 'looking_for'];

    const importantFilters = []; // Track filters marked as Very Important for scoring boost

    filterKeys.forEach(key => {
        // Look in nested config (Lab Mode) OR root level (Production DB Mode)
        const pref = adv[key] || gen[key] || viewerPrefs[key];

        if (pref) {
            let subKey = key + 's';
            if (key === 'smoke') subKey = 'smokings';
            if (key === 'kid') subKey = 'kids';
            if (key === 'political') subKey = 'politics';
            if (key === 'education_level') subKey = 'education_levels';
            if (key === 'cultural_background') subKey = 'cultural_backgrounds';
            if (key === 'looking_for') subKey = 'looking';

            // Extract values: support [key]s or [key]
            let selectedValues = pref[subKey] || pref[key + 's'] || pref[key] || [];

            // If it's a single value, wrap it
            if (!Array.isArray(selectedValues)) {
                if (selectedValues && (mongoose.Types.ObjectId.isValid(selectedValues) || typeof selectedValues === 'string')) {
                    selectedValues = [selectedValues];
                } else {
                    selectedValues = [];
                }
            }

            // Clean up empty/null values but KEEP valid ObjectIds
            selectedValues = selectedValues.filter(v => {
                if (!v) return false;
                if (v.toString().trim() === '' || v === 'N/A') return false;
                if (mongoose.Types.ObjectId.isValid(v)) return true;
                if (typeof v === 'string') return true;
                return false;
            });

            const isFilterActive = Array.isArray(selectedValues) && selectedValues.length > 0;

            if (isFilterActive) {
                // [REFACTOR] Karolina's Direction: These are no longer "Iron Gates" (Hard Filters).
                // We remove them from the MongoDB query to ensure the pool is large enough.
                // They are now tracked as "Soft Filters" for the Scoring Tower to prioritize.
                
                appliedFilters.push(key);

                // Track Very Important filters for scoring boost
                if (pref.isImportant === true) {
                    importantFilters.push(key);
                }

                console.log(`[MATCHING ENGINE] Soft Filter [${key.toUpperCase()}]: Tracked for scoring.${pref.isImportant ? ' (★ VERY IMPORTANT)' : ''}`);
            }
        }
    });

    // Location Gate: Use $geoWithin for maximum compatibility (supports countDocuments and $and/$or)
    if (currentlocation?.coordinates) {
        const radiusInRadians = maxDistanceMeters / 6378100; // Earth radius in meters
        query.location = {
            $geoWithin: {
                $centerSphere: [currentlocation.coordinates, radiusInRadians]
            }
        };
        appliedFilters.push('distance');
    } else {
        console.warn(`[MATCHING ENGINE] Warning: No coordinates for viewer ${viewer._id}. Distance filter SKIPPED.`);
    }

    console.log(`[MATCHING ENGINE] Final MongoDB Retrieval Query:`, JSON.stringify(query, null, 2));

    return { query, dayDoc, appliedFilters, importantFilters };
};


module.exports = {
    passesHardGates,
    buildCandidateQuery
};

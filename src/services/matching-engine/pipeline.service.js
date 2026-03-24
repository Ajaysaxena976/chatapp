const crypto = require('crypto');
const mongoose = require('mongoose');
const dayjs = require('dayjs');
const { passesHardGates, buildCandidateQuery } = require('./gates');
const { calculateViewerAlpha } = require('./scoring/alpha');
const { calculateMutualCompatibility } = require('./scoring/comp');
const { calculateInterestScore } = require('./scoring/interest');
const { calculateRepetitionPenalty } = require('./scoring/repetition');
const { applyBandShuffle, getHaversineDistance } = require('./utils');
const { User, UserPrefs, PairState, UserProfile, Match, Interaction, InterestedIn, DateDay } = require('../../models');

const logger = require('../../config/logger');

// ---  -Grade Semantic Analysis ---
const VIBE_KEYWORDS = {
    'adventure': ['hiking', 'travel', 'mountains', 'outdoor', 'explore'],
    'wellness': ['yoga', 'meditation', 'vegan', 'health', 'fitness'],
    'creativity': ['art', 'music', 'design', 'writing', 'film'],
    'tech': ['coding', 'startup', 'gaming', 'ai', 'crypto']
};

const calculateSemanticVibeMatch = (viewerProfile, candidateProfile) => {
    const vBio = (viewerProfile.bio || '').toLowerCase();
    const cBio = (candidateProfile.bio || '').toLowerCase();

    let sharedHits = 0;
    Object.values(VIBE_KEYWORDS).forEach(keywords => {
        const vHas = keywords.some(k => vBio.includes(k));
        const cHas = keywords.some(k => cBio.includes(k));
        if (vHas && cHas) sharedHits += 1;
    });

    // Semantic Boost: 1.0 - 5.0 points based on shared 'vibe clusters'
    return Math.min(5.0, sharedHits * 1.5);
};

//  -Grade TWO-TOWER Architecture
const feedCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

const DEFAULT_WEIGHTS = {
    compatibility: 0.30,
    interest: 0.15,
    dateProb: 0.55,
    fairness: 1.5,
    diversity: 1.0,
    semantic: 1.0,
    popularity: 1.0 // Weight for Trending Users
};

// ---  -Grade Experimentation Engine ---
// Users are deterministically assigned to "Buckets" for A/B testing
const EXPERIMENT_COHORTS = {
    'CONTROL': { ...DEFAULT_WEIGHTS },
    'PRO_FAIRNESS': { ...DEFAULT_WEIGHTS, fairness: 3.5, compatibility: 0.20 },
    'PRO_COMPATIBILITY': { ...DEFAULT_WEIGHTS, compatibility: 0.60, dateProb: 0.25 },
    'ACTIVE_FIRST': { ...DEFAULT_WEIGHTS, dateProb: 0.75, interest: 0.05 }
};

const getCohortForUser = (userId) => {
    const hash = crypto.createHash('md5').update(userId.toString()).digest('hex');
    const bucket = parseInt(hash.slice(0, 2), 16) % Object.keys(EXPERIMENT_COHORTS).length;
    const cohortName = Object.keys(EXPERIMENT_COHORTS)[bucket];
    return { name: cohortName, weights: EXPERIMENT_COHORTS[cohortName] };
};

// ---  -Grade Explainable AI (Match Insights) ---
const calculateMatchInsights = (cand, weights) => {
    const insights = [];

    if (cand.compatibility > 85) insights.push('Elite Compatibility');
    else if (cand.compatibility > 70) insights.push('High Vibe Mirror');

    if (cand.dateProb > 80) insights.push('Active & Ready Today');

    const semanticVal = (cand.debug?.semanticBoost || 0);
    if (semanticVal > 3.0) insights.push('Shared Lifestyle Clusters');

    if (cand.interest?.score > 85) insights.push('Deep Mutual Interest');

    if ((cand.total_exposures_count || 0) < 15) insights.push('Fresh Discovery');

    if ((cand.debug?.trendingScore || 0) > 10) insights.push('🔥 Trending Now');

    // Return the top 2 strongest insights
    return insights.slice(0, 2);
};

// ---  -Grade Collaborative Spark (Trending Logic) ---
const calculateTrendingScores = async (candidateIds) => {
    // Swipe Velocity: Likes in the last 24 hours
    const trendingData = await Interaction.aggregate([
        {
            $match: {
                targetUserId: { $in: candidateIds },
                action: 'like',
                createdAt: { $gte: dayjs().subtract(24, 'hour').toDate() }
            }
        },
        { $group: { _id: '$targetUserId', likeCount: { $sum: 1 } } }
    ]);

    const scoreMap = new Map();
    trendingData.forEach(item => {
        // Boost of 0.5 to 5.0 points based on velocity
        scoreMap.set(item._id.toString(), Math.min(5.0, item.likeCount * 0.2));
    });
    return scoreMap;
};

// ---  -Grade Frustration Detection ---
const checkUserFrustration = async (userId) => {
    // Look at last 30 interactions
    const lastLikes = await Interaction.countDocuments({
        userId,
        action: 'like',
        createdAt: { $gte: dayjs().subtract(7, 'day').toDate() }
    });

    const lastMatches = await Match.countDocuments({
        users: userId,
        createdAt: { $gte: dayjs().subtract(7, 'day').toDate() }
    });

    // Frustration Rule: 15+ likes but 0 matches = Frustrated
    return lastLikes >= 15 && lastMatches === 0;
};

/**
 *  -Grade Dynamic Weight Controller
 * Adjusts engine weights based on user session entropy and historical success.
 */
const resolveDynamicWeights = async (viewerId, baseWeights) => {
    // 1. Fetch Context (Session Entropy & Success)
    console.time('[MATCHING ENGINE] resolveDynamicWeights');
    const [likesCount, passCount, unrepliedMatchCount, recentSwipes] = await Promise.all([
        Interaction.countDocuments({ userId: viewerId, action: 'like', createdAt: { $gte: dayjs().subtract(48, 'hour').toDate() } }),
        Interaction.countDocuments({ userId: viewerId, action: 'pass', createdAt: { $gte: dayjs().subtract(48, 'hour').toDate() } }),
        Match.countDocuments({ users: viewerId, lastMessageAt: { $exists: false } }),
        Interaction.find({ userId: viewerId }).select('_id').limit(30).lean()
    ]);
    const totalSwipes = recentSwipes.length;
    console.timeEnd('[MATCHING ENGINE] resolveDynamicWeights');

    let weights = { ...baseWeights };
    let mode = 'PRECISION'; // Default High-Efficiency Mode

    // Mode A: COLD START / DISCOVERY (First 30 swipes)
    // Goal: Broaden exploration to build user profile baseline
    if (totalSwipes < 30) {
        mode = 'DISCOVERY';
        weights.fairness *= 2.0;    // Show new/hidden users
        weights.popularity *= 0.6;  // Don't overwhelm with superstars
        weights.semantic *= 1.4;    // Trust bio keywords more
    }

    // Mode B: RECOVERY (High Pass Rate - User is getting bored/frustrated)
    // Goal: Pivot to high-certainty shared matches
    const totalRecent = likesCount + passCount;
    if (totalRecent > 10 && (passCount / totalRecent) > 0.85) {
        mode = 'RECOVERY';
        weights.interest *= 1.8;    // Show people who already liked them
        weights.semantic *= 1.5;    // Sharpen shared vibe focus
        weights.dateProb *= 0.7;    // Lower time-sensitivity, expand pool
    }

    // Mode C: OVERWHELMED (Too many open conversations)
    // Goal: Stop the "match factory", act as an elite filter
    if (unrepliedMatchCount > 4) {
        mode = 'SATIATED';
        weights.compatibility *= 1.6; // Only the mathematical "soulmates"
        weights.dateProb *= 1.4;      // Only people available "RIGHT NOW"
        weights.fairness *= 0.4;      // No more "exploring" new users
    }

    return { weights, mode };
};

const generateDailyFeed = async (viewerId, dayString = null, config = {}) => {
    // Standardize dayString: Always default to today if missing or null
    if (!dayString || dayString === 'null') {
        dayString = new Date().toISOString().split('T')[0];
    }
    // 0. Resolve Experiment Cohort (  Bucketing)
    const cohort = getCohortForUser(viewerId);
    const cohortWeights = { ...cohort.weights, ...config.weights };

    // 0.5.   Dynamic Control Layer & Context Loading (Parallelized Power Boost)
    const telemetry = {
        start: Date.now(),
        cohort: cohort.name,
        phases: {}
    };

    let viewer = config.viewer;
    let viewerProfile = config.viewerProfile;
    let viewerPrefs = config.viewerPrefs;
    let alpha = config.alpha;
    let weights, mode, allDays, allInterests;

    try {
        const contextStart = Date.now();
        const [dynamicCtx, v, vp, vpr, ar, days, interests] = await Promise.all([
            resolveDynamicWeights(viewerId, cohortWeights),
            viewer ? Promise.resolve(viewer) : User.findById(viewerId).lean(),
            viewerProfile ? Promise.resolve(viewerProfile) : UserProfile.findOne({ user_id: viewerId }).populate('dates_days gender interested_in looking_for').lean(),
            viewerPrefs ? Promise.resolve(viewerPrefs) : UserPrefs.findOne({ user_id: viewerId }).lean(),
            alpha ? Promise.resolve({ alpha }) : calculateViewerAlpha(viewerId),
            DateDay.find().lean(),
            InterestedIn.find().lean()
        ]);

        weights = dynamicCtx.weights;
        mode = dynamicCtx.mode;
        viewer = v;
        viewerProfile = vp;
        viewerPrefs = vpr;
        alpha = ar.alpha;
        allDays = days;
        allInterests = interests;

        // Store for in-memory mapping to avoid .populate()
        telemetry.allDaysMap = new Map(allDays.map(d => [d._id.toString(), d]));
        telemetry.allInterestsMap = new Map(allInterests.map(i => [i._id.toString(), i]));
        telemetry.mode = mode;
        telemetry.phases.context = Date.now() - contextStart;
        logger.info(`[MATCHING ENGINE] Starting  -Grade pipeline for ${viewerId} [MODE: ${mode}] [Context Load: ${telemetry.phases.context}ms]`);

        // 0. Cache Check (Memoization)
        // BUST CACHE if non-standard experiment config is provided (Lab Mode)
        const isCustomRun = !!(config.weights || config.alpha || config.mode || config.forceFrustration || config._bustCache);
        const cacheKey = `${viewerId}-${dayString}`;
        const cachedEntry = feedCache.get(cacheKey);

        if (!isCustomRun && cachedEntry && (Date.now() - cachedEntry.timestamp < CACHE_TTL)) {
            logger.info(`[MATCHING ENGINE] CACHE HIT for ${viewerId}`);
            return cachedEntry.data;
        }

        if (isCustomRun) {
            logger.info(`[MATCHING ENGINE] CUSTOM RUN for ${viewerId} - Bypassing Cache`);
        }

        logger.info(`[MATCHING ENGINE] Starting  -Grade pipeline for ${viewerId} [MODE: ${mode}]`);

        if (!viewer || !viewerProfile || !viewerPrefs) {
            logger.error(`[MATCHING ENGINE] Critical context missing for ${viewerId}`);
            throw new Error('Viewer context incomplete');
        }

        // 2. Load Assignment Context (from Spec Section 10)
        const S = 200; // Swipe cap
        const selectedDays = (viewerProfile.dates_days || []).map(d => ({
            id: d._id.toString(),
            name: d.name?.toLowerCase()
        }));
        const D = selectedDays.length || 1;
        const k = 2.0; // Buffer
        const target_d = Math.ceil((Math.min(S, 200) / D) * k);

        const dayAssignmentCounts = new Map();
        selectedDays.forEach(d => dayAssignmentCounts.set(d.name, 0));

        const startTime = Date.now();
        const towerStart = Date.now();
        // --- STAGE 1: THE RETRIEVAL TOWER ---
        let { query, dayDoc, appliedFilters, importantFilters } = await buildCandidateQuery(viewer, viewerPrefs, dayString, viewerProfile);
        telemetry.appliedFilters = appliedFilters;
        telemetry.importantFilters = importantFilters || [];

        // STOCHASTIC POOL ROTATION (  Fairness Rule)
        const countStart = Date.now();
        let totalCount = await UserProfile.countDocuments(query);
        telemetry.phases.count1 = Date.now() - countStart;

        let discoveryMode = 'CITY';

        // ELASTIC DISCOVERY: If results are too low (low density area), expand to Global
        // ONLY if the user has NOT specified strict distance rules
        if (totalCount < 15) {
            const isDistStrict = viewerPrefs?.distance?.opt_run_out === false;

            if (!isDistStrict) {
                const globalStart = Date.now();
                logger.info(`[MATCHING ENGINE] LOW DENSITY detected (${totalCount} users). Activating GLOBAL ELASTIC DISCOVERY.`);
                discoveryMode = 'GLOBAL';
                delete query.location; // Remove distance restriction
                totalCount = await UserProfile.countDocuments(query);
                telemetry.phases.count2 = Date.now() - globalStart;
            } else {
                logger.info(`[MATCHING ENGINE] LOW DENSITY detected (${totalCount} users), but STRICT DISTANCE prevents expansion.`);
            }
        }

        const dailySeed = `${viewerId}-${dayString}`;
        const hashStr = crypto.createHash('sha256').update(dailySeed).digest('hex');
        const stochasticOffset = totalCount > 250 ? Math.floor((parseInt(hashStr.slice(0, 8), 16) / 0xffffffff) * (totalCount - 250)) : 0;

        const findStart = Date.now();
        const candidates = await UserProfile.find(query)
            .skip(stochasticOffset)
            .limit(250)
            .populate('dates_days')
            .select('user_id name gender dates_days location profile_completeness_percent date_of_birth about_yourself idea_of_great_date main_img images updatedAt createdAt total_exposures_count religion ethnicity politics exercise diet drink smoking kids pets zodiac education_level height height_unit interested_in looking_for work occupation education intermediate_intent cultural_background languages family_plan favorite_dates hometown gender_visibility looking_for_visibility work_visibility occupation_visibility education_visibility education_level_visibility cultural_background_visibility location_visibility hometown_visibility height_visibility exercise_visibility diet_visibility drink_visibility smoking_visibility religion_visibility ethnicity_visibility politics_visibility family_plan_visibility kids_visibility pets_visibility zodiac_visibility languages_visibility')
            .lean();
        telemetry.phases.find = Date.now() - findStart;

        candidates.forEach(cand => {
            // Map about_yourself to bio for scoring logic
            cand.bio = cand.about_yourself || '';
        });

        const fetchTime = Date.now() - startTime;
        logger.info(`[MATCHING ENGINE] Tower 1 (Retrieval) finished: ${candidates.length} candidates in ${fetchTime}ms [Mode: ${discoveryMode}] [Total in DB: ${totalCount}]`);

        // Ensure we have a valid day name for ranking, even if dayString was an ID
        const targetDayOfWeek = (dayDoc ? dayDoc.name : (dayString && !mongoose.Types.ObjectId.isValid(dayString) ? dayString : dayjs().format('dddd'))).toLowerCase();
        logger.info(`[MATCHING ENGINE] targetDayOfWeek resolved to: ${targetDayOfWeek}`);

        // --- STAGE 2: THE RANKING TOWER ---
        // Goal: Apply expensive scoring and diversity logic on the retrieved pool.

        // 6. Batch Fetch Side-Car Data & Frustration Check (Parallel Power)
        const sidecarStart = Date.now();
        const candidateIds = candidates.map(c => c.user_id?._id || c.user_id).filter(id => !!id);
        const [pairStatesRaw, candidatePrefsRaw, activeMatchesRaw, candUsersRaw, trendingBoostMap, isFrustrated] = await Promise.all([
            PairState.find({ viewer_id: viewerId, candidate_id: { $in: candidateIds } }).lean(),
            UserPrefs.find({ user_id: { $in: candidateIds } }).lean(),
            Match.find({ users: viewerId, isActive: true }).lean(),
            User.find({ _id: { $in: candidateIds } }).select('lastActiveAt is_subscribed').lean(),
            calculateTrendingScores(candidateIds),
            checkUserFrustration(viewerId)
        ]);
        telemetry.phases.sidecar = Date.now() - sidecarStart;

        if (isFrustrated || config.forceFrustration) {
            logger.info(`[MATCHING ENGINE] Reciprocity Guardrail Active for ${viewerId}: Boosting high-match candidates.`);
            weights.fairness *= 2.0;
        }

        // Manual Mapping for Candidate User Data
        const candUserMap = new Map(candUsersRaw.map(u => [u._id.toString(), u]));
        candidates.forEach(c => {
            const uid = (c.user_id?._id || c.user_id)?.toString();
            if (uid) c.user_id = candUserMap.get(uid);
        });

        const allInterestedIn = Array.from(telemetry.allInterestsMap.values());

        console.time('[MATCHING ENGINE] Scoring Phase');
        logger.info(`[MATCHING ENGINE] Starting Scoring for ${candidates.length} candidates... [Sidecar: ${telemetry.phases.sidecar}ms]`);
        const pairStateMap = new Map(pairStatesRaw.map(ps => [ps.candidate_id.toString(), ps]));
        const candPrefsMap = new Map(candidatePrefsRaw.map(cp => [cp.user_id.toString(), cp]));
        const activeMatchUserIds = new Set();
        activeMatchesRaw.forEach(m => {
            m.users.forEach(u => {
                if (u.toString() !== viewerId.toString()) activeMatchUserIds.add(u.toString());
            });
        });

        const interestedInMap = new Map(allInterestedIn.map(i => [i._id.toString(), i.name]));
        telemetry.phases.retrieval = Date.now() - telemetry.start;
        logger.info(`[MATCHING ENGINE] Retrieval phase took ${telemetry.phases.retrieval}ms`);

        const scoringStart = Date.now();
        const processedCandidates = candidates.map(candidateProfile => {
            try {
                const candidateUser = candidateProfile.user_id;
                // Gating Rule: Never suggest self
                if (!candidateUser || candidateUser._id.toString() === viewerId.toString()) return null;

                // --- Post-Query Hard Gates (Manual Gating) ---

                // 1. Mutual Gender Gate: Does the candidate want someone of the viewer's gender?
                const candPrefs = candPrefsMap.get(candidateUser._id.toString()) || {};
                const candInterests = candPrefs.interested_in?.interests || [];
                const candInterestNames = candInterests.map(id => (interestedInMap.get(id.toString()) || '').toLowerCase().trim());
                const viewerGenderName = (viewerProfile.gender?.name || '').toLowerCase().trim();

                let isInterestedInViewer = false;
                if (candInterestNames.length === 0 || candInterestNames.includes('all')) {
                    isInterestedInViewer = true;
                } else {
                    // Check for semantic matches (Men/Male, Women/Female)
                    const isMaleViewer = viewerGenderName === 'male' || viewerGenderName === 'man' || viewerGenderName === 'men';
                    const isFemaleViewer = viewerGenderName === 'female' || viewerGenderName === 'woman' || viewerGenderName === 'women';
                    const isNonBinaryViewer = viewerGenderName.includes('non');

                    isInterestedInViewer = candInterestNames.some(interest => {
                        if ((interest === 'men' || interest === 'man' || interest === 'male') && isMaleViewer) return true;
                        if ((interest === 'women' || interest === 'woman' || interest === 'female') && isFemaleViewer) return true;
                        if (interest.includes('non') && isNonBinaryViewer) return true;
                        return false;
                    });
                }

                if (!isInterestedInViewer) {
                    return null;
                }

                if (activeMatchUserIds.has(candidateUser._id.toString())) return null;

                // --- Distance Calculation (Used for Comp Score) ---
                const viewerCoords = viewerPrefs.currentlocation?.coordinates || [0, 0];
                const candCoords = candidateProfile.location?.coordinates || [0, 0];
                const distanceMiles = getHaversineDistance(viewerCoords, candCoords);
                candidateProfile.distanceMiles = distanceMiles;

                // Compatibility (Mutual)
                const comp = calculateMutualCompatibility(viewerProfile, viewerPrefs, candidateProfile, candPrefs);

                // Interest & Repetition
                const pairState = pairStateMap.get(candidateUser._id.toString());
                let interest = calculateInterestScore(candidateProfile, pairState);
                const repetition = calculateRepetitionPenalty(pairState);

                // --- Guardrail ---
                if (comp.mutual_score < 35 && interest.score > 70) {
                    interest.originalScore = interest.score;
                    interest.score = 70;
                    interest.breakdown.push('guardrail_cap');
                }

                // --- Context Bonuses (Spec Compliant) ---
                // Profile completeness (Rule 4.2): round(6 * completion_percent)
                const completion = candidateProfile.profile_completeness_percent || 0;
                const qualityScore = Math.round(6 * (completion / 100));

                // Note: Rule 12 states "Missing fields NEVER reduce score". 
                // Shadow penalties for missing bio/photos are removed to be spec-compliant.

                // Deterministic Jitter (Rule 153): hash(candId + dayString)
                // This ensures the jitter is different every day but stays the same for all engine runs ON that day.
                const jitterSeed = `${candidateUser._id}-${dayString}`;
                const hash = crypto.createHash('sha256').update(jitterSeed).digest('hex');
                const tieJitter = (parseInt(hash.slice(0, 8), 16) / 0xffffffff) * 2 - 1;

                const contextBonus = 5 + qualityScore + tieJitter;

                const baseV2Score = (alpha * comp.mutual_score) + ((1 - alpha) * interest.score) + contextBonus - Math.abs(repetition);

                return {
                    ...candidateProfile,
                    baseV2Score: Math.round(baseV2Score * 10) / 10,
                    comp,
                    interest,
                    repetition,
                    qualityScore
                };
            } catch (err) {
                logger.warn(`[MATCHING ENGINE] Candidate scoring failure ${candidateProfile._id}: ${err.message}`);
                return null;
            }
        }).filter(c => c !== null);

        const processedCandidatesCount = processedCandidates.length;
        console.timeEnd('[MATCHING ENGINE] Scoring Phase');
        logger.info(`[MATCHING ENGINE] Scoring Tier 1 finished: ${processedCandidatesCount} candidates survived mutual interest & active chat gates.`);

        let dayDropCount = 0;
        const finalDeck = [];

        // --- ADAPTIVE AVAILABILITY ---
        let effectiveSelectedDays = selectedDays.length > 0 ? [...selectedDays] : allDays.map(d => ({
            id: d._id.toString(),
            name: d.name?.toLowerCase().trim()
        }));

        //   Fairness Rule: If the user is requesting a feed for a specific day (targetDayOfWeek),
        // we should ALWAYS include that day in the effective selection, even if they didn't pick it in their profile.
        // This prevents the "Blank Feed" trap when a user's availability profile is restrictive but they are active today.
        if (targetDayOfWeek && !effectiveSelectedDays.some(d => d.name === targetDayOfWeek)) {
            const todayDoc = allDays.find(d => d.name?.toLowerCase().trim() === targetDayOfWeek);
            if (todayDoc) {
                effectiveSelectedDays.push({
                    id: todayDoc._id.toString(),
                    name: todayDoc.name?.toLowerCase().trim()
                });
            }
        }

        for (const cand of processedCandidates) {
            // --- Day Assignment Strategy ---
            const candDays = (cand.dates_days || []).map(d => (d.name || '').toLowerCase().trim()).filter(n => !!n);
            const overlappingDays = effectiveSelectedDays.filter(d => candDays.includes(d.name?.toLowerCase().trim()));

            let bestDayName = null;
            if (overlappingDays.length > 0) {
                //  -Grade Deterministic Slotting & Graceful Scaling:
                // If the pool is small (< 20), we don't "hide" people on other days. 
                // We show them on EVERY day they are available to ensure a healthy feed.
                const isSmallPool = processedCandidatesCount < 20;

                if (isSmallPool) {
                    // Small Pool Rule: If they match today, they belong today.
                    if (overlappingDays.some(d => d.name?.toLowerCase().trim() === targetDayOfWeek)) {
                        bestDayName = targetDayOfWeek;
                    } else {
                        bestDayName = overlappingDays[0].name?.toLowerCase().trim();
                    }
                } else {
                    // Large Pool Rule: Deterministic Slotting for even distribution.
                    // We use the candidate's ID to ensure they stay on the same day for this viewer.
                    const slotSeed = `${viewerId}-${cand.user_id?._id || cand.user_id}`;
                    const slotHash = crypto.createHash('md5').update(slotSeed).digest('hex');
                    // Use a Larger slice for better distribution
                    const slotIndex = parseInt(slotHash.slice(0, 8), 16) % overlappingDays.length;
                    bestDayName = overlappingDays[slotIndex].name?.toLowerCase().trim();
                }
            } else {
                dayDropCount++;
            }

            if (bestDayName === targetDayOfWeek || (processedCandidatesCount < 20 && overlappingDays.some(d => d.name === targetDayOfWeek))) {
                dayAssignmentCounts.set(bestDayName, (dayAssignmentCounts.get(bestDayName) || 0) + 1);
                // --- Phase 4: Date Probability Layer (Spec Section 13) ---
                // DATE_PROB(d) = 0.45·MUTUAL_COMP + 0.25·DAY_INTENT(d) + 0.15·ACTIVITY + 0.10·FRESHNESS − 0.05·REPETITION
                const mutualComp = cand.comp.mutual_score || 0;

                // Day Intent (Did they explicitly like for this day?)
                const candId = (cand.user_id?._id || cand.user_id)?.toString();
                const ps = pairStateMap.get(candId);
                let dayIntent = 0;
                if (ps?.inbound_like_day && dayjs(ps.inbound_like_day).isSame(dayjs(dayString), 'day')) {
                    dayIntent = 100;
                } else if (ps?.last_swipe === 'like') {
                    dayIntent = 50; // Generic like
                }

                // Activity (Recency)
                const lastActive = dayjs(cand.user_id?.lastActiveAt || cand.updatedAt);
                let activitySub = 0;
                if (dayjs().diff(lastActive, 'hour') <= 24) activitySub = 100;
                else if (dayjs().diff(lastActive, 'day') <= 7) activitySub = 50;

                // Freshness (New profile or recent update)
                let freshnessSub = 0;
                if (dayjs().diff(dayjs(cand.createdAt), 'day') <= 3) freshnessSub = 100;
                else if (dayjs().diff(dayjs(cand.updatedAt), 'hour') <= 72) freshnessSub = 70;

                const dateProb = Math.min(100, Math.max(0,
                    (0.45 * mutualComp) +
                    (0.25 * dayIntent) +
                    (0.15 * activitySub) +
                    (0.10 * freshnessSub) -
                    (0.05 * Math.abs(cand.repetition))
                ));

                // FINAL_RANK_v3 = 0.55·DATE_PROB + 0.30·MUTUAL_COMP + 0.15·FAIRNESS_BOOST
                // Fairness Boost (nudge): Apply weighted multiplier from config
                const hasLowExposures = (cand.total_exposures_count || 0) < 15;
                const fairnessPart = (hasLowExposures ? 10 : 0) * weights.fairness;

                // Semantic Boost (Vibe Cluster)
                const semanticBoost = calculateSemanticVibeMatch(viewerProfile, cand) * weights.semantic;

                // Trending Boost (Collaborative Spark)
                const trendingCandId = (cand.user_id?._id || cand.user_id)?.toString();
                const trendingBoost = (trendingBoostMap.get(trendingCandId) || 0) * weights.popularity;

                // ★ Very Important Preference Boost
                // These points are added on top of the compatibility score to ensure VI matches float to the top.
                const importantBoost = (telemetry.importantFilters?.length || 0) * 15.0;

                const finalRankV3 = (weights.dateProb * dateProb) +
                    (weights.compatibility * mutualComp) +
                    (weights.interest * cand.interest.score) +
                    fairnessPart +
                    semanticBoost +
                    trendingBoost +
                    importantBoost;

                const candObj = {
                    ...cand,
                    finalScore: Math.round(finalRankV3 * 10) / 10,
                    dateProb: Math.round(dateProb * 10) / 10,
                    compatibility: Math.round(cand.comp.mutual_score),
                    match_highlights: [...(cand.comp.breakdown || []), ...(cand.interest.breakdown || [])],
                    dist_miles: Math.round(cand.distanceMiles * 10) / 10,
                    debug: {
                        alpha,
                        comp: cand.comp,
                        interest: cand.interest,
                        repetition: cand.repetition,
                        quality: cand.qualityScore,
                        total_exposures: cand.total_exposures_count || 0,
                        dateProb: Math.round(dateProb * 10) / 10,
                        assignedDay: bestDayName,
                        cohort: telemetry.cohort,
                        mode: telemetry.mode,
                        isFrustrated,
                        semanticBoost,
                        trendingScore: trendingBoost,
                        importantBoost,
                        importantFilters: telemetry.importantFilters
                    }
                };

                // Add human-readable insights for the UI
                candObj.match_insights = calculateMatchInsights(candObj, weights);

                // [REFACTOR] Premium Quality Safeguard: Karolina requested a min score threshold (45) for premium users.
                const isPremiumViewer = viewer?.is_subscribed || false;
                if (isPremiumViewer && candObj.finalScore < 45) {
                    candObj.is_low_relevance = true;
                    // Rule Check: If we wanted to strictly hide them (Option A), we would 'continue' here.
                    // For now, we go with Option B (Label) to allow the UI to decide.
                }

                finalDeck.push(candObj);
            }
        }

        logger.info(`[MATCHING ENGINE] Scoring Tier 2: ${finalDeck.length} candidates assigned to ${targetDayOfWeek}. (Dropped: ${dayDropCount} for no overlap, ${processedCandidatesCount - finalDeck.length - dayDropCount} shifted to other days)`);


        // 6.5 Background Updates (Optimized speed: Fire-and-forget)
        const finalCandIds = finalDeck.map(c => c._id);
        if (finalCandIds.length > 0) {
            const currentWeekId = dayjs(dayString).startOf('week').format('YYYY-[W]ww');

            // Increment Global Exposures
            UserProfile.updateMany(
                { _id: { $in: finalCandIds } },
                { $inc: { total_exposures_count: 1 } }
            ).catch(err => logger.error(`[MATCHING ENGINE] Global exposure update failed: ${err.message}`));

            // Update Pair-Level Exposures (Repetition Memory)
            const pairStateUpdates = finalDeck.map(cand => ({
                updateOne: {
                    filter: { viewer_id: viewerId, candidate_id: cand.user_id._id || cand.user_id },
                    update: {
                        $inc: { exposures_this_week: 1, consecutive_exposures_no_swipe: 1 },
                        $set: { last_seen_at: new Date(), week_id: currentWeekId }
                    },
                    upsert: true
                }
            }));

            PairState.bulkWrite(pairStateUpdates)
                .catch(err => logger.error(`[MATCHING ENGINE] Pair exposure update failed: ${err.message}`));
        }

        // 7. Multi-Tier Sort: [Interaction Intent] > [Distance] > [Final Score]
        finalDeck.sort((a, b) => {
            // TIER 1: HIGH INTEREST (INTENT)
            // People who 'Secretly Liked' or have very high interaction signals (>85)
            const aHighIntent = (a.interest?.score >= 85) ? 1 : 0;
            const bHighIntent = (b.interest?.score >= 85) ? 1 : 0;

            if (bHighIntent !== aHighIntent) {
                return bHighIntent - aHighIntent; // High intent always first
            }

            // TIER 2: DISTANCE (PROXIMITY)
            // After intent, closeness is the most important factor
            const distA = a.dist_miles || 999;
            const distB = b.dist_miles || 999;

            // We use a small tolerance (0.5 miles) to keep the list from being too jittery
            const bucketDistA = Math.floor(distA / 0.5);
            const bucketDistB = Math.floor(distB / 0.5);

            if (bucketDistA !== bucketDistB) {
                return bucketDistA - bucketDistB; // Closest (smaller buckets) first
            }

            // TIER 3: RELEVANCE & QUALITY
            // Final tie-breaker within the same distance bucket
            return b.finalScore - a.finalScore;
        });

        // 7.5 Archetype Diversity Pass
        // Principle: Avoid showing "10 Gym Guys" or "10 Serious Seekers" in a row.
        // If a specific 'Looking For' archetype is over-represented in the top 15, nudge others up.
        const archetypeCount = new Map();
        finalDeck.forEach((cand, idx) => {
            if (idx >= 20) return; // Only diversify the visible "Top Shelf"

            const tags = cand.looking_for?.map(t => t.name) || [];
            let diversityAdjust = 0;

            tags.forEach(tagName => {
                const count = archetypeCount.get(tagName) || 0;
                if (count >= 3) {
                    // This archetype is already well-represented in the Top 3-5
                    diversityAdjust -= (4.0 * weights.diversity);
                }
                archetypeCount.set(tagName, count + 1);
            });

            if (diversityAdjust < 0) {
                cand.finalScore = Math.max(0, cand.finalScore + diversityAdjust);
                if (cand.debug) cand.debug.diversityAdjust = diversityAdjust;
            }
        });

        // Re-sort within tiers after Diversity Adjustment
        finalDeck.sort((a, b) => {
            const aHighIntent = (a.interest?.score >= 85) ? 1 : 0;
            const bHighIntent = (b.interest?.score >= 85) ? 1 : 0;
            if (bHighIntent !== aHighIntent) return bHighIntent - aHighIntent;

            const distA = a.dist_miles || 999;
            const distB = b.dist_miles || 999;
            const bucketDistA = Math.floor(distA / 0.5);
            const bucketDistB = Math.floor(distB / 0.5);
            if (bucketDistA !== bucketDistB) return bucketDistA - bucketDistB;

            return b.finalScore - a.finalScore;
        });

        // 8. Daily Seeded Band-Shuffle (Tier-Aware)
        // We shuffle within each Intent + Distance bucket to respect the user's priority rule.
        const tieredGroups = [];
        let currentGroup = [];

        finalDeck.forEach((cand, idx) => {
            if (idx === 0) {
                currentGroup.push(cand);
                return;
            }

            const prev = finalDeck[idx - 1];
            const prevHighIntent = (prev.interest?.score >= 85) ? 1 : 0;
            const currHighIntent = (cand.interest?.score >= 85) ? 1 : 0;
            const prevBucket = Math.floor((prev.dist_miles || 999) / 0.5);
            const currBucket = Math.floor((cand.dist_miles || 999) / 0.5);

            if (prevHighIntent === currHighIntent && prevBucket === currBucket) {
                currentGroup.push(cand);
            } else {
                tieredGroups.push(currentGroup);
                currentGroup = [cand];
            }
        });
        if (currentGroup.length > 0) tieredGroups.push(currentGroup);

        const seedStr = `${viewerId}-${dayString}`;
        const shuffledDeck = [];

        tieredGroups.forEach((group, idx) => {
            // Only apply band shuffle to groups larger than 1
            if (group.length > 1) {
                const groupShuffleSeed = `${seedStr}-tier-${idx}`;
                shuffledDeck.push(...applyBandShuffle(group, groupShuffleSeed));
            } else {
                shuffledDeck.push(...group);
            }
        });

        telemetry.phases.scoring = Date.now() - scoringStart;
        const totalTime = Date.now() - telemetry.start;
        logger.info(`[MATCHING ENGINE] ${telemetry.cohort} Feed generated in ${totalTime}ms (Context: ${telemetry.phases.context}ms, C1: ${telemetry.phases.count1}ms, C2: ${telemetry.phases.count2 || 0}ms, Find: ${telemetry.phases.find}ms, Side: ${telemetry.phases.sidecar}ms, Score: ${telemetry.phases.scoring}ms)`);

        const response = {
            suggestions: shuffledDeck,
            appliedFilters: telemetry.appliedFilters || []
        };

        // 9. Cache Result
        feedCache.set(cacheKey, {
            timestamp: Date.now(),
            data: response
        });

        return response;
    } catch (criticalErr) {
        logger.error(`[MATCHING ENGINE] CRITICAL FAILURE: Falling back to safety feed. Error: ${criticalErr.message}`);
        return generateSafetyFallback(viewerId, dayString);
    }
};

/**
 *  -Grade Safety Fallback
 * Returns a basic, non-complex feed if the main engine fails.
 */
const generateSafetyFallback = async (viewerId, dayString) => {
    try {
        const viewerProfile = await UserProfile.findOne({ user_id: viewerId }).lean();
        const viewerPrefs = await UserPrefs.findOne({ user_id: viewerId }).lean();

        const { query } = await buildCandidateQuery({ _id: viewerId }, viewerPrefs, dayString, viewerProfile);
        const candidates = await UserProfile.find(query).limit(50).lean();

        return candidates.map(c => ({
            ...c,
            finalScore: 50,
            compatibility: 50,
            dateProb: 50,
            debug: { isSafetyFallback: true }
        }));
    } catch (err) {
        logger.error(`[MATCHING ENGINE] Complete System Blackout: ${err.message}`);
        return [];
    }
};


/**
 * Background Warming Utility
 * Triggers a feed generation in the background so it's cached.
 */
const warmUserCache = (viewerId) => {
    logger.info(`[MATCHING ENGINE] Pre-computing feed for user ${viewerId} (Background Warming)`);
    generateDailyFeed(viewerId).catch(err => {
        logger.error(`[MATCHING ENGINE] Background Warming Failed for ${viewerId}: ${err.message}`);
    });
};

module.exports = {
    generateDailyFeed,
    warmUserCache
};

/**
 * FUNCTION-BASED DATING APP SUGGESTION ENGINE
 * Provides personalized user recommendations based on ML-enhanced compatibility
 */

const datingEngine = require('./dating-engine.service');

// ============================================================================
// CACHE AND STATE MANAGEMENT
// ============================================================================

const { SuggestionCache, UserPrefs } = require('../models');
const inMemoryFallback = new Map();

(async function hydrateLocalCache() {
  try {
    const docs = await SuggestionCache.find({
      expiresAt: { $gt: new Date() }   // only un-expired entries
    })
      .limit(1000)                    // safety cap – adjust as you wish
      .lean();

    docs.forEach(d => inMemoryFallback.set(d.key, d.suggestions));
    console.log(`Suggestion cache hydrated with ${docs.length} entries`);
  } catch (err) {
    console.error('Cache hydration failed:', err);
  }
})();


const loadFromCache = async (key) => {
  const doc = await SuggestionCache.findOne({ key }).lean();
  return doc && doc.suggestions;
}

const saveToCache = async (key, suggestions, ttlSeconds = 3600) => {
  const expires = new Date(Date.now() + ttlSeconds * 1000);
  await SuggestionCache.findOneAndUpdate(
    { key },
    { suggestions, expiresAt: expires },
    { upsert: true, setDefaultsOnInsert: true }
  );
}


// ============================================================================
// CORE SUGGESTION FUNCTIONS
// ============================================================================

const getSuggestions = async (currentUser, candidateUsers, options = {}) => {
  const {
    diversityFactor = 0.2,
    useCache = true,
  } = options;
  const cacheKey = `${currentUser._id}`;


  if (useCache) {
    // 1) try in-process
    if (inMemoryFallback.has(cacheKey)) {
      return inMemoryFallback.get(cacheKey);
    }
    // 2) then MongoDB   (helper shown earlier)
    const hit = await loadFromCache(cacheKey);
    if (hit) {
      // also back-fill RAM so next call is faster
      inMemoryFallback.set(cacheKey, hit);
      return hit;
    }
  }

  // Calculate compatibility scores in parallel
  const scoredCandidates = await Promise.all(
    candidateUsers.map(async candidate => {
      const compatibility = await datingEngine.calculateCompatibilityScore(currentUser, candidate);
      return {
        user: candidate,
        score: compatibility.totalScore,
        factors: compatibility.factors,
        reasons: await generateReasons(compatibility.factors)
      };
    })
  );

  // Filter and rank suggestions (removed minCompatibility filter)
  const filteredCandidates = await Promise.all(
    scoredCandidates
      .map(async candidate => ({
        ...candidate,
        finalScore: await calculateFinalScore(candidate, currentUser, diversityFactor)
      }))
  );
  // const rankedSuggestions = filteredCandidates.sort((a, b) => b.finalScore - a.finalScore);
  const rankedSuggestions = filteredCandidates.sort((a, b) => a._idx - b._idx);
  const suggestions = rankedSuggestions;

  // Cache results
  if (useCache) {
    // save to RAM and MongoDB
    inMemoryFallback.set(cacheKey, suggestions);
    await saveToCache(cacheKey, suggestions);  // helper shown earlier
  }

  return suggestions;
}

const calculateFinalScore = async (candidate, currentUser, diversityFactor) => {
  const [diversityBonus, recencyBonus, activityBonus] = await Promise.all([
    calculateDiversityBonus(candidate.user, currentUser),
    calculateRecencyBonus(candidate.user),
    calculateActivityBonus(candidate.user)
  ]);

  return candidate.score +
    (diversityBonus * diversityFactor) +
    (recencyBonus * 0.1) +
    (activityBonus * 0.1);
}

// ============================================================================
// COMPATIBILITY ANALYSIS
// ============================================================================

const generateReasons = async (factors) => {
  const reasonMap = [
    { threshold: 0.8, key: 'location', reason: "You're in the same area" },
    { threshold: 0.8, key: 'age', reason: "Similar age range" },
    { threshold: 0.8, key: 'lifestyle', reason: "Compatible lifestyle choices" },
    { threshold: 0.7, key: 'dateActivity', reason: "Shared date preferences" },
    { threshold: 0.7, key: 'dateDays', reason: "Available on same days" },
    { threshold: 0.7, key: 'additional', reason: "Common interests and values" },
    { threshold: 0.6, key: 'ml', reason: "AI predicts good chemistry" }
  ];

  const reasons = await Promise.all(
    reasonMap
      .filter(({ threshold, key }) => factors[key] > threshold)
      .map(async ({ reason }) => reason)
  );

  return reasons.length > 0 ? reasons : ["Potential for connection"];
}

const calculateDiversityBonus = async (candidate, currentUser) => {
  const [ethnicityBonus, religionBonus, interestBonus] = await Promise.all([
    Promise.resolve(candidate.ethnicity !== currentUser.ethnicity ? 0.1 : 0),
    Promise.resolve(candidate.religion !== currentUser.religion ? 0.05 : 0),
    Promise.resolve().then(() => {
      const candidateInterests = Object.values(candidate.favorite_dates || {});
      const userInterests = Object.values(currentUser.favorite_dates || {});
      const uniqueInterests = candidateInterests.filter(i => !userInterests.includes(i));
      return Math.min(uniqueInterests.length * 0.02, 0.1);





    })
  ]);

  return ethnicityBonus + religionBonus + interestBonus;
}

const calculateRecencyBonus = async (candidate) => {

  return Promise.resolve().then(() => {
    const lastUpdate = new Date(candidate.updatedAt || candidate.createdAt);
    const daysSince = (Date.now() - lastUpdate) / (1000 * 60 * 60 * 24);

    if (daysSince <= 1) return 0.1;
    if (daysSince <= 3) return 0.05;
    if (daysSince <= 7) return 0.02;
    return 0;
  });
}

const calculateActivityBonus = async (candidate) => {
  // Replace with real activity data integration
  return Promise.resolve(Math.random() * 0.1);
}

// ============================================================================
// CATEGORIZED SUGGESTIONS
// ============================================================================

const getSuggestionsByCategory = async (currentUser, candidateUsers) => {
  const allSuggestions = await getSuggestions(currentUser, candidateUsers, { limit: 50 });

  const [newFaces, nearbyUsers, similarInterests, recentlyActive] = await Promise.all([
    getNewFaces(allSuggestions),
    getNearbyUsers(allSuggestions),
    getSimilarInterests(allSuggestions),
    getRecentlyActive(allSuggestions)
  ]);

  return {
    topMatches: allSuggestions.slice(0, 5),
    newFaces,
    nearbyUsers,
    similarInterests,
    recentlyActive
  };
}

const getNewFaces = async (suggestions) => {
  return Promise.resolve(suggestions.slice(5, 10));
}

const getNearbyUsers = async (suggestions) => {
  return Promise.resolve(
    suggestions
      .filter(s => s.factors.location > 0.8)
      .slice(0, 5)
  );
}

const getSimilarInterests = async (suggestions) => {
  return Promise.resolve(
    suggestions
      .filter(s => s.factors.dateActivity > 0.6)
      .slice(0, 5)
  );
}

const getRecentlyActive = async (suggestions) => {
  return Promise.resolve(
    suggestions
      .sort((a, b) => new Date(b.user.updatedAt) - new Date(a.user.updatedAt))

      .slice(0, 5)
  );
}

// ============================================================================
// MACHINE LEARNING INTEGRATION
// ============================================================================

const learnFromInteraction = async (currentUser, targetUser, action) => {
  await Promise.all([
    trainMLModel(currentUser, targetUser, action),
    updateUserPreferences(currentUser._id, targetUser, action)
  ]);

  clearUserCache(currentUser._id);
}

const updateUserPreferences = async (userId, targetUser, action) => {

  let prefs = await UserPrefs.findOne({ userId });
  if (!prefs) prefs = await new UserPrefs({ userId });
  if (action === 'like' || action === 'superlike') {
    prefs.likedAges.push(calculateAge(targetUser.date_of_birth));
    prefs.likedLocations.push(targetUser.city);
    prefs.likedInterests.push(...Object.values(targetUser.favorite_dates || {}));
  } else if (action === 'pass') {
    prefs.dislikedTraits.push({
      age: calculateAge(targetUser.date_of_birth),
      location: targetUser.city,
      lifestyle: [targetUser.diet, targetUser.exercise, targetUser.smoking]
    });
  }
  await prefs.save();
}

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

const clearUserCache = (userId) => {
  for (const key of inMemoryFallback.keys()) {
    if (key.startsWith(userId)) {
      inMemoryFallback.delete(key);
    }
  }
}

const clearAllCache = () => {
  inMemoryFallback.clear();
}

// ============================================================================
// ANALYTICS AND STATISTICS
// ============================================================================

const getSuggestionStats = async (suggestions) => {
  if (!suggestions.length) return { totalSuggestions: 0, avgCompatibility: 0, topReasons: [], qualityScore: 0 };

  const [topReasons, qualityScore] = await Promise.all([
    getTopReasons(suggestions),
    calculateQualityScore(suggestions)
  ]);

  const totalSuggestions = suggestions.length;
  const avgCompatibility = suggestions.reduce((sum, s) => sum + s.score, 0) / totalSuggestions;

  return {
    totalSuggestions,
    avgCompatibility: Math.round(avgCompatibility * 100),
    topReasons,
    qualityScore
  };
}

const getTopReasons = async (suggestions) => {
  return Promise.resolve().then(() => {
    const reasonCounts = {};

    suggestions.forEach(s => {
      s.reasons.forEach(reason => {
        reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
      });
    });

    return Object.entries(reasonCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([reason]) => reason);
  });
}

const calculateQualityScore = async (suggestions) => {
  if (suggestions.length === 0) return 0;

  const [avgScore, diversity, recency] = await Promise.all([
    Promise.resolve(suggestions.reduce((sum, s) => sum + s.score, 0) / suggestions.length),
    Promise.resolve(new Set(suggestions.map(s => s.user.ethnicity)).size / suggestions.length),
    Promise.resolve(suggestions.filter(s =>
      (Date.now() - new Date(s.user.updatedAt)) < 7 * 24 * 60 * 60 * 1000
    ).length / suggestions.length)
  ]);

  return Math.round((avgScore * 0.6 + diversity * 0.2 + recency * 0.2) * 100);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  return Math.floor((Date.now() - new Date(dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000));
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  getSuggestions,
  getSuggestionsByCategory,
  learnFromInteraction,
  getSuggestionStats,
  clearUserCache,
  clearAllCache,
  generateReasons,
  calculateDiversityBonus,
  calculateRecencyBonus,
  calculateActivityBonus
};
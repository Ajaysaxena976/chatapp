const { Interaction, MLModelWeights } = require('../models');

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEFAULT_WEIGHT_CONFIG = {
  location: 0.20,      // 📍 ADDED: Location is a high-priority factor
  age: 0.15,           // Reduced
  lifestyle: 0.25,     // Reduced
  dateActivity: 0.15,  // Reduced
  activity: 0.05,
  additional: 0.10,
  dateDays: 0.10       // Reduced
};

// Activity scoring thresholds



const ACTIVITY_THRESHOLDS = {
  VERY_ACTIVE: { days: 3, score: 1.0 },
  ACTIVE: { days: 7, score: 0.8 },
  MODERATE: { days: 14, score: 0.6 },
  LOW: { days: 30, score: 0.3 },
  INACTIVE: { score: 0.1 }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getHaversineDistance = (coords1, coords2) => {
  const toRad = (x) => x * Math.PI / 180;
  const R = 6371; // Earth's radius in kilometers

  const dLat = toRad(coords2[1] - coords1[1]);
  const dLon = toRad(coords2[0] - coords1[0]);
  const lat1 = toRad(coords1[1]);
  const lat2 = toRad(coords2[1]);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in kilometers
}

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;

  const birth = new Date(dateOfBirth);
  if (isNaN(birth.getTime())) {
    throw new Error('Invalid date of birth provided');
  }

  const today = new Date();
  if (birth > today) {
    throw new Error('Date of birth cannot be in the future');
  }

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

const getAgeRange = (age, ageWeight = DEFAULT_WEIGHT_CONFIG.age) => {
  if (!age || age <= 0) return { min: 18, max: 80 };

  const baseRangePercent = 0.4;
  const weightedPercent = baseRangePercent * (1 - ageWeight) + 0.1;
  const rangeOffset = age * weightedPercent * 0.5;

  return {
    min: Math.max(18, Math.floor(age - rangeOffset)),
    max: Math.min(80, Math.ceil(age + rangeOffset))
  };
}


const calculateDateDaysCompatibility = (profile1, profile2) => {
  try {
    // Expecting profile.available_days to be an array like ['saturday', 'sunday', 'friday']
    const days1 = profile1.dates_days || [];
    const days2 = profile2.dates_days || [];

    // If either user hasn't specified days, return neutral score
    if (days1.length === 0 || days2.length === 0) {
      return 0.5;
    }

    // Convert to lowercase and create sets for comparison
    const set1 = new Set(days1.map(day => day?.name.toLowerCase()));
    const set2 = new Set(days2.map(day => day?.name.toLowerCase()));

    // Find overlapping days
    const overlappingDays = [...set1].filter(day => set2.has(day));
    const totalUniqueDays = new Set([...set1, ...set2]).size;

    // No overlapping days = incompatible
    if (overlappingDays.length === 0) {
      return 0;
    }



    // Calculate compatibility based on overlap ratio
    const overlapRatio = overlappingDays.length / Math.max(set1.size, set2.size);

    // Bonus for weekend overlap (friday, saturday, sunday)
    const weekendDays = ['friday', 'saturday', 'sunday'];
    const weekendOverlap = overlappingDays.filter(day => weekendDays.includes(day)).length;
    const weekendBonus = weekendOverlap > 0 ? 0.1 : 0;

    // Score calculation: base overlap + weekend bonus
    const baseScore = Math.min(0.9, overlapRatio + weekendBonus);

    return Math.max(0.1, baseScore); // Minimum score for any overlap

  } catch (error) {
    console.error('Error calculating dating days compatibility:', error);
    return 0.5;
  }
}

// ============================================================================
// ML MODEL PERSISTENCE
// ============================================================================

const saveModelToDB = async (mlModel) => {
  try {
    let doc = await MLModelWeights.findOne();
    if (!doc) doc = new MLModelWeights();

    Object.assign(doc, {
      weights: mlModel.weights,
      bias: mlModel.bias,
      updatedAt: new Date()
    });

    await doc.save();
    console.log('ML model weights saved to DB.');
  } catch (error) {
    console.error('Error saving ML model:', error);
  }
}

const loadModelFromDB = async (mlModel) => {
  try {
    const doc = await MLModelWeights.findOne();
    if (doc) {
      mlModel.weights = doc.weights;
      mlModel.bias = doc.bias;
      console.log('ML model weights loaded from DB.');
    } else {
      console.warn('No ML model data found in DB, starting fresh.');
    }
  } catch (error) {

    console.error('Error loading ML model:', error);
  }
}

// ============================================================================
// COMPATIBILITY SCORING FUNCTIONS
// ============================================================================

const calculateLocationCompatibility = (profile1, profile2) => {
  try {
    // Assuming location is stored like: profile.location = { lat: 40.7128, lng: -74.0060 }
    const loc1 = profile1.location;
    const loc2 = profile2.location;

    if (!loc1 || !loc1.coordinates || loc1.coordinates.length < 1 || !loc2 || !loc2.coordinates || loc2.coordinates.length < 1) {
      return 0.5; // Neutral score if location data is missing
    }

    const distance = getHaversineDistance(loc1, loc2); // in km

    const MAX_ACCEPTABLE_DISTANCE = 100; // Configurable: max distance in km for any compatibility
    const IDEAL_DISTANCE = 5; // Configurable: distance in km to be considered a perfect match

    if (distance <= IDEAL_DISTANCE) {
      return 1.0;
    }
    if (distance > MAX_ACCEPTABLE_DISTANCE) {
      return 0.0;
    }

    // Decrease score linearly from ideal to max distance
    const score = 1 - ((distance - IDEAL_DISTANCE) / (MAX_ACCEPTABLE_DISTANCE - IDEAL_DISTANCE));

    return Math.max(0, score);

  } catch (error) {
    console.error('Error calculating location compatibility:', error);
    return 0.5; // Return neutral score on error
  }
}

const calculateAgeCompatibility = (profile1, profile2) => {
  try {

    const age1 = calculateAge(profile1.date_of_birth);
    const age2 = calculateAge(profile2.date_of_birth);

    if (!age1 || !age2) return 0.5;

    const range1 = getAgeRange(age1);
    const range2 = getAgeRange(age2);

    const withinRange1 = age2 >= range1.min && age2 <= range1.max;
    const withinRange2 = age1 >= range2.min && age1 <= range2.max;

    if (!withinRange1 || !withinRange2) return 0;

    const ageDifference = Math.abs(age1 - age2);
    return Math.max(0.3, 1 - (ageDifference / 25));
  } catch (error) {
    console.error('Error calculating age compatibility:', error);
    return 0.5;
  }
}

const calculateLifestyleCompatibility = (profile1, profile2) => {
  try {
    const lifestyleFactors = [
      { field: 'exercise', matchScore: 1, mismatchScore: 0.3 },
      { field: 'diet', matchScore: 1, mismatchScore: 0.2 },
      { field: 'drink', matchScore: 1, mismatchScore: 0.3 },
      { field: 'smoking', matchScore: 1, mismatchScore: 0.1 }
    ];

    let totalScore = 0;
    let factorCount = 0;

    lifestyleFactors.forEach(({ field, matchScore, mismatchScore }) => {
      if (profile1[field] && profile2[field]) {

        factorCount++;
        const isMatch = profile1[field]?.name.toString() === profile2[field]?.name.toString();
        totalScore += isMatch ? matchScore : mismatchScore;
      }
    });

    return factorCount > 0 ? totalScore / factorCount : 0.5;
  } catch (error) {
    console.error('Error calculating lifestyle compatibility:', error);
    return 0.5;
  }
}

const calculateDateActivityCompatibility = (profile1, profile2) => {
  try {
    const categories = ['food_and_drink', 'active_and_outdoor', 'fun', 'chill_and_cosy'];
    let totalScore = 0;
    let categoryCount = 0;

    categories.forEach(category => {
      const activity1 = profile1.favorite_dates?.[category]?.name;
      const activity2 = profile2.favorite_dates?.[category]?.name;

      if (activity1 && activity2) {
        categoryCount++;
        const isMatch = activity1.toString() === activity2.toString();
        totalScore += isMatch ? 1 : 0.2;
      }
    });

    return categoryCount > 0 ? totalScore / categoryCount : 0.5;
  } catch (error) {
    console.error('Error calculating date activity compatibility:', error);
    return 0.5;
  }
}

const calculateActivityScore = (profile) => {
  try {
    const lastUpdate = profile.updatedAt || profile.createdAt;
    if (!lastUpdate) return 0.5;

    const daysSinceUpdate = (Date.now() - new Date(lastUpdate)) / (1000 * 60 * 60 * 24);

    if (daysSinceUpdate <= ACTIVITY_THRESHOLDS.VERY_ACTIVE.days) return ACTIVITY_THRESHOLDS.VERY_ACTIVE.score;
    if (daysSinceUpdate <= ACTIVITY_THRESHOLDS.ACTIVE.days) return ACTIVITY_THRESHOLDS.ACTIVE.score;
    if (daysSinceUpdate <= ACTIVITY_THRESHOLDS.MODERATE.days) return ACTIVITY_THRESHOLDS.MODERATE.score;
    if (daysSinceUpdate <= ACTIVITY_THRESHOLDS.LOW.days) return ACTIVITY_THRESHOLDS.LOW.score;
    return ACTIVITY_THRESHOLDS.INACTIVE.score;
  } catch (error) {
    console.error('Error calculating activity score:', error);
    return 0.5;
  }
}

const calculateAdditionalCompatibility = (profile1, profile2) => {
  const additionalFactors = [
    { field: 'ethnicity', matchScore: 1, mismatchScore: 0.3 },
    { field: 'family_plan', matchScore: 1, mismatchScore: 0.3 },
    { field: 'looking_for', matchScore: 1, mismatchScore: 0 },
    { field: 'religion', matchScore: 1, mismatchScore: 0.3 }
  ];

  let totalScore = 0;
  let factorCount = 0;

  additionalFactors.forEach(({ field, matchScore, mismatchScore }) => {
    if (profile1[field]?.name && profile2[field]?.name) {
      factorCount++;
      const isMatch = profile1[field].name.toString() === profile2[field].name.toString();
      totalScore += isMatch ? matchScore : mismatchScore;
    }
  });

  // Handle languages separately
  if (profile1.languages && profile2.languages && Array.isArray(profile1.languages) && Array.isArray(profile2.languages)) {
    factorCount++;
    const set1 = new Set(profile1.languages.filter(l => l?.name).map(l => l.name.toString()));
    const set2 = new Set(profile2.languages.filter(l => l?.name).map(l => l.name.toString()));
    const intersection = [...set1].filter(x => set2.has(x)).length;
    const union = new Set([...set1, ...set2]).size;
    totalScore += union > 0 ? intersection / union : 0;
  }

  return factorCount > 0 ? totalScore / factorCount : 0.5;
}

// ============================================================================
// MACHINE LEARNING INTEGRATION
// ============================================================================

const extractMLFeatures = (profile1, profile2) => {
  const age1 = calculateAge(profile1.date_of_birth) || 25;
  const age2 = calculateAge(profile2.date_of_birth) || 25;
  const maxAgeDiff = 50;
  const ageDiffNorm = Math.abs(age1 - age2) / maxAgeDiff;
  let locationScore = 0.5;
  if (profile1.location && profile2.location) {
    const distance = getHaversineDistance(profile1.location, profile2.location);
    const maxDistanceForML = 500; // Use a slightly larger max distance for ML normalization
    locationScore = Math.max(0, 1 - (distance / maxDistanceForML));
  }


  return [
    1 - ageDiffNorm,
    locationScore,
    // profile1.city === profile2.city ? 1 : 0,  // REMOVE THIS LINE
    profile1.diet?.name === profile2.diet?.name ? 1 : 0,
    profile1.exercise?.name === profile2.exercise?.name ? 1 : 0,
    profile1.smoking?.name === profile2.smoking?.name ? 1 : 0,
    profile1.drink?.name === profile2.drink?.name ? 1 : 0,

    calculateActivityScore(profile1),
    calculateActivityScore(profile2),
    calculateDateDaysCompatibility(profile1, profile2) // New ML feature
  ];
}

// Helper function to validate and format available days
const formatAvailableDays = (days) => {
  const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  if (!Array.isArray(days)) return [];

  return days
    .map(day => day.toLowerCase().trim())
    .filter(day => validDays.includes(day));
}

// Helper to get day compatibility details
const getDateDaysDetails = (profile1, profile2) => {
  const days1 = new Set(formatAvailableDays(profile1.available_days || []));
  const days2 = new Set(formatAvailableDays(profile2.available_days || []));

  const overlapping = [...days1].filter(day => days2.has(day));
  const user1Only = [...days1].filter(day => !days2.has(day));
  const user2Only = [...days2].filter(day => !days1.has(day));

  return {
    overlappingDays: overlapping,
    user1ExclusiveDays: user1Only,
    user2ExclusiveDays: user2Only,
    hasWeekendOverlap: overlapping.some(day => ['friday', 'saturday', 'sunday'].includes(day))
  };
}


class LogisticRegressionModel {
  constructor(featureCount) {
    this.weights = Array(featureCount).fill(0).map(() => Math.random() * 0.01);
    this.bias = 0;
  }

  sigmoid(z) {
    return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, z))));
  }

  predict(features) {
    const z = this.bias + features.reduce((sum, feature, i) => sum + this.weights[i] * feature, 0);
    return this.sigmoid(z);
  }

  updateWeights(features, actualOutcome, learningRate = 0.01) {
    const prediction = this.predict(features);
    const error = actualOutcome - prediction;

    features.forEach((feature, i) => {
      this.weights[i] += learningRate * error * feature;
    });
    this.bias += learningRate * error;
  }
}

// Global ML model instance
let mlModel = new LogisticRegressionModel(9);

const calculateMLCompatibilityScore = async (profile1, profile2) => {
  const features = extractMLFeatures(profile1, profile2);
  return mlModel.predict(features);
}


const trainMLModel = async (profile1, profile2, userAction, interactionData = {}) => {
  const features = extractMLFeatures(profile1, profile2);
  const outcome = userAction === 'like' || userAction === 'superlike' ? 1 : 0;

  // Enhanced ML training with behavioral data
  let adjustedOutcome = outcome;

  if (interactionData.timeSpentViewing) {
    // Users who spend more time viewing and then like = higher weight
    const timeBonus = Math.min(interactionData.timeSpentViewing / 30, 1); // Normalize to 30 seconds
    adjustedOutcome += (timeBonus * 0.1);
  }

  if (interactionData.swipeVelocity) {
    // Rapid swipes are weighted less than deliberate ones
    const velocityPenalty = Math.max(0, 1 - (interactionData.swipeVelocity / 5)); // Normalize to 5 swipes/sec
    adjustedOutcome *= velocityPenalty;
  }

  mlModel.updateWeights(features, adjustedOutcome);
  await saveModelToDB(mlModel);
}

// ============================================================================
// ADVANCED ML FUNCTIONS
// ============================================================================

const predictUserLikelihood = (userHistory, targetProfile) => {
  if (!userHistory.length) return 0.5;
  return mlModel.predict(extractMLFeatures(userHistory[0].user, targetProfile));
}

const analyzeProfilePhotos = (photos) => {
  return {
    attractivenessScore: Math.random() * 0.3 + 0.7,
    authenticityScore: Math.random() * 0.2 + 0.8,
    qualityScore: Math.random() * 0.4 + 0.6
  };
}

const predictConversationSuccess = (user1, user2, messageHistory = []) => {
  const compatibility = mlModel.predict(extractMLFeatures(user1, user2));

  const messageQuality = messageHistory.length > 0 ? 0.8 : 0.5;
  return (compatibility + messageQuality) / 2;
}

const detectFakeProfile = (profile, behaviorData = {}) => {
  const suspiciousFactors = [
    !profile.photos || profile.photos.length < 2,
    !profile.bio || profile.bio.length < 10,
    behaviorData.rapidSwipes > 100,
    behaviorData.noMessages
  ];
  return suspiciousFactors.filter(Boolean).length / suspiciousFactors.length;
}

const predictOptimalNotificationTime = (userActivity = {}) => {
  const activeHours = userActivity.mostActiveHours || [19, 20, 21];
  const currentHour = new Date().getHours();
  return activeHours.includes(currentHour) ? 1.0 : 0.3;
}

const recommendDateIdeas = (couple, preferences = {}) => { // Remove location parameter
  const commonInterests = findCommonInterests(couple[0], couple[1]);
  return {
    restaurant: commonInterests.includes('food') ? 'Italian Restaurant' : 'Coffee Shop',
    activity: commonInterests.includes('outdoor') ? 'Park Walk' : 'Museum Visit',
    confidence: 0.8
  };
}

const findCommonInterests = (user1, user2) => {
  const interests1 = Object.values(user1.favorite_dates || {});
  const interests2 = Object.values(user2.favorite_dates || {});
  return interests1.filter(i => interests2.includes(i));
}

// ============================================================================
// MAIN COMPATIBILITY CALCULATION
// ============================================================================

const calculateCompatibilityScore = async (profile1, profile2, weightConfig = DEFAULT_WEIGHT_CONFIG, useML = true) => {
  try {
    const scores = {
      location: calculateLocationCompatibility(profile1, profile2),
      age: calculateAgeCompatibility(profile1, profile2),
      lifestyle: calculateLifestyleCompatibility(profile1, profile2),
      dateActivity: calculateDateActivityCompatibility(profile1, profile2),
      activity: calculateActivityScore(profile2),
      additional: calculateAdditionalCompatibility(profile1, profile2),
      dateDays: calculateDateDaysCompatibility(profile1, profile2) // New factor
    };

    let totalScore = Object.entries(scores).reduce((sum, [key, score]) => {
      return sum + (score * weightConfig[key]);
    }, 0);

    // ML Enhancement
    if (useML) {
      const mlScore = await calculateMLCompatibilityScore(profile1, profile2);
      scores.ml = mlScore;
      totalScore = (totalScore * 0.7) + (mlScore * 0.3);
    }

    return {
      totalScore: Math.min(totalScore, 1.0),
      factors: scores
    };
  } catch (error) {
    console.error('Error calculating compatibility:', error);
    return { totalScore: 0, factors: {} };
  }
}


// ============================================================================
// INITIALIZATION
// ============================================================================

const initializeModel = async () => {
  await loadModelFromDB(mlModel);
}


// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  DEFAULT_WEIGHT_CONFIG,
  calculateAge,
  getAgeRange,
  // calculateLocationCompatibility,
  calculateAgeCompatibility,
  calculateLifestyleCompatibility,
  calculateDateActivityCompatibility,
  calculateActivityScore,
  calculateAdditionalCompatibility,
  calculateCompatibilityScore,
  extractMLFeatures,
  calculateMLCompatibilityScore,
  trainMLModel,
  mlModel,
  predictUserLikelihood,
  analyzeProfilePhotos,
  predictConversationSuccess,
  detectFakeProfile,
  predictOptimalNotificationTime,
  recommendDateIdeas,
  calculateDateDaysCompatibility, // New export
  formatAvailableDays,            // New export
  getDateDaysDetails,             // New export
  initializeModel,
  calculateLocationCompatibility
};
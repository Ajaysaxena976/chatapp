const { getSuggestions: getEngineSuggestions, getSuggestionsByCategory: getEngineCategorized, getSuggestionStats: getEngineStats, clearUserCache } = require('./suggestion-engine.service');
const { generateDailyFeed } = require('./matching-engine/pipeline.service');
const { Interaction, User, UserProfile, UserPrefs, InterestedIn, UserLimit, DatingSwipeConfig, Gender } = require('../models');
const logger = require('../config/logger');
const { sanitizeForLog } = logger;
const { Types } = require("mongoose");
const ApiError = require('../utils/api-error');
const httpStatus = require('http-status');

// ============================================================================
// DATA ACCESS LAYER
// ============================================================================

const getUserSwipeMeetCounts = async (user_id, dateDay) => {
  try {
    const userObjectId = Types.ObjectId.isValid(user_id)
      ? new Types.ObjectId(user_id)
      : user_id;

    const dateDayObjectId = Types.ObjectId.isValid(dateDay)
      ? new Types.ObjectId(dateDay)
      : dateDay;

    const swipeCount = await UserLimit.findOne({ user_id: userObjectId });
    const checkUserLimits = await DatingSwipeConfig.findOne();

    // MEET = like
    const today_meet_count = await Interaction.countDocuments({
      userId: userObjectId,
      date_days: dateDayObjectId,
      action: "like"
    });

    // SWIPE = any action
    const today_swipe_count = await Interaction.countDocuments({
      userId: userObjectId,
      date_days: dateDayObjectId,
      action: "pass"
    });

    return {
      week_swipe_count: checkUserLimits?.swipe_max_limit ?? 0,
      day_meet_count: checkUserLimits?.daily_meet_limit ?? 0,
      today_meet_count,
      today_swipe_count,
      total_swipe_count: swipeCount?.swipe_count ?? 0,
      total_meet_count: swipeCount?.meet_count ?? 0
    };
  } catch (error) {
    throw error;
  }
};



const getInteractedUserIds = async (userId) => {
  try {
    const interactions = await Interaction
      .find({ userId })
      .select('targetUserId')
      .lean();

    return interactions.map(i => i.targetUserId);
  } catch (error) {
    console.error('Error getting interacted user IDs:', error);
    return [];
  }
};

const lengthUnitConverter = (value, fromUnit) => {
  const CONVERSION_FACTOR = 30.48; // cm per foot
  switch (fromUnit.toLowerCase()) {
    case 'cm':
      return {
        value: value / CONVERSION_FACTOR,
        unit: 'feet'
      };
    case 'feet':
      return {
        value: value * CONVERSION_FACTOR,
        unit: 'cm'
      };
    default:
      return {
        error: 'Invalid unit. Please use "cm" or "feet".'
      };
  }
}

const buildPreferenceQuery = (userPrefs, isAdvanced = false) => {
  const query = {};
  // Age filter
  if (userPrefs.age &&
    userPrefs.age.opt_run_out === false &&
    typeof userPrefs.age.min === "number" &&
    typeof userPrefs.age.max === "number") {
    const currentDate = new Date();
    const minDate = new Date(currentDate.getFullYear() - userPrefs.age.max, currentDate.getMonth(), currentDate.getDate());
    const maxDate = new Date(currentDate.getFullYear() - userPrefs.age.min, currentDate.getMonth(), currentDate.getDate());
    query.date_of_birth = { $gte: minDate, $lte: maxDate };
  }

  // Distance filter
  // if (userPrefs.distance && !userPrefs.distance.opt_run_out && userPrefs.currentlocation) {
  if (
    userPrefs.distance &&
    // userPrefs.distance.opt_run_out === false &&
    typeof userPrefs.distance.value === "number" &&
    userPrefs.currentlocation &&
    Array.isArray(userPrefs.currentlocation.coordinates) &&
    userPrefs.currentlocation.coordinates.length === 2
  ) {
    query.location = {
      $near: {
        $geometry: userPrefs.currentlocation,
        $maxDistance: userPrefs.distance.value * 1000
      }
    };
  }

  if (true) {
    // Loop through all preference filters
    const filters = [
      { pref: 'looking_for', key: 'looking' },
      { pref: 'exercise', key: 'exercises' },
      { pref: 'diet', key: 'diets' },
      { pref: 'drink', key: 'drinks' },
      { pref: 'smoking', key: 'smokings' },
      { pref: 'religion', key: 'religions' },
      { pref: 'ethnicity', key: 'ethnicities' },
      { pref: 'family_plan', key: 'family_plans' },
      { pref: 'kids', key: 'kids' },
      { pref: 'zodiac', key: 'zodiacs' },
      { pref: 'languages', key: 'languages' },
      { pref: 'politics', key: 'politics' },
      { pref: 'education_level', key: 'education_levels' },
      { pref: 'interested_in', key: 'interests' },
      { pref: 'cultural_background', key: 'cultural_backgrounds' }
    ];

    filters.forEach(({ pref, key }) => {
      const p = userPrefs[pref];
      if (p && p.isImportant && Array.isArray(p[key]) && p[key].length > 0) {
        query[pref] = { $in: p[key] };
      }
    });

    console.log('Final Query =>', query);

    // Height filter
    if (userPrefs.height?.min && userPrefs.height?.max) {
      const minHeight = userPrefs.height.unit === 'ft' ? userPrefs.height.min * 30.48 : userPrefs.height.min;
      const maxHeight = userPrefs.height.unit === 'ft' ? userPrefs.height.max * 30.48 : userPrefs.height.max;
      query.height = { $gte: minHeight, $lte: maxHeight };
    }
  }

  return query;
};

const getCandidateUsers = async (userId, excludeIds, dateDay) => {
  try {
    const allExcludeIds = [
      Types.ObjectId(userId),
      ...excludeIds.map(id => Types.ObjectId(id))
    ];

    let matchQuery = {
      user_id: { $nin: allExcludeIds }
    };

    if (dateDay) {
      const days = Array.isArray(dateDay) ? dateDay : [dateDay];
      matchQuery.dates_days = { $in: days.map(id => Types.ObjectId(id)) };
    }

    const user = await User.findById(userId).lean();
    const isAdvanceFilterApplied = !!user?.is_subscribed;

    const userPrefs = await UserPrefs.findOne({ user_id: userId }).lean();
    if (userPrefs) {
      Object.assign(
        matchQuery,
        buildPreferenceQuery(userPrefs, isAdvanceFilterApplied)
      );
    }

    const profiles = await UserProfile.aggregate([
      { $match: matchQuery },

      // ================= USER JOIN =================
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },

      {
        $match: {
          "user.is_detailed_submit": true,
          "user.is_registered": true,
          "user.is_mobile_verified": true
        }
      },

      // ================= POPULATIONS =================
      ...lookup("diet", "diets"),
      ...lookup("exercise", "exercises"),
      ...lookup("smoking", "smokings"),
      ...lookup("drink", "drinks"),
      ...lookup("ethnicity", "ethnicities"),
      ...lookup("religion", "religions"),
      ...lookup("gender", "genders"),
      ...lookup("kids", "kids"),
      ...lookup("pets", "pets"),
      ...lookup("zodiac", "zodiacs"),
      ...lookup("politics", "politics"),
      ...lookup("family_plan", "familyplans"),
      ...lookup("education_level", "educationlevels"),
      ...lookup("cultural_background", "culturalbackgrounds"),

      ...lookupArray("looking_for", "lookingfors"),
      ...lookupArray("favorite_dates", "dateactivities"),
      ...lookupArray("languages", "languages"),
      ...lookupArray("dates_days", "datedays"),

      // ================= MERGE LOOKUPS =================
      {
        $addFields: {
          diet: { $arrayElemAt: ["$dietLookup", 0] },
          exercise: { $arrayElemAt: ["$exerciseLookup", 0] },
          smoking: { $arrayElemAt: ["$smokingLookup", 0] },
          drink: { $arrayElemAt: ["$drinkLookup", 0] },
          ethnicity: { $arrayElemAt: ["$ethnicityLookup", 0] },
          religion: { $arrayElemAt: ["$religionLookup", 0] },
          gender: { $arrayElemAt: ["$genderLookup", 0] },
          kids: { $arrayElemAt: ["$kidsLookup", 0] },
          pets: { $arrayElemAt: ["$petsLookup", 0] },
          zodiac: { $arrayElemAt: ["$zodiacLookup", 0] },
          politics: { $arrayElemAt: ["$politicsLookup", 0] },
          family_plan: { $arrayElemAt: ["$family_planLookup", 0] },
          education_level: { $arrayElemAt: ["$education_levelLookup", 0] },
          cultural_background: { $arrayElemAt: ["$cultural_backgroundLookup", 0] },

          looking_for: "$looking_forLookup",
          favorite_dates: "$favorite_datesLookup",
          languages: "$languagesLookup",
          dates_days: "$dates_daysLookup"
        }
      },

      // ================= FINAL SHAPE =================
      {
        $project: {
          // ✅ KEEP PROFILE ID
          _id: "$_id",

          // ✅ USER ID
          user_id: "$user._id",

          // ========= PROFILE DATA =========
          profile: {
            name: "$name",
            date_of_birth: "$date_of_birth",

            gender: "$gender",
            gender_visibility: "$gender_visibility",

            interested_in: "$interested_in",

            looking_for: "$looking_for",
            looking_for_visibility: "$looking_for_visibility",

            work: "$work",
            work_visibility: "$work_visibility",

            bio: "$about_yourself",
            idea_of_great_date: "$idea_of_great_date",

            photos: "$images",
            main_img: "$main_img",
            social_links: "$social_links",

            education: "$education",
            education_visibility: "$education_visibility",

            education_level: "$education_level",
            education_level_visibility: "$education_level_visibility",

            cultural_background: "$cultural_background",
            cultural_background_visibility: "$cultural_background_visibility",

            location: "$location",
            location_visibility: "$location_visibility",

            hometown: "$hometown",
            hometown_visibility: "$hometown_visibility",

            occupation: "$occupation",
            occupation_visibility: "$occupation_visibility",

            height: "$height",
            height_unit: "$height_unit",
            height_visibility: "$height_visibility",

            exercise: "$exercise",
            exercise_visibility: "$exercise_visibility",

            diet: "$diet",
            diet_visibility: "$diet_visibility",

            drink: "$drink",
            drink_visibility: "$drink_visibility",

            smoking: "$smoking",
            smoking_visibility: "$smoking_visibility",

            religion: "$religion",
            religion_visibility: "$religion_visibility",

            ethnicity: "$ethnicity",
            ethnicity_visibility: "$ethnicity_visibility",

            family_plan: "$family_plan",
            family_plan_visibility: "$family_plan_visibility",

            kids: "$kids",
            kids_visibility: "$kids_visibility",

            pets: "$pets",
            pets_visibility: "$pets_visibility",

            zodiac: "$zodiac",
            zodiac_visibility: "$zodiac_visibility",

            languages: "$languages",
            languages_visibility: "$languages_visibility",

            politics: "$politics",
            politics_visibility: "$politics_visibility",

            dates_days: "$dates_days",
            favorite_dates: "$favorite_dates"
          },

          // ========= USER META =========
          user: {
            verified: "$user.verified",
            is_registered: "$user.is_registered",
            is_detailed_submit: "$user.is_detailed_submit",
            lastActive: "$user.updatedAt"
          }
        }
      }

    ]);

    return profiles;
  } catch (error) {
    console.error("Error in aggregation:", error);
    return [];
  }
};



// const getCandidateUsers = async (userId, excludeIds, dateDay) => {
//   try {
//     const allExcludeIds = [Types.ObjectId(userId), ...excludeIds.map(id => Types.ObjectId(id))];
//     // Build base match query
//     let matchQuery = {
//       user_id: { $nin: allExcludeIds }
//     };

//     // Add dateDay filter
//     if (dateDay) {
//       const days = Array.isArray(dateDay) ? dateDay : [dateDay];
//       matchQuery["dates_days"] = { $in: days.map(id => Types.ObjectId(id)) };
//     }

//     // Check user subscription for advanced filter
//     const user = await User.findById(userId).lean();
//     const isAdvanceFilterApplied = user?.is_subscribed ? true : false;

//     // Get user preferences
//     const userPrefs = await UserPrefs.findOne({ user_id: userId }).lean();
//     if (userPrefs) {
//       const preferenceQuery = buildPreferenceQuery(userPrefs, isAdvanceFilterApplied);
//       Object.assign(matchQuery, preferenceQuery);
//     }

//     // === FINAL AGGREGATION PIPELINE ===
//     const profiles = await UserProfile.aggregate([
//       { $match: matchQuery },

//       // Populate user record
//       {
//         $lookup: {
//           from: "users",
//           localField: "user_id",
//           foreignField: "_id",
//           as: "user"
//         }
//       },
//       { $unwind: "$user" },

//       // Filter required user conditions
//       {
//         $match: {
//           "user.is_detailed_submit": true,
//           "user.is_registered": true,
//           "user.is_mobile_verified": true
//         }
//       },

//       // Lookups for all referenced fields (diet, exercise, etc.)
//       ...lookup("diet", "diets"),
//       ...lookup("exercise", "exercises"),
//       ...lookup("smoking", "smokings"),
//       ...lookup("drink", "drinks"),
//       ...lookup("ethnicity", "ethnicities"),
//       ...lookup("religion", "religions"),
//       ...lookupArray("looking_for", "lookingfors"),
//       ...lookupArray("favorite_dates", "dateactivities"),
//       ...lookupArray("languages", "languages"),
//       ...lookupArray("dates_days", "datedays"),
//       ...lookup("family_plan", "familyplans"),

//       // Format final response
//       {
//         $project: {
//           _id: "$user._id",
//           name: 1,
//           date_of_birth: 1,
//           location: 1,
//           photos: "$images",
//           bio: "$about_yourself",
//           diet: { $arrayElemAt: ["$dietLookup", 0] },
//           exercise: { $arrayElemAt: ["$exerciseLookup", 0] },
//           smoking: { $arrayElemAt: ["$smokingLookup", 0] },
//           drink: { $arrayElemAt: ["$drinkLookup", 0] },
//           ethnicity: { $arrayElemAt: ["$ethnicityLookup", 0] },
//           religion: { $arrayElemAt: ["$religionLookup", 0] },
//           looking_for: "$looking_forLookup",
//           family_plan: { $arrayElemAt: ["$family_planLookup", 0] },
//           favorite_dates: "$favorite_datesLookup",
//           languages: "$languagesLookup",
//           dates_days: "$dates_daysLookup",
//           updatedAt: "$user.updatedAt"
//         }
//       }
//     ]);

//     return profiles;
//   } catch (error) {
//     console.error("Error in aggregation:", error);
//     return [];
//   }
// };

// Reusable lookup for single reference
const lookup = (field, collection) => [
  {
    $lookup: {
      from: collection,
      localField: field,
      foreignField: "_id",
      as: `${field}Lookup`
    }
  }
];

// Reusable lookup for array references
const lookupArray = (field, collection) => [
  {
    $lookup: {
      from: collection,
      localField: field,
      foreignField: "_id",
      as: `${field}Lookup`
    }
  }
];




const getUserById = async (userId) => {
  try {
    const { UserProfile } = require('../models');
    const profile = await UserProfile
      .findOne({ user_id: userId })
      .populate('user_id')
      .populate('religion')
      .populate('ethnicity')
      .populate('languages')
      .populate('exercise')
      .populate('diet')
      .populate('drink')
      .populate('smoking')
      .populate('politics')
      .populate('zodiac')
      .populate('kids')
      .populate('pets')
      .populate('dates_days')
      .populate('favorite_dates')
      .populate('education_level')
      .populate('looking_for', 'name')
      .populate('family_plan', 'name')
      .populate('favorite_dates.food_and_drink', 'name category')
      .populate('favorite_dates.active_and_outdoor', 'name category')
      .populate('favorite_dates.fun', 'name category')
      .populate('favorite_dates.chill_and_cosy', 'name category')
      .lean();

    if (!profile || !profile.user_id) {
      return null;
    }

    // Transform to expected format
    return {
      _id: profile.user_id._id,
      name: profile.name,
      date_of_birth: profile.date_of_birth,
      location: profile.location,
      photos: profile.images || [],
      bio: profile.about_yourself || '',
      diet: profile.diet,
      exercise: profile.exercise,
      smoking: profile.smoking,
      drink: profile.drink,
      favorite_dates: profile.favorite_dates,
      languages: profile.languages,
      ethnicity: profile.ethnicity,
      religion: profile.religion,
      looking_for: profile.looking_for,
      family_plan: profile.family_plan,
      dates_days: profile.dates_days,
      updatedAt: profile.user_id.updatedAt
    };
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
};

// ============================================================================
// PREFERENCE-BASED SUGGESTION FUNCTIONS
// ============================================================================

const CurrentSwipeCount = async (userId) => {
  const find_user = await User.findById(userId);
  console.log(find_user, "=======user...........========");
  const count = await UserLimit.findOne({ user_id: userId });
  console.log("===========count=================", count);
  if (count) {
    return count.swipe_count;
  } else {
    return 0;
  }
};

const countCandidatesWithQuery = async (query, dateDay) => {
  // clone the query to avoid mutation
  const q = { ...query };
  const pipeline = [];

  if (q.location?.$near) {
    pipeline.push({
      $geoNear: {
        key: 'location',
        near: q.location.$near.$geometry,
        distanceField: 'distance',
        maxDistance: q.location.$near.$maxDistance,
        spherical: true
      }
    });
    delete q.location;
  }

  if (Array.isArray(dateDay) && dateDay.length > 0) {
    q.dates_days = { $in: dateDay.map(id => Types.ObjectId(id)) };
  }

  // convert exercise array to ObjectId safely
  if (q.exercise?.$in?.length) {
    q.exercise.$in = q.exercise.$in.map(id => Types.ObjectId(id));
  }

  pipeline.push({ $match: q });
  pipeline.push({ $count: 'total' });

  const result = await UserProfile.aggregate(pipeline);
  return result[0]?.total || 0;
};


const buildSuggestionResponse = async ({
  suggestions,
  currentUserProfile,
  page,
  limit,
  total,
  result,
  isAdvanced,
}) => {
  const formatted = suggestions.map(s =>
    formatSuggestion(s, currentUserProfile)
  );

  const response = {
    suggestions: formatted,
    hasMore: page * limit < total,
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    preferenceMatch: result.filtersUsed.length > 0,
    filtersApplied: result.filtersUsed,
    filtersBypassed: result.filtersBypassed,
    timestamp: new Date().toISOString()
  };

  if (isAdvanced === false) {
    const swipeCount = await CurrentSwipeCount(currentUserProfile._id);
    response.swipeCount = swipeCount;
  }

  return response;
};

async function buildGenderFilter(interestedInIds) {
  const genderIds = [];

  const interestedRecords = await InterestedIn.find({
    _id: { $in: interestedInIds }
  });
  console.log("==============", interestedRecords)

  const genderMap = {
    Men: 'Male',
    Women: 'Female',
    Nonbinary: 'Nonbinary'
  };

  // Fetch all genders once
  const allGenders = await Gender.find({});
  const genderLookup = {};
  allGenders.forEach(g => {
    genderLookup[g.name] = g._id;
  });

  for (const record of interestedRecords) {
    if (!record) continue;

    if (record.name === 'All') {
      return allGenders.map(g => g._id);
    }

    const genderId = genderLookup[genderMap[record.name]];
    if (genderId) genderIds.push(genderId);
  }

  return genderIds;
}


const getSuggestionsByPreferences = async (userId, options = {}) => {
  const { limit = 10, page = 1, dateDay, refresh = false } = options;
  try {
    const currentUserProfile = await getUserById(userId);
    if (!currentUserProfile) throw new Error('User not found');
    const user = await User.findById(userId).lean();
    const isAdvanced = user?.is_subscribed;

    // --- AFTERHOURS MATCHING ENGINE ---
    logger.info(`[SUGGESTION SERVICE] Generating feed for ${userId} using AFTERHOURS Engine`);

    // 1. Generate Full Ranked Feed
    const config = {
      viewer: user,
      viewerProfile: currentUserProfile,
      _bustCache: refresh
    };
    const engineResult = await generateDailyFeed(userId, dateDay, config);
    const feed = Array.isArray(engineResult) ? engineResult : engineResult.suggestions;
    const appliedFilters = !Array.isArray(engineResult) ? engineResult.appliedFilters : ['gender', 'age', 'distance', 'looking_for', 'interested_in'];

    logger.info(`[SUGGESTION SERVICE] Generated feed for ${userId}: ${feed.length} candidates after engine processing.`);

    // 2. Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedFeed = feed.slice(startIndex, endIndex);

    // 3. Late Population (Speed Boost): Only populate full details for the winners we are showing
    const populatedCandidates = await UserProfile.populate(paginatedFeed, [
      { path: 'user_id' },
      { path: 'gender' },
      { path: 'interested_in' },
      { path: 'looking_for' },
      { path: 'religion' },
      { path: 'ethnicity' },
      { path: 'politics' },
      { path: 'exercise' },
      { path: 'diet' },
      { path: 'drink' },
      { path: 'smoking' },
      { path: 'kids' },
      { path: 'pets' },
      { path: 'zodiac' },
      { path: 'education_level' },
      { path: 'cultural_background' },
      { path: 'favorite_dates' },
      { path: 'work' },
      { path: 'languages' },
      { path: 'family_plan' }
    ]);

    // 4. Map to Legacy Format for Response Builder
    const formattedSuggestions = populatedCandidates.map(candidate => ({
      user: {
        _id: candidate.user_id?._id || candidate.user_id,
        user: candidate
      },
      score: candidate.finalScore,
      factors: candidate.debug || {},
      reasons: candidate.match_highlights || ['Top Match']
    }));

    // Calculate Bypassed Filters
    const allPossibleFilters = [
      'religion', 'ethnicity', 'exercise', 'diet', 'drink', 'smoke',
      'political', 'kid', 'pets', 'zodiac', 'education_level',
      'cultural_background', 'looking_for', 'age', 'distance', 'interested_in', 'height'
    ];
    const filtersBypassed = allPossibleFilters.filter(f => !appliedFilters.includes(f));

    // 4. Build Response
    return await buildSuggestionResponse({
      suggestions: formattedSuggestions,
      currentUserProfile,
      page,
      limit,
      total: feed.length,
      result: {
        filtersUsed: appliedFilters,
        filtersBypassed: filtersBypassed
      },
      isAdvanced
    });

  } catch (error) {
    logger.error('Error in getSuggestionsByPreferences:', error);
    throw error;
  }
};

const hasValue = (pref, valueKey) => {
  if (!pref) return false;

  // range based (height, age etc.)
  if (pref.min !== undefined || pref.max !== undefined) {
    return pref.min !== null || pref.max !== null;
  }

  const value = pref[valueKey];

  if (
    value === null ||
    value === undefined ||
    (Array.isArray(value) && value.length === 0) ||
    value === ''
  ) {
    return false;
  }

  return true;
};



const getProgressiveFilteredSuggestions = async (userId, userPrefs, isAdvanced, interactedUserIds, options) => {
  const baseQuery = { user_id: { $nin: [userId, ...interactedUserIds] } };
  const mandatoryFilters = [];
  if (userPrefs.looking_for?.looking?.length > 0) {
    mandatoryFilters.push({ key: 'looking_for', condition: true });
  }
  if (userPrefs.interested_in?.interests?.length > 0) {
    mandatoryFilters.push({ key: 'interested_in', condition: true });
  }
  const optfilter = [
    {
      key: 'age',
      condition: userPrefs?.age?.opt_run_out === false
    },
    {
      key: 'distance',
      condition: userPrefs?.distance?.opt_run_out === false
    }
  ];
  const optionalFilters = []
  if (isAdvanced) {
    optionalFilters.push(
      ...(hasValue(userPrefs.height)
        ? [{
          key: 'height',
          condition: userPrefs.height.isImportant === true
        }]
        : []),

      ...(hasValue(userPrefs.exercise, 'exercises')
        ? [{ key: 'exercise', condition: userPrefs.exercise.isImportant }]
        : []),

      ...(hasValue(userPrefs.diet, 'diets')
        ? [{ key: 'diet', condition: userPrefs.diet.isImportant }]
        : []),

      ...(hasValue(userPrefs.drink, 'drinks')
        ? [{ key: 'drink', condition: userPrefs.drink.isImportant }]
        : []),

      ...(hasValue(userPrefs.smoke, 'smokings')
        ? [{ key: 'smoking', condition: userPrefs.smoke.isImportant }]
        : []),

      ...(hasValue(userPrefs.pets, 'pets')
        ? [{ key: 'pets', condition: userPrefs.pets.isImportant }]
        : []),

      ...(hasValue(userPrefs.cultural_background, 'cultural_backgrounds')
        ? [{ key: 'cultural_background', condition: userPrefs.cultural_background.isImportant }]
        : []),

      ...(hasValue(userPrefs.religion, 'religions')
        ? [{ key: 'religion', condition: userPrefs.religion.isImportant }]
        : []),

      ...(hasValue(userPrefs.ethnicity, 'ethnicities')
        ? [{ key: 'ethnicity', condition: userPrefs.ethnicity.isImportant }]
        : []),

      ...(hasValue(userPrefs.family_plan, 'family_plans')
        ? [{ key: 'family_plan', condition: userPrefs.family_plan.isImportant }]
        : []),

      ...(hasValue(userPrefs.kid, 'kids')
        ? [{ key: 'kid', condition: userPrefs.kid.isImportant }]
        : []),

      ...(hasValue(userPrefs.zodiac, 'zodiacs')
        ? [{ key: 'zodiac', condition: userPrefs.zodiac.isImportant }]
        : []),

      ...(hasValue(userPrefs.languages, 'languages')
        ? [{ key: 'languages', condition: userPrefs.languages.isImportant }]
        : []),

      ...(hasValue(userPrefs.political, 'politics')
        ? [{ key: 'politics', condition: userPrefs.political.isImportant }]
        : []),

      ...(hasValue(userPrefs.education_level, 'education_levels')
        ? [{ key: 'education_level', condition: userPrefs.education_level.isImportant }]
        : [])
    );
  }

  const activeMandatory = mandatoryFilters.filter(f => f.condition);
  const activeOptional = optionalFilters
  activeOptional.push(...optfilter);
  let currentQuery = { ...baseQuery };
  if (userPrefs.interested_in?.interests?.length) {
    const genderIds = await buildGenderFilter(
      userPrefs.interested_in.interests
    );

    if (genderIds.length) {
      currentQuery.gender = { $in: genderIds };
    }
  }
  if (options.dateDay) {
    let dateDayValues = options.dateDay;
    if (!Array.isArray(dateDayValues)) {
      dateDayValues = [dateDayValues];
    }
    currentQuery.dates_days = {
      $in: dateDayValues.map(id => Types.ObjectId(id))
    };
  }
  else if (userPrefs.dates_days && userPrefs.dates_days.length > 0) {
    currentQuery.dates_days = { $in: userPrefs.dates_days };
  }

  const appliedFilters = [];
  // Apply mandatory filters
  for (const filter of activeMandatory) {
    const filterQuery = await buildSingleFilter(filter.key, userPrefs);

    Object.assign(currentQuery, filterQuery);
    appliedFilters.push(filter.key);
  }
  for (const filter of activeOptional) {
    const testQuery = { ...currentQuery };
    const filterQuery = await buildSingleFilter(filter.key, userPrefs);
    Object.assign(testQuery, filterQuery);
    // STRICT FILTER → never bypass
    if (filter.condition === true) {
      currentQuery = testQuery;
      appliedFilters.push(filter.key);
      console.log(`Applied STRICT filter: ${filter.key}`);
      continue;
    }
    if (filter.condition === true && filter.key === 'distance') {
      currentQuery = testQuery;
      appliedFilters.push(filter.key);
      console.log(`Applied STRICT filter: ${filter.key}`);
      continue;
    }
    if (filter.condition === true && filter.key === 'age') {
      currentQuery = testQuery;
      appliedFilters.push(filter.key);
      console.log(`Applied STRICT filter: ${filter.key}`);
      continue;
    }
    // SOFT FILTER → progressive
    const candidates = await findCandidatesWithQuery(
      testQuery,
      options.limit,
      options.page,
      options.dateDay
    );
    if (candidates.length > 0) {
      currentQuery = testQuery;
      appliedFilters.push(filter.key);
      console.log(`Applied filter: ${filter.key}`);
    } else {
      console.log(`Bypassed filter: ${filter.key}`);
    }
  }

  const finalQuery = { ...currentQuery };
  delete finalQuery.dates_days;
  const [finalCandidates, totalCount] = await Promise.all([
    findCandidatesWithQuery(finalQuery, options.limit, options.page, options.dateDay),
    countCandidatesWithQuery(finalQuery, options.dateDay)
  ]);
  const bypassedFilters = activeOptional.filter(f => !appliedFilters.includes(f.key)).map(f => f.key);
  return {
    candidates: finalCandidates,
    total: totalCount,
    filtersUsed: appliedFilters,
    filtersBypassed: bypassedFilters
  };
};

const buildSingleFilter = async (filterKey, userPrefs) => {
  const query = {};
  switch (filterKey) {
    case 'age':
      if (userPrefs.age) {
        const currentDate = new Date();
        const minDate = new Date(currentDate.getFullYear() - userPrefs.age.max, currentDate.getMonth(), currentDate.getDate());
        const maxDate = new Date(currentDate.getFullYear() - userPrefs.age.min, currentDate.getMonth(), currentDate.getDate());
        query.date_of_birth = { $gte: minDate, $lte: maxDate };
      }
      break;
    case 'distance':
      console.log(
        'Distance filter check:',
        userPrefs.distance,
        userPrefs.currentlocation
      );

      if (
        userPrefs.distance &&
        typeof userPrefs.distance.value === 'number' &&
        userPrefs.distance.value > 0 &&
        userPrefs.currentlocation?.coordinates?.length === 2
      ) {
        const [lng, lat] = userPrefs.currentlocation.coordinates;

        const milesToMeters = miles => miles * 1609.34;

        query.location = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat]
            },
            $maxDistance: milesToMeters(userPrefs.distance.value)
          }
        };
      }
      break;


    case 'height': {
      const { min, max, unit } = userPrefs.height || {};

      const hasMin = min !== null && min !== undefined;
      const hasMax = max !== null && max !== undefined;

      if (!hasMin && !hasMax) break;

      const toCm = v => unit === 'ft' ? Number(v) * 30.48 : Number(v);

      const exprConditions = [];

      if (hasMin) {
        exprConditions.push({
          $gte: [{ $toDouble: '$height' }, toCm(min)]
        });
      }

      if (hasMax) {
        exprConditions.push({
          $lte: [{ $toDouble: '$height' }, toCm(max)]
        });
      }

      query.$expr = {
        $and: exprConditions
      };

      break;
    }


    case 'exercise': {
      const ids = userPrefs.exercise?.exercises;

      if (Array.isArray(ids) && ids.length > 0) {
        query.exercise = {
          $in: ids.map(id => Types.ObjectId(id))
        };
      }
      break;
    }
    case 'diet':
      if (userPrefs.diet?.diets?.length) query.diet = { $in: userPrefs.diet.diets };
      break;
    case 'pets':
      if (userPrefs.pets?.pets?.length) query.pets = { $in: userPrefs.pets.pets };
      break;
    case 'political':
      if (userPrefs.political?.politics?.length) query.pets = { $in: userPrefs.political.politics };
      break;
    case 'drink':
      if (userPrefs.drink?.drinks?.length) {
        query.drink = {
          $in: userPrefs.drink.drinks.map(id => new Types.ObjectId(id))
        };
      }
      break;
    case 'smoking':
      if (userPrefs.smoke?.smokings?.length) query.smoking = { $in: userPrefs.smoke.smokings };
      break;
    case 'religion':
      if (userPrefs.religion?.religions?.length) query.religion = { $in: userPrefs.religion.religions };
      break;
    case 'ethnicity':
      if (userPrefs.ethnicity?.ethnicities?.length) query.ethnicity = { $in: userPrefs.ethnicity.ethnicities };
      break;
    case 'family_plan':
      if (userPrefs.family_plan?.family_plans?.length) query.family_plan = { $in: userPrefs.family_plan.family_plans };
      break;
    case 'kids':
      if (userPrefs.kid?.kids?.length) query.kids = { $in: userPrefs.kid.kids };
      break;
    case 'zodiac':
      if (userPrefs.zodiac?.zodiacs?.length) query.zodiac = { $in: userPrefs.zodiac.zodiacs };
      break;
    case 'cultural_background':
      if (userPrefs.cultural_background?.cultural_backgrounds?.length) query.cultural_background = { $in: userPrefs.cultural_background.cultural_backgrounds };
    case 'languages':
      if (userPrefs.languages?.languages?.length) {
        const mongoose = require('mongoose');
        const languageIds = userPrefs.languages.languages.map(lang => {
          const id = lang.id || lang._id;
          return new mongoose.Types.ObjectId(id);
        });
        query.languages = { $in: languageIds };
      }
      break;
    case 'politics':
      if (userPrefs.political?.politics?.length) query.politics = { $in: userPrefs.political.politics };
      break;
    case 'education_level':
      if (userPrefs.education_level?.education_levels?.length) query.education_level = { $in: userPrefs.education_level.education_levels };
      break;
    case 'looking_for':
      if (userPrefs.looking_for?.looking?.length) query.looking_for = { $in: userPrefs.looking_for.looking };
      break;
  }

  return query;
};


const findCandidatesWithQuery = async (query, limit = 10, page = 1, dateDay) => {
  const skip = (page - 1) * limit;
  const pipeline = [];
  let dateDayIds = [];
  const q = { ...query };

  // ================= GEO (MUST BE FIRST) =================
  if (q.location?.$near) {
    pipeline.push({
      $geoNear: {
        key: 'location',
        near: q.location.$near.$geometry,
        distanceField: 'distance',
        maxDistance: q.location.$near.$maxDistance,
        spherical: true
      }
    });

    delete q.location; // VERY IMPORTANT
  }


  if (dateDay) {
    dateDayIds = Array.isArray(dateDay) ? dateDay : [dateDay];
  }

  if (dateDayIds.length > 0) {
    q.dates_days = {
      $in: dateDayIds.map(id => new Types.ObjectId(id))
    };
  }

  // ================= BASIC MATCH =================
  pipeline.push({ $match: q });

  // ================= USER =================
  pipeline.push(
    {
      $lookup: {
        from: 'users',
        localField: 'user_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' }
  );

  // ================= LOOKUPS =================
  pipeline.push(
    ...[
      ['diets', 'diet'],
      ['exercises', 'exercise'],
      ['smokings', 'smoking'],
      ['drinks', 'drink'],
      ['ethnicities', 'ethnicity'],
      ['familyplans', 'family_plan'],
      ['genders', 'gender'],
      ['religions', 'religion'],
      ['works', 'work'],
      ['educationlevels', 'education_level'],
      ['kids', 'kids'],
      ['pets', 'pets'],
      ['zodiacs', 'zodiac'],
      ['politics', 'politics']
    ].flatMap(([from, field]) => ([
      {
        $lookup: {
          from,
          localField: field,
          foreignField: '_id',
          as: field
        }
      },
      {
        $unwind: {
          path: `$${field}`,
          preserveNullAndEmptyArrays: true
        }
      }
    ]))
  );

  // ================= ARRAY LOOKUPS =================
  pipeline.push(
    {
      $lookup: {
        from: 'lookingfors',
        localField: 'looking_for',
        foreignField: '_id',
        as: 'looking_for'
      }
    },
    {
      $lookup: {
        from: 'culturalbackgrounds',
        localField: 'cultural_background',
        foreignField: '_id',
        as: 'cultural_background'
      }
    },
    {
      $lookup: {
        from: 'languages',
        localField: 'languages',
        foreignField: '_id',
        as: 'languages'
      }
    },
    {
      $lookup: {
        from: 'datedays',
        localField: 'dates_days',
        foreignField: '_id',
        as: 'dates_days'
      }
    },
    {
      $lookup: {
        from: 'dateactivities',
        localField: 'favorite_dates',
        foreignField: '_id',
        as: 'favorite_dates'
      }
    },

  );

  // ================= FINAL SHAPE =================
  pipeline.push({
    $project: {
      user: {
        _id: '$user._id',
        name: { $ifNull: ['$name', null] },
        date_of_birth: { $ifNull: ['$date_of_birth', null] },
        gender: { $ifNull: ['$gender', null] },
        gender_visibility: { $ifNull: ['$gender_visibility', false] },

        interested_in: { $ifNull: ['$interested_in', null] },

        looking_for: { $ifNull: ['$looking_for', []] },
        looking_for_visibility: { $ifNull: ['$looking_for_visibility', false] },

        work: { $ifNull: ['$work', null] },
        work_visibility: { $ifNull: ['$work_visibility', false] },

        about_yourself: { $ifNull: ['$about_yourself', null] },
        idea_of_great_date: { $ifNull: ['$idea_of_great_date', null] },

        images: { $ifNull: ['$images', []] },
        main_img: { $ifNull: ['$main_img', null] },

        social_links: { $ifNull: ['$social_links', []] },

        education: { $ifNull: ['$education', null] },
        education_visibility: { $ifNull: ['$education_visibility', false] },

        education_level: { $ifNull: ['$education_level', null] },
        education_level_visibility: { $ifNull: ['$education_level_visibility', false] },

        cultural_background: { $ifNull: ['$cultural_background', null] },
        cultural_background_visibility: { $ifNull: ['$cultural_background_visibility', false] },

        location: { $ifNull: ['$location', null] },
        location_visibility: { $ifNull: ['$location_visibility', false] },

        hometown: { $ifNull: ['$hometown', null] },
        hometown_visibility: { $ifNull: ['$hometown_visibility', false] },

        occupation: { $ifNull: ['$occupation', null] },
        occupation_visibility: { $ifNull: ['$occupation_visibility', false] },

        height: { $ifNull: ['$height', null] },
        height_unit: { $ifNull: ['$height_unit', null] },
        height_visibility: { $ifNull: ['$height_visibility', false] },

        exercise: { $ifNull: ['$exercise', null] },
        exercise_visibility: { $ifNull: ['$exercise_visibility', false] },

        diet: { $ifNull: ['$diet', null] },
        diet_visibility: { $ifNull: ['$diet_visibility', false] },

        drink: { $ifNull: ['$drink', null] },
        drink_visibility: { $ifNull: ['$drink_visibility', false] },

        smoking: { $ifNull: ['$smoking', null] },
        smoking_visibility: { $ifNull: ['$smoking_visibility', false] },

        religion: { $ifNull: ['$religion', null] },
        religion_visibility: { $ifNull: ['$religion_visibility', false] },

        ethnicity: { $ifNull: ['$ethnicity', null] },
        ethnicity_visibility: { $ifNull: ['$ethnicity_visibility', false] },

        family_plan: { $ifNull: ['$family_plan', null] },
        family_plan_visibility: { $ifNull: ['$family_plan_visibility', false] },

        kids: { $ifNull: ['$kids', null] },
        kids_visibility: { $ifNull: ['$kids_visibility', false] },

        pets: { $ifNull: ['$pets', null] },
        pets_visibility: { $ifNull: ['$pets_visibility', false] },

        zodiac: { $ifNull: ['$zodiac', null] },
        zodiac_visibility: { $ifNull: ['$zodiac_visibility', false] },

        languages: { $ifNull: ['$languages', []] },
        languages_visibility: { $ifNull: ['$languages_visibility', false] },

        politics: { $ifNull: ['$politics', null] },
        politics_visibility: { $ifNull: ['$politics_visibility', false] },

        dates_days: { $ifNull: ['$dates_days', []] },
        favorite_dates: { $ifNull: ['$favorite_dates', []] },

        updatedAt: '$user.updatedAt',
        verified: { $ifNull: ['$user.verified', false] },
        is_registered: '$user.is_registered',
        is_detailed_submit: '$user.is_detailed_submit'
      }
    }
  });

  // ================= PAGINATION (LAST) =================
  pipeline.push(
    { $sort: { distance: 1, _id: 1 } },
    { $skip: skip },
    { $limit: limit }
  );

  return UserProfile.aggregate(pipeline).allowDiskUse(true);
};


const getFlexiblePreferenceSuggestions = async (userId, userPrefs, options) => {
  // Use MongoDB aggregation for flexible matching
  const pipeline = [
    { $match: { user_id: { $nin: [userId] } } },
    {
      $addFields: {
        preferenceScore: {
          $add: [
            // Age match score
            userPrefs.age ? {
              $cond: {
                if: {
                  $and: [
                    { $gte: ['$date_of_birth', new Date(new Date().getFullYear() - userPrefs.age.max, 0, 1)] },
                    { $lte: ['$date_of_birth', new Date(new Date().getFullYear() - userPrefs.age.min, 11, 31)] }
                  ]
                },
                then: 10,
                else: 0
              }
            } : 0,
            // Add more scoring logic for other preferences
          ]
        }
      }
    },
    { $sort: { preferenceScore: -1 } },
    { $limit: options.limit || 10 }
  ];

  const results = await UserProfile.aggregate(pipeline);
  return { suggestions: results, preferenceMatch: true };
};

// ============================================================================
// BUSINESS LOGIC LAYER
// ============================================================================

const generateSuggestions = async (userId, options = {}) => {
  const { limit = 10, page = 1, refresh = false, dateDay } = options;
  logger.logServiceStart('SuggestionService', 'generateSuggestions', { userId: sanitizeForLog(userId), limit, page, refresh, dateDay: sanitizeForLog(dateDay) });
  const [currentUser, interactedUserIds] = await Promise.all([
    getUserById(userId),
    getInteractedUserIds(userId)
  ]);

  if (!currentUser) {
    logger.error('User not found in generateSuggestions', { userId: sanitizeForLog(userId) });
    throw new Error('User not found');
  }
  interactedUserIds.push(userId); // Exclude self
  const candidates = await getCandidateUsers(userId, interactedUserIds, dateDay);
  logger.info('Found candidates for suggestions', { userId: sanitizeForLog(userId), candidateCount: candidates.length, dateDay: sanitizeForLog(dateDay) });

  if (candidates.length === 0) {
    logger.info('No candidates available for user', { userId: sanitizeForLog(userId) });
    return {
      suggestions: [],
      hasMore: false,
      total: 0,
      message: 'No more users available'
    };
  }

  const suggestions = await getEngineSuggestions(
    currentUser,
    candidates,
    {
      limit: parseInt(limit),
      page: parseInt(page),
      useCache: !refresh
    }
  );

  const appliedFilters = ['gender', 'age', 'distance', 'interested_in', 'looking_for'];
  const allPossibleFilters = [
    'religion', 'ethnicity', 'exercise', 'diet', 'drink', 'smoke',
    'political', 'kid', 'pets', 'zodiac', 'education_level',
    'cultural_background', 'looking_for', 'age', 'distance', 'interested_in', 'height'
  ];
  const filtersBypassed = allPossibleFilters.filter(f => !appliedFilters.includes(f));

  const result = await buildSuggestionResponse({
    suggestions: suggestions.map(s => ({
      user: {
        _id: s.user_id?._id || s.user_id,
        user: s
      },
      ...s
    })),
    currentUserProfile: currentUser,
    page,
    limit,
    total: candidates.length,
    result: {
      filtersUsed: appliedFilters,
      filtersBypassed: filtersBypassed
    },
    isAdvanced: currentUser.user_id?.is_subscribed || false
  });

  logger.logServiceEnd('SuggestionService', 'generateSuggestions', result);
  return result;
};

const generateCategorizedSuggestions = async (userId) => {
  logger.logServiceStart('SuggestionService', 'generateCategorizedSuggestions', { userId: sanitizeForLog(userId) });

  const [currentUser, interactedUserIds] = await Promise.all([
    getUserById(userId),
    getInteractedUserIds(userId)
  ]);

  if (!currentUser) {
    logger.error('User not found in generateCategorizedSuggestions', { userId: sanitizeForLog(userId) });
    throw new Error('User not found');
  }

  const candidates = await getCandidateUsers(userId, interactedUserIds);
  logger.info('Found candidates for categorized suggestions', { userId: sanitizeForLog(userId), candidateCount: candidates.length });

  const categorized = await getEngineCategorized(currentUser, candidates);

  const response = {};
  for (const [category, suggestions] of Object.entries(categorized)) {
    response[category] = suggestions.map(s => formatSuggestion(s, currentUser));
  }

  logger.logServiceEnd('SuggestionService', 'generateCategorizedSuggestions', response);
  return response;
};

const generateSuggestionStats = async (userId) => {
  logger.logServiceStart('SuggestionService', 'generateSuggestionStats', { userId: sanitizeForLog(userId) });

  const [currentUser, interactedUserIds] = await Promise.all([
    getUserById(userId),
    getInteractedUserIds(userId)
  ]);

  if (!currentUser) {
    logger.error('User not found in generateSuggestionStats', { userId: sanitizeForLog(userId) });
    throw new Error('User not found');
  }

  const candidates = await getCandidateUsers(userId, interactedUserIds);
  const suggestions = await getEngineSuggestions(currentUser, candidates, { limit: 20 });
  const stats = await getEngineStats(suggestions);

  const result = {
    ...stats,
    availableCandidates: candidates.length,
    interactedWith: interactedUserIds.length
  };

  logger.logServiceEnd('SuggestionService', 'generateSuggestionStats', result);
  return result;
}

function refreshUserSuggestions(userId) {
  logger.logServiceStart('SuggestionService', 'refreshUserSuggestions', { userId: sanitizeForLog(userId) });
  clearUserCache(userId);
  logger.logServiceEnd('SuggestionService', 'refreshUserSuggestions');
}


const formatSuggestion = (suggestion, currentUser) => {
  const profileWrapper = suggestion.user;
  const profile = profileWrapper.user; // actual profile data

  return {
    _id: profile._id,
    user_id: profile.user_id?._id || profile.user_id,
    name: profile.name,
    age: calculateAge(profile.date_of_birth),
    date_of_birth: profile.date_of_birth,
    verified: profile.user_id?.verified || profile.verified || false,
    main_img: profile.main_img || '',
    photos: profile.images || [],

    location: profile.location || null,
    location_visibility: profile.location_visibility,
    hometown: profile.hometown || null,
    hometown_visibility: profile.hometown_visibility,

    about_yourself: profile.about_yourself || '',
    idea_of_great_date: profile.idea_of_great_date || '',

    gender: profile.gender || null,
    gender_visibility: profile.gender_visibility,
    interested_in: profile.interested_in?._id || profile.interested_in || null,
    looking_for: profile.looking_for || [],
    looking_for_visibility: profile.looking_for_visibility,

    work: profile.work || null,
    work_visibility: profile.work_visibility,
    occupation: profile.occupation || null,
    occupation_visibility: profile.occupation_visibility,

    education: profile.education || null,
    education_visibility: profile.education_visibility,
    education_level: profile.education_level || null,
    education_level_visibility: profile.education_level_visibility,

    cultural_background: profile.cultural_background || [],
    cultural_background_visibility: profile.cultural_background_visibility,

    height: profile.height || null,
    height_unit: profile.height_unit || 'cm',
    height_visibility: profile.height_visibility,

    exercise: profile.exercise || null,
    exercise_visibility: profile.exercise_visibility,
    diet: profile.diet || null,
    diet_visibility: profile.diet_visibility,
    drink: profile.drink || null,
    drink_visibility: profile.drink_visibility,
    smoking: profile.smoking || null,
    smoking_visibility: profile.smoking_visibility,

    religion: profile.religion || null,
    religion_visibility: profile.religion_visibility,
    ethnicity: profile.ethnicity || null,
    ethnicity_visibility: profile.ethnicity_visibility,
    politics: profile.politics || null,
    politics_visibility: profile.politics_visibility,
    zodiac: profile.zodiac || null,
    zodiac_visibility: profile.zodiac_visibility,

    family_plan: profile.family_plan || null,
    family_plan_visibility: profile.family_plan_visibility,
    kids: profile.kids || null,
    kids_visibility: profile.kids_visibility,
    pets: profile.pets || null,
    pets_visibility: profile.pets_visibility,

    languages: profile.languages || [],
    languages_visibility: profile.languages_visibility,

    dates_days: profile.dates_days || [],
    favorite_dates: profile.favorite_dates || [],

    compatibility: Math.round(suggestion.score || profile.finalScore || 0),
    reasons: suggestion.reasons || profile.match_highlights || ['Potential for connection'],
    distance: calculateDistance(currentUser, profile),
    lastActive: getLastActiveText(profile.updatedAt || profile.user_id?.updatedAt),
  };
};

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  return Math.floor((Date.now() - new Date(dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000));
};


const calculateDistance = (currentUserProfile, targetUserProfile) => {
  const coords1 = currentUserProfile?.location?.coordinates;
  const coords2 = targetUserProfile?.location?.coordinates;

  if (!coords1 || !coords2 || coords1.length < 2 || coords2.length < 2) {
    return 'Unknown';
  }

  const [lon1, lat1] = coords1;
  const [lon2, lat2] = coords2;

  const R = 3958.8; // Radius of Earth in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  if (distance < 1) return '< 1 mile';
  return `${Math.round(distance)} miles`;
};

const getLastActiveText = (updatedAt) => {
  if (!updatedAt) return 'Unknown';

  const hours = Math.floor((Date.now() - new Date(updatedAt)) / (60 * 60 * 1000));

  if (hours < 1) return 'Active now';
  if (hours < 24) return `Active ${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `Active ${days}d ago`;

  return 'Active over a week ago';
};

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  generateSuggestions,
  generateCategorizedSuggestions,
  generateSuggestionStats,
  refreshUserSuggestions,
  getSuggestionsByPreferences,
  buildPreferenceQuery,
  getUserSwipeMeetCounts
};
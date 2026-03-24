const httpStatus = require('http-status');
const { User, DateDay, Gender, InterestedIn, LookingFor, UserProfile, DateActivity,
  Language, Politics, Exercise, Diet, Drink,
  Smoking, Religion, Ethnicity, UserDateDays, Kids, Zodiac, EducationLevel, CulturalBackground, Work, UserPrefs
} = require('../models');
const ApiError = require('../utils/api-error');
const logger = require('../config/logger');
const { sanitizeForLog } = require('../utils/security');


const createUserDateDaysService = async ({ user_id, dates_days }) => {
  let record = await UserDateDays.findOne({ user_id });
  const validDates = await DateDay.find({
    _id: { $in: dates_days }
  });

  if (validDates.length !== dates_days.length) {
    throw new Error('One or more DateDay IDs do not exist');
  }
  if (!record) {
    record = await UserDateDays.create({
      user_id,
      dates_days,
    });
  } else {
    record.dates_days = dates_days;
    await record.save();
  }
  await UserPrefs.findOneAndUpdate({ user_id }, { dates_days })
  return UserDateDays.findById(record._id)
    .populate('dates_days')
    .lean();
};


const getUserDateDaysService = async (user_id) => {
  const userDateDays = await UserDateDays.findOne({ user_id })
    .populate('dates_days')
    .lean();

  if (!userDateDays || !Array.isArray(userDateDays.dates_days)) {
    return userDateDays;
  }

  // Get today's index (Monday = 0 ... Sunday = 6)
  const today = new Date();
  const jsDayIndex = today.getDay(); // Sunday=0
  const todayIndex = (jsDayIndex + 6) % 7;

  // Sort user days by index
  const sortedDays = [...userDateDays.dates_days].sort(
    (a, b) => a.index - b.index
  );

  // Rotate based on today
  const rotatedDays = [
    ...sortedDays.filter(d => d.index >= todayIndex),
    ...sortedDays.filter(d => d.index < todayIndex),
  ];

  // Add labels
  const labeledDays = rotatedDays.map((day, index) => {
    let label = null;

    if (index === 0) label = 'Tonight';
    else if (index === 1) label = 'Tomorrow';

    return { ...day, label };
  });

  return {
    ...userDateDays,
    dates_days: labeledDays
  };
};




async function calculateProfileScores(profileObject) {
  let filledFields = 0;
  let totalFields = 0;

  // Helper to check if a value is actually meaningful (not null, not empty string, not empty {} or [])
  const isFilled = (val) => {
    if (val === null || val === undefined || val === '') return false;
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === 'object') return Object.keys(val).length > 0;
    return true;
  };

  const profileFields = [
    { key: 'name', check: p => isFilled(p.name) },
    { key: 'date_of_birth', check: p => isFilled(p.date_of_birth) },
    { key: 'gender', check: p => isFilled(p.gender) },
    { key: 'interested_in', check: p => isFilled(p.interested_in) },
    { key: 'looking_for', check: p => isFilled(p.looking_for) },
    { key: 'main_img', check: p => isFilled(p.main_img) },
    { key: 'images', check: p => isFilled(p.images) },
    { key: 'about_yourself', check: p => isFilled(p.about_yourself) },
    { key: 'height', check: p => isFilled(p.height) && isFilled(p.height_unit) },
    { key: 'social_links', check: p => isFilled(p.social_links) },

    // Location / Education / Work
    { key: 'location', check: p => isFilled(p.location?.address) },
    { key: 'hometown', check: p => isFilled(p.hometown?.address) },
    { key: 'Institute_name', check: p => isFilled(p.education?.Institute_name) },
    { key: 'major_degree', check: p => isFilled(p.education?.major_degree) },
    { key: 'graduation_year', check: p => isFilled(p.education?.graduation_year) },
    { key: 'job_title', check: p => isFilled(p.occupation?.job_title) },
    { key: 'company_name', check: p => isFilled(p.occupation?.company_name) },

    // Lifestyle
    { key: 'dates_days', check: p => isFilled(p.dates_days) },
    { key: 'exercise', check: p => isFilled(p.exercise) },
    { key: 'diet', check: p => isFilled(p.diet) },
    { key: 'drink', check: p => isFilled(p.drink) },
    { key: 'smoking', check: p => isFilled(p.smoking) },
    { key: 'idea_of_great_date', check: p => isFilled(p.idea_of_great_date) },

    // Values
    { key: 'religion', check: p => isFilled(p.religion) },
    { key: 'ethnicity', check: p => isFilled(p.ethnicity) },
    { key: 'family_plan', check: p => isFilled(p.family_plan) },
    { key: 'kids', check: p => isFilled(p.kids) },
    { key: 'pets', check: p => isFilled(p.pets) },
    { key: 'zodiac', check: p => isFilled(p.zodiac) },
    { key: 'languages', check: p => isFilled(p.languages) },
    { key: 'politics', check: p => isFilled(p.politics) },
  ];

  for (const field of profileFields) {
    totalFields++;
    if (field.check(profileObject)) filledFields++;
  }

  // --- 1.5 Favorite Dates (Categorized) ---
  // Since favorite_dates is an array in DB, we check for presence of 4 specific categories
  const favDates = profileObject.favorite_dates || [];
  const categories = ['food_and_drink', 'active_and_outdoor', 'fun', 'chill_and_cosy'];

  categories.forEach(cat => {
    totalFields++;
    const hasCategory = Array.isArray(favDates)
      ? favDates.some(d => d.category === cat || d._id?.category === cat)
      : !!favDates[cat]; // Fallback for legacy object format
    if (hasCategory) filledFields++;
  });

  const profile_filling_percentage = Math.round((filledFields / totalFields) * 100);

  // --- 2. Trust Score Percentage ---
  let trustedItems = 0;
  const totalTrustItems = 3;

  if (profileObject.user_id) trustedItems++;
  if (isFilled(profileObject.images) && profileObject.images.length >= 2) trustedItems++;
  if (isFilled(profileObject.social_links) && profileObject.social_links.some(link => link.isConnected)) trustedItems++;

  const trust_score_percentage = Math.round((trustedItems / totalTrustItems) * 100);

  return {
    profile_filling_percentage,
    trust_score_percentage
  };
}


const checkExistingPhoneNumber = async (phone, phone_code) => {
  logger.logServiceStart('UserService', 'checkExistingPhoneNumber', {
    phone: sanitizeForLog(phone),
    phone_code: sanitizeForLog(phone_code)
  });
  const checkNumber = await User.findOne({
    phone_number: phone,
    phone_code,
    is_mobile_verified: true
  }).catch((e) => {
    logger.error('[SERVICE] UserService.checkExistingPhoneNumber - Database error', { error: e.message });
  });
  logger.logServiceEnd('UserService', 'checkExistingPhoneNumber', { exists: !!checkNumber });
  return checkNumber
}

const registerUser = async (data) => {
  console.log(data, "data in service");
  const { dates_days, name, date_of_birth, gender, interestedIn, lookingFor, phone, phone_code, is_social_login } = data;
  logger.logServiceStart('UserService', 'registerUser', {
    phone: sanitizeForLog(phone),
    phone_code: sanitizeForLog(phone_code),
    name: sanitizeForLog(name)
  });
  let body = {};
  if (is_social_login) {
    body = {
      phone_number: phone,
      phone_code: phone_code,
      is_mobile_verified: true,
      is_registered: true,
      is_social_login: true,
      social_login_type: data.socialLogin.type,
      social_authId: data.socialLogin.id,
      email: data.socialLogin.email
    }
  } else {
    body = {
      phone_number: phone,
      phone_code: phone_code,
      is_mobile_verified: true,
      is_registered: true
    }
  }
  const registerUser = await User.create(body).catch((e) => {
    logger.error('[SERVICE] UserService.registerUser - User creation failed', { error: e.message });
    throw e;
  });

  const saveProfile = await UserProfile.create({
    user_id: registerUser._id,
    dates_days: dates_days,
    date_of_birth: new Date(date_of_birth.split('-').reverse().join('-')),
    gender: gender,
    interested_in: interestedIn,
    looking_for: lookingFor,
    name: name,
    gender_visibility: true,
    interestedIn_visibility: true,
    lookingFor_visibility: true
  });
  const saveUserPref = await UserPrefs.create({
    user_id: registerUser._id,
    dates_days: dates_days,
    interested_in: {
      interests: interestedIn,
      isImportant: false
    },
    looking_for: {
      looking: lookingFor,
      isImportant: false
    }
  });

  const user_datedays = await UserDateDays.create({
    user_id: registerUser._id,
    dates_days: dates_days
  });


  await User.findByIdAndUpdate(registerUser._id, { is_detailed_submit: true }, { new: true }).catch((e) => {
    logger.error('[SERVICE] UserService.registerUser - User update failed', { error: e.message, userId: sanitizeForLog(registerUser._id) });
  });

  logger.logServiceEnd('UserService', 'registerUser', { userId: sanitizeForLog(registerUser._id) });
  return { registerUser, saveProfile }
}

const dataValidation = async (data) => {
  const { dates_days, name, date_of_birth, gender, interestedIn, lookingFor, phone, phone_code } = data;
  logger.logServiceStart('UserService', 'dataValidation', {
    dates_days: sanitizeForLog(dates_days),
    gender: sanitizeForLog(gender),
    interestedIn: sanitizeForLog(interestedIn),
    lookingFor: sanitizeForLog(lookingFor)
  });

  const [check_date_day, check_gender, check_interestedIn, check_lookingFor] = await Promise.all([
    DateDay.findOne({ _id: dates_days }).catch((e) => {
      logger.error('[SERVICE] UserService.dataValidation - DateDay lookup failed', { error: e.message, dates_days: sanitizeForLog(dates_days) });
    }),
    Gender.findOne({ _id: gender }).catch((e) => {
      logger.error('[SERVICE] UserService.dataValidation - Gender lookup failed', { error: e.message, gender: sanitizeForLog(gender) });
    }),
    InterestedIn.findOne({ _id: interestedIn }).catch((e) => {
      logger.error('[SERVICE] UserService.dataValidation - InterestedIn lookup failed', { error: e.message, interestedIn: sanitizeForLog(interestedIn) });
    }),
    LookingFor.find({ _id: { $in: lookingFor } }).catch((e) => {
      logger.error('[SERVICE] UserService.dataValidation - LookingFor lookup failed', { error: e.message, lookingFor: sanitizeForLog(lookingFor) });
    })
  ]);

  if (!check_date_day) {
    logger.warn('[SERVICE] UserService.dataValidation - Invalid date day', { dates_days: sanitizeForLog(dates_days) });
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid date day');
  }
  if (!check_gender) {
    logger.warn('[SERVICE] UserService.dataValidation - Invalid gender', { gender: sanitizeForLog(gender) });
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid gender');
  }
  if (!check_interestedIn) {
    logger.warn('[SERVICE] UserService.dataValidation - Invalid interestedIn', { interestedIn: sanitizeForLog(interestedIn) });
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid interestedIn');
  }
  if (check_lookingFor.length <= 0) {
    logger.warn('[SERVICE] UserService.dataValidation - Invalid lookingFor', { lookingFor: sanitizeForLog(lookingFor) });
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid lookingFor');
  }

  logger.logServiceEnd('UserService', 'dataValidation', { valid: true });
  return
}


const checkIsRegistered = async (phone, phone_code) => {
  logger.logServiceStart('UserService', 'checkIsRegistered', {
    phone: sanitizeForLog(phone),
    phone_code: sanitizeForLog(phone_code)
  });
  const findRegisteredNumber = await User.findOne({
    phone_number: phone,
    phone_code: phone_code,
    is_mobile_verified: true
  });
  if (!findRegisteredNumber) {
    logger.warn('[SERVICE] UserService.checkIsRegistered - Please register first', { phone: sanitizeForLog(phone), phone_code: sanitizeForLog(phone_code) });
    // throw new ApiError(httpStatus.BAD_REQUEST, 'Please register first');
    return null; // ✅ No error thrown, just return null
  }
  logger.logServiceEnd('UserService', 'checkIsRegistered', { userId: sanitizeForLog(findRegisteredNumber._id) });
  return findRegisteredNumber;
}


const validateAfterRegisterData = async (data) => {
  const { about_yourself, idea_of_great_date, main_photo_url, additional_photos, favorites_dates, city } = data;
  logger.logServiceStart('UserService', 'validateAfterRegisterData', {
    about_yourself: sanitizeForLog(about_yourself),
    idea_of_great_date: sanitizeForLog(idea_of_great_date),
    main_photo_url: sanitizeForLog(main_photo_url),
    city: sanitizeForLog(city)
  });

  const [food_and_drink_check, active_and_outdoor_check, fun_check, chill_and_cozy_check] = await Promise.all([
    DateActivity.findOne({ _id: favorites_dates?.food_and_drink, category: "food_and_drink" }).catch((e) => {
      logger.error('[SERVICE] UserService.dataValidation - DateActivity lookup failed', { error: e.message, favorites_dates: sanitizeForLog(favorites_dates) });
    }),
    DateActivity.findOne({ _id: favorites_dates?.active_and_outdoor, category: "active_and_outdoor" }).catch((e) => {
      logger.error('[SERVICE] UserService.dataValidation - DateActivity lookup failed', { error: e.message, favorites_dates: sanitizeForLog(favorites_dates) });
    }),
    DateActivity.findOne({ _id: favorites_dates?.fun, category: "fun" }).catch((e) => {
      logger.error('[SERVICE] UserService.dataValidation - DateActivity lookup failed', { error: e.message, favorites_dates: sanitizeForLog(favorites_dates) });
    }),
    DateActivity.findOne({ _id: favorites_dates?.chill_and_cozy, category: "chill_and_cosy" }).catch((e) => {
      logger.error('[SERVICE] UserService.dataValidation - DateActivity lookup failed', { error: e.message, favorites_dates: sanitizeForLog(favorites_dates) });
    })
  ]);

  if (!food_and_drink_check) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid food and drink activity');
  }
  if (!active_and_outdoor_check) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid active and outdoor activity');
  }
  if (!fun_check) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid fun activity');
  }
  if (!chill_and_cozy_check) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid chill and cozy activity');
  }
  return;


}

const updateAfterRegisterData = async (data, user) => {
  const { about_yourself, idea_of_great_date, main_photo_url, additional_photos, favorites_dates, location } = data;
  favorites_dates["chill_and_cosy"] = favorites_dates["chill_and_cozy"]
  const update_details = await UserProfile.findOneAndUpdate({ user_id: user._id }, {
    about_yourself,
    idea_of_great_date,
    main_img: main_photo_url,
    images: additional_photos,
    favorite_dates: favorites_dates,
    location: {
      address: location.address,
      type: 'Point',
      coordinates: [location.lng, location.lat] // Note: GeoJSON specifies coordinates as [longitude, latitude]
    }
  }).select({}).catch((e) => { console.log(e) });
  return update_details

}


const getUserProfile = async (user_id) => {
  const profile = await UserProfile.findOne({ user_id })
    .populate('user_id')
    .populate('dates_days')
    .populate('gender')
    .populate('interested_in')
    .populate('looking_for')
    .populate('favorite_dates')
    .populate('work')
    .populate('exercise')
    .populate('cultural_background')
    .populate('diet')
    .populate('drink')
    .populate('smoking')
    .populate('religion')
    .populate('education_level')
    .populate('ethnicity')
    .populate('family_plan')
    .populate('kids')
    .populate('zodiac')
    .populate('languages')
    .populate('politics')
    .populate('social_links')
    .populate('pets');

  if (!profile) return null;

  const p = profile.toObject();

  // 🔒 NULL SAFETY (CRITICAL FOR FLUTTER)
  const safeProfile = {
    ...p,

    // Objects
    education_level: p.education_level ?? {},
    ethnicity: p.ethnicity ?? {},
    work: p.work ?? {},
    religion: p.religion ?? {},
    family_plan: p.family_plan ?? {},
    zodiac: p.zodiac ?? {},

    // Arrays
    dates_days: p.dates_days ?? [],
    favorite_dates: p.favorite_dates ?? [],
    cultural_background: p.cultural_background ?? [],
    languages: p.languages ?? [],
    social_links: p.social_links ?? [],
    pets: p.pets ?? {},

    // Scalars
    height: p.height ?? '',
    about_yourself: p.about_yourself ?? '',
    idea_of_great_date: p.idea_of_great_date ?? '',
  };

  // ✅ Score calculation AFTER sanitizing
  const scores = await calculateProfileScores(safeProfile);

  return {
    user: {
      ...safeProfile,
      ...scores,
    },
  };
};




const updateUserProfile = async (user_id, updateData) => {
  logger.logServiceStart('UserService', 'updateUserProfile', { user_id: sanitizeForLog(user_id) });
  console.log(updateData, "updateData in service");
  // 🟢 Only transform location if present
  if (updateData.location?.lat && updateData.location?.lng) {
    updateData.location = {
      address: updateData.location.address,
      type: 'Point',
      coordinates: [updateData.location.lng, updateData.location.lat]
    };
  }

  if (updateData.hometown?.lat && updateData.hometown?.lng) {
    updateData.hometown = {
      address: updateData.hometown.address,
      type: 'Point',
      coordinates: [updateData.hometown.lng, updateData.hometown.lat]
    };
  }

  console.log(updateData, "Transformed updateData in service");

  for (const key of Object.keys(updateData)) {

    // 1. Remove "", null, undefined fields
    if (updateData[key] === "") {
      updateData[key] = null;
      continue;
    }

    // If null → keep null to overwrite in DB
    if (updateData[key] === null) {
      continue;
    }
    // 2. If the field is an array → remove empty strings inside it
    if (Array.isArray(updateData[key])) {
      // Remove empty strings
      const cleanedArray = updateData[key].filter(v => v !== "");

      // If array becomes empty → save null in DB
      updateData[key] = cleanedArray.length ? cleanedArray : null;
    }
  }
  console.log(updateData, "Final updateData in service");
  if (updateData.location) {
    const { type, coordinates } = updateData.location;

    const isInvalidGeo =
      !type ||
      type !== 'Point' ||
      !Array.isArray(coordinates) ||
      coordinates.length !== 2 ||
      (coordinates[0] === 0 && coordinates[1] === 0);

    if (isInvalidGeo) {
      updateData.location = null; // ✅ DB safe
    }
  }
  if (updateData.hometown) {
    const { type, coordinates } = updateData.hometown;

    const isInvalidGeo =
      !type ||
      type !== 'Point' ||
      !Array.isArray(coordinates) ||
      coordinates.length !== 2 ||
      (coordinates[0] === 0 && coordinates[1] === 0);

    if (isInvalidGeo) {
      updateData.hometown = null; // ✅ DB safe
    }
  }


  const updatedProfile = await UserProfile.findOneAndUpdate(
    { user_id },
    updateData,
    { new: true, runValidators: true }
  )
    .populate('education_level')
    .populate('cultural_background')
    .populate('user_id')
    .populate('dates_days')
    .populate('gender')
    .populate('interested_in')
    .populate('looking_for')
    .populate('work')
    .populate('favorite_dates')
    .populate('exercise')
    .populate('diet')
    .populate('drink')
    .populate('smoking')
    .populate('religion')
    .populate('ethnicity')
    .populate('family_plan')
    .populate('kids')
    .populate('zodiac')
    .populate('languages')
    .populate('pets')
    .populate('politics');

  logger.logServiceEnd('UserService', 'updateUserProfile', { user_id: sanitizeForLog(user_id) });
  const profileObj = updatedProfile.toObject();
  // Calculate scores
  const scores = await calculateProfileScores(profileObj);

  // Return merged response
  return {
    ...profileObj,
    ...scores
  };
};

const verifyDetail = async (data) => {
  logger.logServiceStart('UserService', 'verifyDetail', {
    validationCount: Object.keys(data).length
  });

  const checks = {};

  // Helper: conditionally check fields
  const safeFind = async (Model, query, fieldName) => {
    try {
      const result = await Model.findOne(query);
      if (!result) throw new Error(`Invalid ${fieldName}`);
      checks[fieldName] = true;
    } catch (e) {
      throw new ApiError(httpStatus.BAD_REQUEST, e.message);
    }
  };

  const safeFindMany = async (Model, query, fieldName) => {
    try {
      console.log(query, "query in safeFindMany", Model);
      const results = await Model.find(query);
      console.log(results, "results in safeFindMany");
      if (!results || results.length === 0) throw new Error(`Invalid ${fieldName}`);
      checks[fieldName] = true;
    } catch (e) {
      throw new ApiError(httpStatus.BAD_REQUEST, e.message);
    }
  };

  // 🟢 Conditionally validate only if the field is provided
  const {
    dates_days,
    gender,
    interested_in,
    looking_for,
    work,
    favorite_dates,
    exercise,
    diet,
    drink,
    smoking,
    religion,
    ethnicity,
    kids,
    education_level,
    cultural_background,
    zodiac,
    languages,
    politics
  } = data;

  const promises = [];

  if (dates_days?.length) promises.push(safeFindMany(DateDay, { _id: { $in: dates_days } }, 'dates_days'));
  if (gender) promises.push(safeFind(Gender, { _id: gender }, 'gender'));
  if (interested_in && interested_in !== "") promises.push(safeFind(InterestedIn, { _id: interested_in }, 'interested_in'));
  if (looking_for?.length && looking_for[0] !== "") promises.push(safeFindMany(LookingFor, { _id: { $in: looking_for } }, 'looking_for'));
  if (work?.length && work[0] !== "") promises.push(safeFindMany(Work, { _id: { $in: work } }, 'work'));
  if (favorite_dates?.length && favorite_dates[0] !== "") promises.push(safeFindMany(DateActivity, { _id: { $in: favorite_dates } }, 'favorite_dates'));
  if (exercise && exercise !== "") promises.push(safeFind(Exercise, { _id: exercise }, 'exercise'));
  if (diet && diet !== "") promises.push(safeFind(Diet, { _id: diet }, 'diet'));
  if (drink && drink !== "") promises.push(safeFind(Drink, { _id: drink }, 'drink'));
  if (smoking && smoking !== "") promises.push(safeFind(Smoking, { _id: smoking }, 'smoking'));
  if (religion && religion !== "") promises.push(safeFind(Religion, { _id: religion }, 'religion'));
  if (ethnicity && ethnicity !== "") promises.push(safeFind(Ethnicity, { _id: ethnicity }, 'ethnicity'));
  if (kids && kids !== "") promises.push(safeFind(Kids, { _id: kids }, 'kids'));
  if (education_level && education_level !== "") promises.push(safeFind(EducationLevel, { _id: education_level }, 'education_level'));
  if (cultural_background?.length && cultural_background[0] !== "") promises.push(safeFindMany(CulturalBackground, { _id: { $in: cultural_background } }, 'cultural_background'));
  if (zodiac && zodiac !== "") promises.push(safeFind(Zodiac, { _id: zodiac }, 'zodiac'));
  if (languages?.length && languages[0] !== "") promises.push(safeFindMany(Language, { _id: { $in: languages } }, 'languages'));
  if (politics && politics !== "") promises.push(safeFind(Politics, { _id: politics }, 'politics'));
  await Promise.all(promises);

  logger.logServiceEnd('UserService', 'verifyDetail', checks);
};


const deleteUserAccount = async (user) => {
  logger.logServiceStart('UserService', 'deleteUserAccount', { userId: sanitizeForLog(String(user._id).replace(/[^a-f0-9]/gi, '')) });
  await User.findByIdAndDelete(user._id).catch((e) => {
    logger.error('[SERVICE] UserService.deleteUserAccount - User deletion failed', { error: e.message, userId: sanitizeForLog(String(user._id).replace(/[^a-f0-9]/gi, '')) });
    throw e;
  });
  await UserProfile.findOneAndDelete({ user_id: user._id }).catch((e) => {
    logger.error('[SERVICE] UserService.deleteUserAccount - UserProfile deletion failed', { error: e.message, userId: sanitizeForLog(String(user._id).replace(/[^a-f0-9]/gi, '')) });
  });
  await UserPrefs.findOneAndDelete({ user_id: user._id }).catch((e) => {
    logger.error('[SERVICE] UserService.deleteUserAccount - UserPrefs deletion failed', { error: e.message, userId: sanitizeForLog(String(user._id).replace(/[^a-f0-9]/gi, '')) });
  });
  await UserDateDays.findOneAndDelete({ user_id: user._id }).catch((e) => {
    logger.error('[SERVICE] UserService.deleteUserAccount - UserDateDays deletion failed', { error: e.message, userId: sanitizeForLog(String(user._id).replace(/[^a-f0-9]/gi, '')) });
  });
  logger.logServiceEnd('UserService', 'deleteUserAccount', { userId: sanitizeForLog(String(user._id).replace(/[^a-f0-9]/gi, '')) });
  return;
}

const updateProfileImage = async (user_id, image_url) => {
  logger.logServiceStart('UserService', 'updateProfileImage', { userId: sanitizeForLog(user_id) });
  const updatedProfile = await UserProfile.findOneAndUpdate(
    { user_id },
    { main_img: image_url },
    { new: true }
  );
  logger.logServiceEnd('UserService', 'updateProfileImage', { userId: sanitizeForLog(user_id) });
  return updatedProfile;
};

const updateProfileImageUrl = async (user_id, image_url) => {
  logger.logServiceStart('UserService', 'updateProfileImageUrl', { userId: sanitizeForLog(user_id) });
  const updatedProfile = await UserProfile.findOneAndUpdate(
    { user_id },
    { main_img: image_url },
    { new: true }
  );
  logger.logServiceEnd('UserService', 'updateProfileImageUrl', { userId: sanitizeForLog(user_id) });
  return updatedProfile;
};

const getUserById = async (userId) => {
  console.log("============================", userId);
  return await User.findById(userId);
};




module.exports = {
  checkExistingPhoneNumber,
  registerUser,
  dataValidation,
  checkIsRegistered,
  validateAfterRegisterData,
  updateAfterRegisterData,
  getUserProfile,
  updateUserProfile,
  verifyDetail,
  deleteUserAccount,
  updateProfileImage,
  updateProfileImageUrl,
  createUserDateDaysService,
  getUserDateDaysService,
  getUserById

};


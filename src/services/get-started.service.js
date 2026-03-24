const { City, DateActivity, LookingFor, UserPets, InterestedIn, User, Gender, DateDay, Work, Location, Hometown, CulturalBackground, Exercise, Diet, Drink, Smoking, Religion, Ethnicity, EducationLevel, FamilyPlan, Kids, Zodiac, Language, Politics, Pets } = require('../models');
const logger = require('../config/logger');
// const { mongoose } = require('../config/config');
const mongoose = require('mongoose');
const ApiError = require('../utils/api-error');
const httpStatus = require('http-status');

const getDatesDays = async () => {
    logger.logServiceStart('GetStartedService', 'getDatesDays');
    const allDays = await DateDay.find().sort({ index: 1 }).lean();
    const today = new Date();
    const jsDayIndex = today.getDay(); // Sunday=0, Monday=1, Tuesday=2 ...
    const todayIndex = (jsDayIndex + 6) % 7;
    const rotatedDays = [...allDays.slice(todayIndex), ...allDays.slice(0, todayIndex)];
    const result = rotatedDays.map((day, index) => {
        let label = null;
        if (index === 0) {
            label = 'Tonight';
        } else if (index === 1) {
            label = 'Tomorrow';
        }
        return { ...day, label };
    });

    logger.logServiceEnd('GetStartedService', 'getDatesDays', { count: result?.length });
    return result;
};

const getGenders = async () => {
    logger.logServiceStart('GetStartedService', 'getGenders');
    const result = await Gender.find().sort({ index: 1 });
    logger.logServiceEnd('GetStartedService', 'getGenders', { count: result?.length });
    return result;
};


const geteducationLevels = async () => {
    logger.logServiceStart('GetStartedService', 'geteducationLevels');
    const result = await EducationLevel.find().sort({ index: 1 });
    logger.logServiceEnd('GetStartedService', 'geteducationLevels', { count: result?.length });
    return result;
};
const getInterestedIn = async () => {
    logger.logServiceStart('GetStartedService', 'getInterestedIn');
    const result = await InterestedIn.find().sort({ index: 1 });
    logger.logServiceEnd('GetStartedService', 'getInterestedIn', { count: result?.length });
    return result;
};

const getLookingFor = async () => {
    logger.logServiceStart('GetStartedService', 'getLookingFor');
    const result = await LookingFor.find().sort({ index: 1 });
    logger.logServiceEnd('GetStartedService', 'getLookingFor', { count: result?.length });
    return result;
};

const getFavoriteDates = async () => {
    logger.logServiceStart('GetStartedService', 'getFavoriteDates');

    const result = await DateActivity.aggregate([
        // Sort all documents by categoryIndex then index
        { $sort: { categoryIndex: 1, index: 1 } },

        {
            $group: {
                _id: '$category',
                categoryIndex: { $first: '$categoryIndex' },   // <-- important
                activities: {
                    $push: {
                        _id: '$_id',
                        name: '$name',
                        icon: '$icon'
                    }
                }
            }
        },

        // Sort groups by categoryIndex (1,2,3,4)
        { $sort: { categoryIndex: 1 } },

        // Remove categoryIndex from final output (optional)
        {
            $project: {
                categoryIndex: 0
            }
        }
    ]);

    logger.logServiceEnd('GetStartedService', 'getFavoriteDates', { count: result?.length });
    return result;
};


const getWork = async () => {
    logger.logServiceStart('GetStartedService', 'getWork');
    const result = await Work.find().sort({ name: 1 });
    logger.logServiceEnd('GetStartedService', 'getWork', { count: result?.length });
    return result;
};

const getLocation = async () => {
    logger.logServiceStart('GetStartedService', 'getLocation');
    const result = await Location.find()
    logger.logServiceEnd('GetStartedService', 'getLocation', { count: result?.length });
    return result;
};

const getHometown = async () => {
    logger.logServiceStart('GetStartedService', 'getHometown');
    const result = await Hometown.find()
    console.log(result);
    // logger.logServiceEnd('GetStartedService', 'getHometown', { count: result?.length });
    return result;
};


const getExercise = async () => {
    logger.logServiceStart('GetStartedService', 'getExercise');
    const result = await Exercise.find().sort({ index: 1 });
    logger.logServiceEnd('GetStartedService', 'getExercise', { count: result?.length });
    return result;
};

const getDiet = async () => {
    logger.logServiceStart('GetStartedService', 'getDiet');
    const result = await Diet.find().sort({ index: 1 });
    logger.logServiceEnd('GetStartedService', 'getDiet', { count: result?.length });
    return result;
};

const getDrink = async () => {
    logger.logServiceStart('GetStartedService', 'getDrink');
    const result = await Drink.find().sort({ index: 1 });
    logger.logServiceEnd('GetStartedService', 'getDrink', { count: result?.length });
    return result;
};

const getSmoking = async () => {
    logger.logServiceStart('GetStartedService', 'getSmoking');
    const result = await Smoking.find().sort({ index: 1 });
    logger.logServiceEnd('GetStartedService', 'getSmoking', { count: result?.length });
    return result;
};

const getReligion = async (user_id) => {
    logger.logServiceStart("GetStartedService", "getReligion");
    const COMMON_RELIGIONS = [
        "Bahá'í Faith",
        "Jainism",
        "Other",
        "Judaism",
        "Sikhism",
        "Buddhism",
        "Hinduism",
        "Islam",
        "Christianity"
        ];
    const result = await Religion.find({
        $or: [
            { user_id: user_id },
            { name: { $in: COMMON_RELIGIONS } }
        ]
    }).sort({ index: 1 });

    logger.logServiceEnd("GetStartedService", "getReligion", { count: result.length });
    return result;
};


const getEthnicity = async (user_id) => {
  logger.logServiceStart("GetStartedService", "getEthnicity");
  const COMMON_ETHNICITIES = [
        "White/Caucasian",
        "Hispanic/Latino",
        "Black/African Descent",
        "East Asian",
        "Middle Eastern",
        "South Asian",
        "Native American / Indigenous",
        "Pacific Islander",
        "Other"
        ];

  const allEthnicities = await Ethnicity.find({
    $or: [
      { user_id: user_id },
      { name: { $in: COMMON_ETHNICITIES } }
    ]
  }).sort({ index: 1 });
  logger.logServiceEnd("GetStartedService", "getEthnicity", { count: allEthnicities.length });
  return allEthnicities;
};


const getFamilyPlan = async () => {
    logger.logServiceStart('GetStartedService', 'getFamilyPlan');
    const result = await FamilyPlan.find().sort({ index: 1 });
    logger.logServiceEnd('GetStartedService', 'getFamilyPlan', { count: result?.length });
    return result;
};

const getKids = async () => {
    logger.logServiceStart('GetStartedService', 'getKids');
    const result = await Kids.find().sort({ index: 1 });
    logger.logServiceEnd('GetStartedService', 'getKids', { count: result?.length });
    return result;
};

const getZodiac = async () => {
    logger.logServiceStart('GetStartedService', 'getZodiac');
    const result = await Zodiac.find().sort({ index: 1 });
    logger.logServiceEnd('GetStartedService', 'getZodiac', { count: result?.length });
    return result;
};

const getLanguage = async () => {
    logger.logServiceStart('GetStartedService', 'getLanguage');
    const result = await Language.find();


    logger.logServiceEnd('GetStartedService', 'getLanguage', { count: result?.length });
    return result;
};

const getPolitics = async () => {
    logger.logServiceStart('GetStartedService', 'getPolitics');
    const result = await Politics.find().sort({ index: 1 });
    logger.logServiceEnd('GetStartedService', 'getPolitics', { count: result?.length });
    return result;
};

const getCities = async () => {
    logger.logServiceStart('GetStartedService', 'getCities');
    const result = await City.find();
    logger.logServiceEnd('GetStartedService', 'getCities', { count: result?.length });
    return result;
};

const getCulturalBackgroundService = async () => {
    logger.logServiceStart('GetStartedService', 'getCulturalBackgroundService');
    const result = await CulturalBackground.find();
    logger.logServiceEnd('GetStartedService', 'getCulturalBackgroundService', { count: result?.length });
    return result;
};

const getPets = async (user_id) => {
  logger.logServiceStart("GetStartedService", "getPets");

    const COMMON_PETS = [
        "Dog",
        "Cat",
        "No Pets - but like them!",
        "Don't Like Pets",
        "Other Pets"
        ];

  const allPets = await Pets.find({
       $or: [
      { user_id: user_id },
      { name: { $in: COMMON_PETS } }
            ]
        }).sort({ index: 1 });
  logger.logServiceEnd("GetStartedService", "getPets", { count: allPets.length });
  return allPets;
};

const capitalize = (str = "") =>
         str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()

const addPets = async (name, userId) => {
    find_user = await User.findOne({_id: mongoose.Types.ObjectId(userId) });
    if (!find_user) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'User not found');
    }
    logger.logServiceStart('GetStartedService', 'addPets');
    const result = await Pets.create({  name: capitalize(name), user_id: find_user._id });
    logger.logServiceEnd('GetStartedService', 'addPets', { count: result?.length });
    return result;
};

const createReligion = async (name, user_id) => {
    find_user = await User.findOne({_id: mongoose.Types.ObjectId(user_id) });
    if (!find_user) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'User not found');
    }
    logger.logServiceStart('GetStartedService', 'createReligion');
    const result = await Religion.create({name: capitalize(name), user_id: find_user._id });
    logger.logServiceEnd('GetStartedService', 'createReligion', { count: result?.length });
    return result;
};

const createEthnicity = async (ethnicityData, user_id) => {
    find_user = await User.findOne({_id: mongoose.Types.ObjectId(user_id) });
    if (!find_user) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'User not found');
    }
    logger.logServiceStart('GetStartedService', 'createEthnicity');
    console.log(ethnicityData);
    const result = await Ethnicity.create({name: capitalize(ethnicityData.name), user_id: find_user._id });
    logger.logServiceEnd('GetStartedService', 'createEthnicity', { count: result?.length });
    return result;
};

module.exports = {
    getDatesDays,
    getGenders,
    getInterestedIn,
    getLookingFor,
    getFavoriteDates,
    getWork,
    getLocation,
    getHometown,
    getExercise,
    getDiet,
    getDrink,
    getSmoking,
    getReligion,
    getEthnicity,
    getFamilyPlan,
    getKids,
    getZodiac,
    getLanguage,
    getPolitics,
    getCities,
    geteducationLevels,
    getCulturalBackgroundService,
    getPets,
    addPets,
    createReligion,
    createEthnicity
};

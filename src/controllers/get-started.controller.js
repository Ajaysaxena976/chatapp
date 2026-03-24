const httpStatus = require('http-status');
const catchAsync = require('../utils/catch-async');
const { getStartedService } = require('../services');
const logger = require('../config/logger');

const getDatesDays = catchAsync(async (req, res) => {
    logger.logControllerStart('GetStartedController', 'getDatesDays');
    const result = await getStartedService.getDatesDays();
    logger.logControllerEnd('GetStartedController', 'getDatesDays', { count: result?.length });
    res.status(httpStatus.OK).send(result);
});

const getGenders = catchAsync(async (req, res) => {
    logger.logControllerStart('GetStartedController', 'getGenders');
    const result  = await getStartedService.getGenders();
    const transformedResult = result.map(doc => doc.toObject()); 
    logger.logControllerEnd('GetStartedController', 'getGenders', { count: result?.length });
    res.status(httpStatus.OK).send(transformedResult);
});

const educationLevels = catchAsync(async (req, res) => {
    logger.logControllerStart('GetStartedController', 'educationLevels');
    const result = await getStartedService.geteducationLevels();
    const transformedResult = result.map(doc => doc.toObject()); 
    logger.logControllerEnd('GetStartedController', 'educationLevels', { count: result?.length });
    res.status(httpStatus.OK).send(transformedResult);
});

const getCulturalBackground = catchAsync(async (req, res) => {
    logger.logControllerStart('GetStartedController', 'getCulturalBackground');
    const result = await getStartedService.getCulturalBackgroundService();
    const transformedResult = result.map(doc => doc.toObject()); 
    logger.logControllerEnd('GetStartedController', 'getCulturalBackground', { count: result?.length });
    res.status(httpStatus.OK).send(transformedResult);
});




const getInterestedIn = catchAsync(async (req, res) => {
    logger.logControllerStart('GetStartedController', 'getInterestedIn');
    const result = await getStartedService.getInterestedIn();
    const transformedResult = result.map(doc => doc.toObject()); 
    logger.logControllerEnd('GetStartedController', 'getInterestedIn', { count: result?.length });
    res.status(httpStatus.OK).send(transformedResult);
});

const getLookingFor = catchAsync(async (req, res) => {
    logger.logControllerStart('GetStartedController', 'getLookingFor');
    const result = await getStartedService.getLookingFor();
    const transformedResult = result.map(doc => doc.toObject()); 
    logger.logControllerEnd('GetStartedController', 'getLookingFor', { count: result?.length });
    res.status(httpStatus.OK).send(transformedResult);
});


const getFavoriteDates = catchAsync(async (req, res) => {
    logger.logControllerStart('GetStartedController', 'getFavoriteDates');
    const Result = await getStartedService.getFavoriteDates();
    logger.logControllerEnd('GetStartedController', 'getFavoriteDates', { count: Result?.length });
    res.status(httpStatus.OK).send(Result);
});

const getWork = catchAsync(async (req, res) => {
    logger.logControllerStart('GetStartedController', 'getWork');
    const result = await getStartedService.getWork();
    const transformedResult = result.map(doc => doc.toObject()); 
    logger.logControllerEnd('GetStartedController', 'getWork', { count: result?.length });
    res.status(httpStatus.OK).send(transformedResult);
});

const getLocation = catchAsync(async (req, res) => {
    logger.logControllerStart('GetStartedController', 'getLocation');
    const result = await getStartedService.getLocation();
    const transformedResult = result.map(doc => doc.toObject()); 
    logger.logControllerEnd('GetStartedController', 'getLocation', { count: result?.length });
    res.status(httpStatus.OK).send(transformedResult);
});

const getHometown = catchAsync(async (req, res) => {
    logger.logControllerStart('GetStartedController', 'getHometown');
    const result = await getStartedService.getHometown();
    const transformedResult = result.map(doc => doc.toObject()); 
    logger.logControllerEnd('GetStartedController', 'getHometown', { count: result?.length });
    res.status(httpStatus.OK).send(transformedResult);
});

const getExercise = catchAsync(async (req, res) => {
    logger.logControllerStart('GetStartedController', 'getExercise');
    const result = await getStartedService.getExercise();
    const transformedResult = result.map(doc => doc.toObject()); 
    logger.logControllerEnd('GetStartedController', 'getExercise', { count: result?.length });
    res.status(httpStatus.OK).send(transformedResult);
});

const getDiet = catchAsync(async (req, res) => {
    logger.logControllerStart('GetStartedController', 'getDiet');
    const result = await getStartedService.getDiet();
    const transformedResult = result.map(doc => doc.toObject()); 
    logger.logControllerEnd('GetStartedController', 'getDiet', { count: result?.length });
    res.status(httpStatus.OK).send(transformedResult);
});

const getDrink = catchAsync(async (req, res) => {
    logger.logControllerStart('GetStartedController', 'getDrink');
    const result = await getStartedService.getDrink();
    const transformedResult = result.map(doc => doc.toObject()); 
    logger.logControllerEnd('GetStartedController', 'getDrink', { count: result?.length });
    res.status(httpStatus.OK).send(transformedResult);
});

const getSmoking = catchAsync(async (req, res) => {
    logger.logControllerStart('GetStartedController', 'getSmoking');
    const result = await getStartedService.getSmoking();
    const transformedResult = result.map(doc => doc.toObject());
    logger.logControllerEnd('GetStartedController', 'getSmoking', { count: result?.length });
    res.status(httpStatus.OK).send(transformedResult);
});

const getReligion = catchAsync(async (req, res) => {
    const user_id = req.user._id;
    logger.logControllerStart('GetStartedController', 'getReligion');
    const result = await getStartedService.getReligion(user_id);
    const transformedResult = result.map(doc => doc.toObject());
    logger.logControllerEnd('GetStartedController', 'getReligion', { count: result?.length });
    res.status(httpStatus.OK).send(transformedResult);
});

const getEthnicity = catchAsync(async (req, res) => {
    const user_id = req.user._id;
    logger.logControllerStart('GetStartedController', 'getEthnicity');
    const result = await getStartedService.getEthnicity(user_id);
    const transformedResult = result.map(doc => doc.toObject());
    logger.logControllerEnd('GetStartedController', 'getEthnicity', { count: result?.length });
    res.status(httpStatus.OK).send(transformedResult);
});

const getFamilyPlan = catchAsync(async (req, res) => {
    logger.logControllerStart('GetStartedController', 'getFamilyPlan');
    const result = await getStartedService.getFamilyPlan();
    const transformedResult = result.map(doc => doc.toObject());
    logger.logControllerEnd('GetStartedController', 'getFamilyPlan', { count: result?.length });
    res.status(httpStatus.OK).send(transformedResult);
});

const getKids = catchAsync(async (req, res) => {
    logger.logControllerStart('GetStartedController', 'getKids');
    const result = await getStartedService.getKids();
    const transformedResult = result.map(doc => doc.toObject());
    logger.logControllerEnd('GetStartedController', 'getKids', { count: result?.length });
    res.status(httpStatus.OK).send(transformedResult);
}); 

const getZodiac = catchAsync(async (req, res) => {
    logger.logControllerStart('GetStartedController', 'getZodiac');
    const result = await getStartedService.getZodiac();
    const transformedResult = result.map(doc => doc.toObject());
    logger.logControllerEnd('GetStartedController', 'getZodiac', { count: result?.length });
    res.status(httpStatus.OK).send(transformedResult);
});

const getLanguage = catchAsync(async (req, res) => {
    logger.logControllerStart('GetStartedController', 'getLanguage');
    const result = await getStartedService.getLanguage();
    const transformedResult = result.map(doc => doc.toObject());
    logger.logControllerEnd('GetStartedController', 'getLanguage', { count: result?.length });
    res.status(httpStatus.OK).send(transformedResult);
});

const getPolitics = catchAsync(async (req, res) => {
    logger.logControllerStart('GetStartedController', 'getPolitics');
    const result = await getStartedService.getPolitics();
    const transformedResult = result.map(doc => doc.toObject());
    logger.logControllerEnd('GetStartedController', 'getPolitics', { count: result?.length });
    res.status(httpStatus.OK).send(transformedResult);
});

const getCities = catchAsync(async (req, res) => {
    logger.logControllerStart('GetStartedController', 'getCities');
    const result = await getStartedService.getCities();
    const transformedResult = result.map(doc => doc.toObject());
    logger.logControllerEnd('GetStartedController', 'getCities', { count: result?.length });
    res.status(httpStatus.OK).send(transformedResult);
});

const getPets = catchAsync(async (req, res) => {
    const userId = req.user._id;
    logger.logControllerStart('GetStartedController', 'getPets');
    const result = await getStartedService.getPets(userId);
    const transformedResult = result.map(doc => doc.toObject());
    logger.logControllerEnd('GetStartedController', 'getPets', { count: result?.length });
    res.status(httpStatus.OK).send(transformedResult);
})

const addPets = catchAsync(async (req, res) => {
    const userId = req.user._id;
    const name = req.body.name;
    logger.logControllerStart('GetStartedController', 'addPets');
    const result = await getStartedService.addPets(name, userId);
    logger.logControllerEnd('GetStartedController', 'addPets', { count: result?.length });
    res.status(httpStatus.OK).send(result);
})

const createReligion = catchAsync(async (req, res) => {
    logger.logControllerStart('GetStartedController', 'createReligion');
    user_id = req.user._id;
    name = req.body.name;
    console.log(name,user_id,"=========================");
    const result = await getStartedService.createReligion(name, user_id);
    logger.logControllerEnd('GetStartedController', 'createReligion', { count: result?.length });
    res.status(httpStatus.OK).send(result);
});

const createEthnicity = catchAsync(async (req, res) => {
    const user_id = req.user._id;
    logger.logControllerStart('GetStartedController', 'createEthnicity');
    const result = await getStartedService.createEthnicity(req.body, user_id);
    logger.logControllerEnd('GetStartedController', 'createEthnicity', { count: result?.length });
    res.status(httpStatus.OK).send(result);
});

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
    educationLevels,
    getCulturalBackground,
    getPets,
    createReligion,
    addPets,
    createEthnicity
}
const express = require('express');
const validate = require('../../middlewares/validation-handler');
const getStartedController = require('../../controllers/get-started.controller');
const auth = require('../../middlewares/auth');
const { getStartedValidation} = require('../../validations');

const router = express.Router();

/**
 * @swagger
 * /get-started/dates_days:
 *   get:
 *     summary: Get available date days
 *     tags: [Get Started]
 *     responses:
 *       200:
 *         description: List of available date days
 */
router.get('/dates_days', getStartedController.getDatesDays);

/**
 * @swagger
 * /get-started/genders:
 *   get:
 *     summary: Get available genders
 *     tags: [Get Started]
 *     responses:
 *       200:
 *         description: List of available genders
 */
router.get('/genders', getStartedController.getGenders);

/**
 * @swagger
 * /get-started/interested_in:
 *   get:
 *     summary: Get interested in options
 *     tags: [Get Started]
 *     responses:
 *       200:
 *         description: List of interested in options
 */
router.get('/interested_in', getStartedController.getInterestedIn);

/**
 * @swagger
 * /get-started/looking_for:
 *   get:
 *     summary: Get looking for options
 *     tags: [Get Started]
 *     responses:
 *       200:
 *         description: List of looking for options
 */
router.get('/looking_for', getStartedController.getLookingFor);

/**
 * @swagger
 * /get-started/favorite_dates:
 *   get:
 *     summary: Get favorite date options
 *     tags: [Get Started]
 *     responses:
 *       200:
 *         description: List of favorite date options
 */
router.get('/favorite_dates', getStartedController.getFavoriteDates);

/**
 * @swagger
 * /get-started/work:
 *   get:
 *     summary: Get work categories
 *     tags: [Get Started]
 *     responses:
 *       200:
 *         description: List of work categories
 */
router.get('/work', getStartedController.getWork);

/**
 * @swagger
 * /get-started/location:
 *   get:
 *     summary: Get locations
 *     tags: [Get Started]
 *     responses:
 *       200:
 *         description: List of locations
 */
router.get('/location', getStartedController.getLocation);

/**
 * @swagger
 * /get-started/hometown:
 *   get:
 *     summary: Get hometowns
 *     tags: [Get Started]
 *     responses:
 *       200:
 *         description: List of hometowns
 */
router.get('/hometown', getStartedController.getHometown);

/**
 * @swagger
 * /get-started/exercise:
 *   get:
 *     summary: Get exercise options
 *     tags: [Get Started]
 *     responses:
 *       200:
 *         description: List of exercise options
 */
router.get('/exercise', getStartedController.getExercise);

/**
 * @swagger
 * /get-started/diet:
 *   get:
 *     summary: Get diet options
 *     tags: [Get Started]
 *     responses:
 *       200:
 *         description: List of diet options
 */
router.get('/diet', getStartedController.getDiet);

/**
 * @swagger
 * /get-started/drink:
 *   get:
 *     summary: Get drinking options
 *     tags: [Get Started]
 *     responses:
 *       200:
 *         description: List of drinking options
 */
router.get('/drink', getStartedController.getDrink);

/**
 * @swagger
 * /get-started/smoking:
 *   get:
 *     summary: Get smoking options
 *     tags: [Get Started]
 *     responses:
 *       200:
 *         description: List of smoking options
 */
router.get('/smoking', getStartedController.getSmoking);

/**
 * @swagger
 * /get-started/religion:
 *   get:
 *     summary: Get religion options
 *     tags: [Get Started]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of religion options
 */
router.get('/religion', auth(), getStartedController.getReligion);

/**
 * @swagger
 * /get-started/ethnicity:
 *   get:
 *     summary: Get ethnicity options
 *     tags: [Get Started]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of ethnicity options
 */
router.get('/ethnicity', auth(), getStartedController.getEthnicity);

// /**
//  * @swagger
//  * /get-started/family-plan:
//  *   get:
//  *     summary: Get family plan options
//  *     tags: [Get Started]
//  *     responses:
//  *       200:
//  *         description: List of family plan options
//  */
// router.get('/family-plan', getStartedController.getFamilyPlan);

/**
 * @swagger
 * /get-started/kids:
 *   get:
 *     summary: Get kids options
 *     tags: [Get Started]
 *     responses:
 *       200:
 *         description: List of kids options
 */
router.get('/kids', getStartedController.getKids);

/**
 * @swagger
 * /get-started/zodiac:
 *   get:
 *     summary: Get zodiac signs
 *     tags: [Get Started]
 *     responses:
 *       200:
 *         description: List of zodiac signs
 */
router.get('/zodiac', getStartedController.getZodiac);

/**
 * @swagger
 * /get-started/language:
 *   get:
 *     summary: Get language options
 *     tags: [Get Started]
 *     responses:
 *       200:
 *         description: List of language options
 */
router.get('/language', getStartedController.getLanguage);

/**
 * @swagger
 * /get-started/politics:
 *   get:
 *     summary: Get political options
 *     tags: [Get Started]
 *     responses:
 *       200:
 *         description: List of political options
 */
router.get('/politics', getStartedController.getPolitics);

/**
 * @swagger
 * /get-started/cities:
 *   get:
 *     summary: Get cities
 *     tags: [Get Started]
 *     responses:
 *       200:
 *         description: List of cities
 */
router.get('/cities', getStartedController.getCities);

/**
 * @swagger
 * /get-started/education-level:
 *   get:
 *     summary: Get education-level options
 *     tags: [Get Started]
 *     responses:
 *       200:
 *         description: List of education-level options
 */
router.get('/education-level', getStartedController.educationLevels);

/**
 * @swagger
 * /get-started/cultural-background:
 *   get:
 *     summary: Get cultural-background options
 *     tags: [Get Started]
 *     responses:
 *       200:
 *         description: List of cultural-background options
 */
router.get('/cultural-background', getStartedController.getCulturalBackground);

/**
 * @swagger
 * /get-started/pets:
 *   get:
 *     summary: Get pets options
 *     tags: [Get Started]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pets options
 */
router.get('/pets', auth(), getStartedController.getPets);

/**
 *  @swagger 
 * /get-started/pets:
 *   post:
 *     summary: Add Pets
 *     tags: [Get Started]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Buddy"
 *     responses:
 *       200:
 *         description: Pet added successfully
 */
router.post('/pets', auth(), validate(getStartedValidation.addPets) , getStartedController.addPets);

/**
 * @swagger
 * /get-started/add/religion:
 *   post:
 *     summary: Add a new religion option
 *     tags: [Get Started]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the religion
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: Religion option created successfully
 *       400:
 *         description: Bad request
 */
router.post('/add/religion', auth(), validate(getStartedValidation.createReligion), getStartedController.createReligion);   

/**
 * @swagger
 * /get-started/add/ethnicity:
 *   post:
 *     summary: Add a new ethnicity option
 *     tags: [Get Started]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the ethnicity
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: Ethnicity option created successfully
 *       400:
 *         description: Bad request
 */
router.post('/add/ethnicity', auth(), validate(getStartedValidation.createEthnicity), getStartedController.createEthnicity);

module.exports = router;
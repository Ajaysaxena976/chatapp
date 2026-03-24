const express = require('express');
const validate = require('../../middlewares/validation-handler');
const auth = require('../../middlewares/auth');
const preferenceController = require('../../controllers/preference.controller');
const preferenceValidation = require('../../validations/preference.validation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Preferences
 *   description: User preferences
 */

/**
 * @swagger
 * /preference:
 *   patch:
 *     summary: Update the user preferences
 *     tags: [Preferences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               general_filter:
 *                 type: object
 *                 properties:
 *                   interested_in:
 *                     type: object
 *                     properties:
 *                       interests:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: 68cc41a424ef6e001119ea80
 *                       isImportant:
 *                         type: boolean
 *                   dates_days:
 *                     type: array
 *                     items:
 *                       type: string
 *                       example: 68cc41a424ef6e001119ea81
 *                   looking_for:
 *                     type: object
 *                     properties:
 *                       looking:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: 68cc41a424ef6e001119eab2
 *                       isImportant:
 *                         type: boolean
 *                   currentlocation:
 *                     type: object
 *                     properties:
 *                       address:
 *                         type: string
 *                       lat:
 *                         type: number
 *                         example: 12.9716
 *                       lon:
 *                         type: number
 *                         example: 77.5946
 *                     required:
 *                       - lat
 *                       - lon
 *                   hometown:
 *                     type: object
 *                     properties:
 *                       address:
 *                         type: string
 *                       lat:
 *                         type: number
 *                         example: 22.7196
 *                       lon:
 *                         type: number
 *                         example: 75.8577
 *                     required:
 *                       - lat
 *                       - lon
 *                   age:
 *                     type: object
 *                     properties:
 *                       min:
 *                         type: integer
 *                         minimum: 1
 *                         maximum: 100
 *                       max:
 *                         type: integer
 *                         minimum: 1
 *                         maximum: 100
 *                       opt_run_out:
 *                         type: boolean
 *                   distance:
 *                     type: object
 *                     properties:
 *                       value:
 *                         type: integer
 *                         minimum: 1
 *                         maximum: 100
 *                       opt_run_out:
 *                         type: boolean
 *               advance_filter:
 *                 type: object
 *                 properties:
 *                   height:
 *                     type: object
 *                     properties:
 *                       min:
 *                         type: integer
 *                         minimum: 1
 *                       max:
 *                         type: integer
 *                         minimum: 1
 *                       unit:
 *                         type: string
 *                         enum: [cm, ft]
 *                       isImportant:
 *                         type: boolean
 *                   exercise:
 *                     type: object
 *                     properties:
 *                       exercises:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: 68cc41a424ef6e001119ea69
 *                       isImportant:
 *                         type: boolean
 *                   diet:
 *                     type: object
 *                     properties:
 *                       diets:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: 68cc41a424ef6e001119ea50
 *                       isImportant:
 *                         type: boolean
 *                   drink:
 *                     type: object
 *                     properties:
 *                       drinks:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: 68cc41a424ef6e001119ea56
 *                       isImportant:
 *                         type: boolean
 *                   smoke:
 *                     type: object
 *                     properties:
 *                       smokings:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: 68cc41a424ef6e001119ead3
 *                       isImportant:
 *                         type: boolean
 *                   religion:
 *                     type: object
 *                     properties:
 *                       religions:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: 68cc41a424ef6e001119eac1
 *                       isImportant:
 *                         type: boolean
 *                   ethnicity:
 *                     type: object
 *                     properties:
 *                       ethnicities:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: 68cc41a424ef6e001119ea5c
 *                       isImportant:
 *                         type: boolean
 *                   cultural_background:
 *                     type: object
 *                     properties:
 *                       cultural_backgrounds:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: 6900beaca076e3f344e1a90e
 *                       isImportant:
 *                         type: boolean
 *                   education_level:
 *                     type: object
 *                     properties:
 *                       education_levels:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: 69009775a076e3f344e1a8b9
 *                       isImportant:
 *                         type: boolean
 *                   family_plan:
 *                     type: object
 *                     properties:
 *                       family_plans:
 *                         type: array
 *                         items:
 *                           type: string
 *                           description: MongoDB ObjectId reference to FamilyPlan
 *                           example: "68cc41a424ef6e001119ea6e"
 *                       isImportant:
 *                         type: boolean
 *                         default: false
 *                         example: true
 *                   kid:
 *                     type: object
 *                     properties:
 *                       kids:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: 68cc41a4e7c32800116c11c4
 *                       isImportant:
 *                         type: boolean
 *                   pets:
 *                     type: object
 *                     properties:
 *                       pets:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: 68cc41a424ef6e001119ead8
 *                       isImportant:
 *                         type: boolean
 *                   zodiac:
 *                     type: object
 *                     properties:
 *                       zodiacs:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: 68cc41a424ef6e001119ead8
 *                       isImportant:
 *                         type: boolean
 *                   languages:
 *                     type: object
 *                     properties:
 *                       languages:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: 68cc41a4e7c32800116c11d3
 *                       isImportant:
 *                         type: boolean
 *                   political:
 *                     type: object
 *                     properties:
 *                       politics:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: 68cc41a424ef6e001119eabd
 *                       isImportant:
 *                         type: boolean
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid request body
 */

router.patch('/', auth(), validate(preferenceValidation.updatePrefernce), preferenceController.updatePreferences);


/**
 * @swagger
 * /preference:
 *   get: 
 *     summary: Get the user preferences
 *     tags: [Preferences]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Preferences retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/UserPreference'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 * 
 */

router.get('/', auth(), preferenceController.getPreferences);

module.exports = router;
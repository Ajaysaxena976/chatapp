const express = require('express');
const validate = require('../../middlewares/validation-handler');
const authValidation = require('../../validations/auth.validation');
const authController = require('../../controllers/auth.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.post('/register', validate(authValidation.register), authController.register);
router.post('/register-mobile-verify', validate(authValidation.registerPhoneVerify), authController.registerPhoneVerify);
router.post('/after-register-detail', auth(), validate(authValidation.afterRegisterDetail), authController.afterRegisterDetail);
router.post('/mobile-login', validate(authValidation.mobileLogin), authController.mobileLogin);
router.post('/login-mobile-verify', validate(authValidation.loginMobileVerify), authController.loginMobileVerify);
router.post('/social-login', validate(authValidation.socialLogin), authController.socialLogin);
router.post('/logout', auth(), validate(authValidation.logout), authController.logout);
router.post('/refresh-tokens', auth(), validate(authValidation.refreshTokens), authController.refreshTokens);
router.post('/apple-login/callback', authController.appleLoginCallback);
router.delete('/delete-account', auth(), authController.deleteAccount);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register the user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dates_days
 *               - name
 *               - date_of_birth
 *               - gender
 *               - interestedIn
 *               - lookingFor
 *               - phone
 *               - phone_code
 *               - otp
 *               - is_social_login
 *               - social_detail (if is_social_login is true)
 *             additionalProperties: false
 *             properties:
 *               dates_days:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of date day IDs
 *               name:
 *                 type: string
 *                 description: User's name
 *               date_of_birth:
 *                 type: string
 *                 pattern: '^\\d{2}-\\d{2}-\\d{4}$'
 *                 description: Date of birth in DD-MM-YYYY format
 *               gender:
 *                 type: string
 *                 description: Gender ID
 *               interestedIn:
 *                 type: string
 *                 description: Interested in ID
 *               lookingFor:
 *                 type: array
 *                 description: Looking for ID
 *               phone:
 *                 type: string
 *                 pattern: '^\\d{6,15}$'
 *                 description: Phone number (6-15 digits)
 *               phone_code:
 *                 type: string
 *                 pattern: '^\\+\\d{1,4}$'
 *                 description: Phone country code with + prefix
 *               is_social_login:
 *                 type: boolean
 *                 description: Indicates if registering via social login
 *               social_detail:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [google, apple]
 *                     description: Social login type
 *                   token:
 *                     type: string
 *                     description: Social login token
 *                 description: Required if is_social_login is true
 *             example:
 *               dates_days: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *               name: "John Doe"
 *               date_of_birth: "15-08-1990"
 *               gender: "507f1f77bcf86cd799439013"
 *               interestedIn: "507f1f77bcf86cd799439014"
 *               lookingFor: ["507f1f77bcf86cd799439015","507f1f77bcf86cd799439015"]
 *               phone: "1234567890"
 *               phone_code: "+1"
 *               is_social_login: false
 *               social_detail: { type: "google", token: "<SOCIAL_TOKEN>" }
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 tokens:
 *                   $ref: '#/components/schemas/AuthTokens'
 *       "400":
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               code: 400
 *               message: Validation error
 */

/**
 * @swagger
 * /auth/register-mobile-verify:
 *   post:
 *     summary: Verify mobile registration
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - otp
 *             properties:
 *               token:
 *                 type: string
 *                 description: Registration token from previous step
 *               otp:
 *                 type: string
 *                 pattern: '^\\d{6}$'
 *                 description: 6-digit OTP code
 *             example:
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               otp: "123456"
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 tokens:
 *                   $ref: '#/components/schemas/AuthTokens'
 *       "400":
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               code: 400
 *               message: Invalid OTP or token
 */

/**
 * @swagger
 * /auth/after-register-detail:
 *   post:
 *     summary: Submit additional details after registration
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - about_yourself
 *               - idea_of_great_date
 *               - main_photo_url
 *               - additional_photos
 *               - favorites_dates
 *               - location
 *             additionalProperties: false
 *             properties:
 *               about_yourself:
 *                 type: string
 *                 description: User's self-description
 *               idea_of_great_date:
 *                 type: string
 *                 description: User's idea of a great date
 *               main_photo_url:
 *                 type: string
 *                 description: Main profile photo string
 *               additional_photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of additional photo URLs
 *               favorites_dates:
 *                 type: object
 *                 required:
 *                   - food_and_drink
 *                   - active_and_outdoor
 *                   - fun
 *                   - chill_and_cozy
 *                 properties:
 *                   food_and_drink:
 *                     type: string
 *                     pattern: '^[0-9a-fA-F]{24}$'
 *                     description: Food and drink preference ObjectId
 *                   active_and_outdoor:
 *                     type: string
 *                     pattern: '^[0-9a-fA-F]{24}$'
 *                     description: Active and outdoor preference ObjectId
 *                   fun:
 *                     type: string
 *                     pattern: '^[0-9a-fA-F]{24}$'
 *                     description: Fun activity preference ObjectId
 *                   chill_and_cozy:
 *                     type: string
 *                     pattern: '^[0-9a-fA-F]{24}$'
 *                     description: Chill and cozy preference ObjectId
 *                 description: User's favorite date types
 *               location:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *                     description: City name
 *                   lat:
 *                     type: number
 *                     description: Latitude
 *                   lng:
 *                     type: number
 *                     description: Longitude
 *                 required:
 *                   - address
 *                   - lat
 *                   - lng
 *             example:
 *               about_yourself: "I love traveling and trying new cuisines. Always up for an adventure!"
 *               idea_of_great_date: "A cozy dinner followed by a walk under the stars"
 *               main_photo_url: "<PHOTO_URL>"
 *               additional_photos: ["<PHOTO_URL_1>", "<PHOTO_URL_2>"]
 *               favorites_dates:
 *                 food_and_drink: "<OBJECT_ID>"
 *                 active_and_outdoor: "<OBJECT_ID>"
 *                 fun: "<OBJECT_ID>"
 *                 chill_and_cozy: "<OBJECT_ID>"
 *               location: {
 *                 address: "<CITY_NAME>",
 *                 lat: "<LATITUDE>",
 *                 lng: "<LONGITUDE>"
 *               }
 *     responses:
 *       "200":
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 updated_detail:
 *                   type: object
 *                   description: Updated user profile details
 *       "400":
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       "401":
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /auth/mobile-login:
 *   post:
 *     summary: Mobile login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - phone_code
 *             properties:
 *               phone:
 *                 type: string
 *                 pattern: '^\\d{6,15}$'
 *                 description: Phone number (6-15 digits)
 *               phone_code:
 *                 type: string
 *                 pattern: '^\\+\\d{1,4}$'
 *                 description: Phone country code with + prefix
 *             example:
 *               phone: "1234567890"
 *               phone_code: "+1"
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *       "400":
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               code: 400
 *               message: Invalid phone number
 */

/**
 * @swagger
 * /auth/login-mobile-verify:
 *   post:
 *     summary: Verify mobile login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - otp
 *             properties:
 *               token:
 *                 type: string
 *                 description: Login token from previous step
 *               otp:
 *                 type: string
 *                 pattern: '^\\d{6}$'
 *                 description: 6-digit OTP code
 *             example:
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               otp: "123456"
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 tokens:
 *                   $ref: '#/components/schemas/AuthTokens'
 *       "400":
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               code: 400
 *               message: Invalid OTP or token
 */

/**
 * @swagger
 * /auth/social-login:
 *   post:
 *     summary: Social login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - token
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [google, apple]
 *                 description: Social login type
 *               token:
 *                 type: string
 *                 description: Social login token
 *             example:
 *               type: "google"
 *               token: "<SOCIAL_TOKEN>"
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 tokens:
 *                   $ref: '#/components/schemas/AuthTokens'
 *       "400":
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               code: 400
 *               message: Invalid social login type
 *       "401":
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               code: 401
 *               message: Social login failed   
 */


/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *             example:
 *               refreshToken: "<REFRESH_TOKEN>"
 *     responses:
 *       "204":
 *         description: No content
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /auth/refresh-tokens:
 *   post:
 *     summary: Refresh auth tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *             example:
 *               refreshToken: "<REFRESH_TOKEN>"
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokens'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */



/**
 * @swagger
 * /auth/delete-account:
 *   delete:
 *     summary: Delete account
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */
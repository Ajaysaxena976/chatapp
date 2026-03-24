const express = require('express');
const auth = require('../../middlewares/auth');
const userController = require('../../controllers/user.controller');
const validate = require('../../middlewares/validate');
const { userValidation } = require('../../validations');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', auth(), userController.getProfile);

/**
 * @swagger
 * /user/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [User]
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
 *               dates_days:
 *                 type: array
 *                 items:
 *                   type: string
 *                   pattern: '^[0-9a-fA-F]{24}$'
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 pattern: '^[0-9a-fA-F]{24}$'
 *               gender_visibility:
 *                 type: boolean
 *               interested_in:
 *                 type: string
 *                 pattern: '^[0-9a-fA-F]{24}$'
 *               looking_for:
 *                 type: array
 *                 items:
 *                   type: string
 *                   pattern: '^[0-9a-fA-F]{24}$'
 *               looking_for_visibility:
 *                 type: boolean
 *               work:
 *                 type: array
 *                 items:
 *                   type: string
 *                   pattern: '^[0-9a-fA-F]{24}$'
 *               work_visibility:
 *                 type: boolean
 *               about_yourself:
 *                 type: string
 *               idea_of_great_date:
 *                 type: string
 *               favorite_dates:
 *                 type: array
 *                 items:
 *                   type: string
 *                   pattern: '^[0-9a-fA-F]{24}$'
 *               location:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [Point]
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *                   address:
 *                     type: string
 *               hometown:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [Point]
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *                   address:
 *                     type: string
 *               hometown_visibility:
 *                 type: boolean
 *               main_img:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               social_links:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     platform:
 *                       type: string
 *                     url:
 *                       type: string
 *                     username:
 *                       type: string
 *                     isConnected:
 *                       type: boolean
 *               education:
 *                 type: object
 *                 properties:
 *                   Institute_name:
 *                     type: string
 *                   major_degree:
 *                     type: string
 *                   graduation_year:
 *                     type: number
 *               education_visibility:
 *                 type: boolean
 *               education_level:
 *                 type: string
 *               education_level_visibility:
 *                 type: boolean
 *               cultural_background:
 *                 type: string
 *               cultural_background_visibility:
 *                 type: boolean
 *               location_visibility:
 *                 type: boolean
 *               occupation:
 *                 type: object
 *                 properties:
 *                   company_name:
 *                     type: string
 *                   job_title:
 *                     type: string
 *               occupation_visibility:
 *                 type: boolean
 *               height:
 *                 type: string
 *               height_unit:
 *                 type: string
 *                 enum: [cm, ft]
 *               height_visibility:
 *                 type: boolean
 *               exercise:
 *                 type: string
 *               exercise_visibility:
 *                 type: boolean
 *               diet:
 *                 type: string
 *               diet_visibility:
 *                 type: boolean
 *               drink:
 *                 type: string
 *               drink_visibility:
 *                 type: boolean
 *               smoking:
 *                 type: string
 *               smoking_visibility:
 *                 type: boolean
 *               religion:
 *                 type: string
 *               religion_visibility:
 *                 type: boolean
 *               ethnicity:
 *                 type: string
 *               ethnicity_visibility:
 *                 type: boolean
 *               kids:
 *                 type: string
 *               kids_visibility:
 *                 type: boolean
 *               pets:
 *                 type: string
 *               pets_visibility:
 *                 type: boolean
 *               zodiac:
 *                 type: string
 *               zodiac_visibility:
 *                 type: boolean
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *               languages_visibility:
 *                 type: boolean
 *               politics:
 *                 type: string
 *               politics_visibility:
 *                 type: boolean
 *             example:
 *               name: "John Doe"
 *               dates_days: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *               date_of_birth: "1990-08-15"
 *               gender: "507f1f77bcf86cd799439013"
 *               gender_visibility: true
 *               interested_in: "507f1f77bcf86cd799439014"
 *               looking_for: ["507f1f77bcf86cd799439035", "507f1f77bcf86cd799439034"]
 *               looking_for_visibility: true
 *               work: "507f1f77bcf86cd799439036"
 *               work_visibility: true
 *               about_yourself: "I love traveling."
 *               idea_of_great_date: "Dinner + walk"
 *               favorite_dates: ["507f1f77bcf86cd7994390375", "507f1f77bcf86cd799439054"]
 *               location:
 *                 type: "Point"
 *                 coordinates: [-73.935242, 40.73061]
 *                 address: "New York"
 *               main_img: "https://example.com/main-photo.jpg"
 *               images: ["https://example.com/img1.jpg"]
 *               social_links:
 *                 - platform: "Twitter"
 *                   url: "https://twitter.com/afjal"
 *                   username: "afjal"
 *                   isConnected: false
 *               education:
 *                 Institute_name: "University of Example"
 *                 major_degree: "Computer Science"
 *                 graduation_year: 2015
 *               education_visibility: true
 *               occupation:
 *                 company_name: "Tech Corp"
 *                 job_title: "Software Engineer"
 *               occupation_visibility: true
 *               height: "175"
 *               height_unit: "cm"
 *               height_visibility: true
 *               kids_visibility: true
 *               zodiac_visibility: true
 *               pets_visibility: true
 *               languages: ["507f1f77bcf86cd799439033"]
 *               languages_visibility: true
 *               politics: "507f1f77bcf86cd799439035"
 *               politics_visibility: false
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put('/profile', auth(), validate(userValidation.updateProfile), userController.updateProfile);

/**
 * @swagger
 * /user/image:
 *   post:
 *     summary: Upload an image
 *     tags: [User]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The image file to upload
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   example: "https://example-bucket.s3.cloudflare.com/file.png"
 *       400:
 *         description: No file uploaded
 *       500:
 *         description: Upload failed
 */
router.post('/image', upload.single('file'), userController.uploadmedia);

/**
 * @swagger
 * /user/profile/image:
 *   patch:
 *     summary: Update user profile image by URL
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *                 description: The image URL to be saved as the user profile image
 *                 example: "https://example-bucket.s3.cloudflare.com/profile.jpg"
 *     responses:
 *       200:
 *         description: Profile image updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profile image updated successfully"
 *                 url:
 *                   type: string
 *                   example: "https://example-bucket.s3.cloudflare.com/profile.jpg"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.patch('/profile/image', auth(), validate(userValidation.updateProfileImageUrl), userController.updateProfileImageUrl);
   
/**
 * @swagger
 * /user/user_days:
 *   post:
 *     summary: Create user date days
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dates_days
 *             properties:
 *               dates_days:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: string
 *                   example: "64f1c2a9b8e4f123456789ab"
 *                 description: Array of DateDay IDs
 *     responses:
 *       201:
 *         description: User date days created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User date days created successfully
 *                 data:
 *                   type: object
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
  '/user_days',
  auth(),
  validate(userValidation.createUserDateDays),
  userController.createUserDateDays
);

   
/**
 * @swagger
 * /user/user_days:
 *   get:
 *     summary: Get user date days
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User date days fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User date days fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 64f1c2a9b8e4f123456789ab
 *                     user_id:
 *                       type: string
 *                       example: 64f1c2a9b8e4f123456789ac
 *                     dates_days:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 64f1c2a9b8e4f123456789ad
 *                           name:
 *                             type: string
 *                             example: Weekend
 *                           isActive:
 *                             type: boolean
 *                             example: true
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User date days not found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/user_days',
  auth(),
  userController.getUserDateDays
);







router.get('/test', userController.gettest);

module.exports = router;
const express = require('express');
const validate = require('../../middlewares/validation-handler');
const auth = require('../../middlewares/auth');
const {
  getSuggestions,
  getSuggestionsByCategory,
  getSuggestionStats,
  getSuggestionsByPreferences,
  getUserCounts
} = require('../../controllers/suggestion.controller');
const {
 suggestionValidation
} = require('../../validations');



const router = express.Router();

router
  .route('/preferences')
  .get(auth(), validate(suggestionValidation.getSuggestionsByPreferences), getSuggestionsByPreferences);

// new route: get user's swipe and meet counts
router.route('/counts').get(auth(), getUserCounts);


module.exports = router;
/**
 * @swagger
 * tags:
 *   name: Suggestions
 *   description: AI-powered user suggestions and matching
 */

/**
 * @swagger
 * /suggestion/preferences:
 *   get:
 *     summary: Get preference-based suggestions
 *     description: Get personalized suggestions based on user preferences and filters
 *     tags: [Suggestions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of suggestions to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: dateDay
 *         schema:
 *           type: string
 *           default: ""
 *         description: pass days ID
 *     responses:
 *       200:
 *         description: Preference-based suggestions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     suggestions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Suggestion'
 *                     hasMore:
 *                       type: boolean
 *                       example: true
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 25
 *                     preferenceMatch:
 *                       type: boolean
 *                       example: true
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */


/**
 * @swagger
 * /suggestion/counts:
 *   get:
 *     summary: Get authenticated user's swipe and meet counts
 *     description: Returns current swipe_count and meet_count for the authenticated user (useful for rate limiting / UI)
 *     tags: [Suggestions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dateDay
 *         schema:
 *           type: string
 *           default: ""
 *         description: pass days ID
 *     responses:
 *       200:
 *         description: User counts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       description: Authenticated user id
 *                     swipe_count:
 *                       type: integer
 *                       example: 123
 *                     meet_count:
 *                       type: integer
 *                       example: 5
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */




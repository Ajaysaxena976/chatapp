const express = require('express');
const validate = require('../../middlewares/validation-handler');
const auth = require('../../middlewares/auth');
const csrfProtection = require('../../middlewares/csrf');
const InteractionController = require('../../controllers/interaction.controller');
const InteractionValidation = require('../../validations/interaction.validation');

const router = express.Router();

router.post('/', auth(), validate(InteractionValidation.recordInteraction), InteractionController.recordInteraction);
router.get('/history', auth(), validate(InteractionValidation.getUserInteractionHistory), InteractionController.getUserInteractionHistory);
router.get('/received',
        auth(),
        validate(InteractionValidation.getReceivedInteractions),
        InteractionController.getReceivedInteractions
        );
        
module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Interactions
 *   description: AI-powered user interactions and matching
 */

/**
 * @swagger
 * /interaction:
 *   post:
 *     summary: Record a new interaction
 *     tags: [Interactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetUserId
 *               - action
 *               - timeSpentViewing
 *               - swipeVelocity
 *             properties:
 *               targetUserId:
 *                 type: string
 *                 description: ID of the target being interacted with
 *               action:
 *                 type: string
 *                 descr6iption: action of interaction like pass, like, superlike
 *               timeSpentViewing:
 *                 type: number
 *                 description: time im milliseconds how much user spend time on profile to see.
 *               swipeVelocity:
 *                 type: number
 *                 description: how much swipe in 5 seconds
 *               dateDay:
 *                 type: string
 *                 description: date day id for which day interaction is done
 *     responses:
 *       200:
 *         description: Interaction recorded successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid request body
 */

/**
 * @swagger
 * /interaction/history:
 *   get:
 *     summary: Get user's interaction history
 *     tags: [Interactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of user interactions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                       targetId:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalResults:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid query parameters
 */

/**
 * @swagger
 * /interaction/received:
 *   get:
 *     summary: Get interactions received by the authenticated user
 *     tags: [Interactions]
 *     description: Retrieve interactions where the authenticated user was the target (e.g., likes, passes, superlikes received)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort order, e.g., "createdAt:desc"
 *     responses:
 *       200:
 *         description: List of interactions received by the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                       sourceUserId:
 *                         type: string
 *                       action:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalResults:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid query parameters
 */
const express = require('express');
const validate = require('../../middlewares/validation-handler');
const auth = require('../../middlewares/auth');
const csrfProtection = require('../../middlewares/csrf');
const MatchController = require('../../controllers/match.controller');
const MatchValidation = require('../../validations/match.validation');

const router = express.Router();

router.get(
  '/matches',
  auth(),
  validate(MatchValidation.getMatches),
  MatchController.getMatches
);

router.delete(
  '/:matchId',
  auth(),
  validate(MatchValidation.deleteMatch),
  MatchController.deleteMatch
);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Matches
 *   description: User matching and unmatching system
 */

/**
 * @swagger
 * /match:
 *   get:
 *     summary: Get matched users for authenticated user
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of results per page
 *     responses:
 *       200:
 *         description: Matches fetched successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid query parameters
 */

/**
 * @swagger
 * /match/{matchId}:
 *   delete:
 *     summary: Delete a match (unmatch user)
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID to delete
 *     responses:
 *       200:
 *         description: Match deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Match not found
 *       400:
 *         description: Invalid match ID
 */

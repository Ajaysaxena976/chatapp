const matchService = require('../services/match.service');
const logger = require('../config/logger');
const { sanitizeForLog } = logger;
const mongoose = require('mongoose');

// ------------------------------
// GET MATCHES
// ------------------------------
const getMatches = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const data = await matchService.getUserMatches(userId, {
      page: Number(page),
      limit: Number(limit)
    });

    return res.json({ success: true, data });
  } catch (error) {
    logger.error('Error fetching matches', { error: sanitizeForLog(error.message) });
    return res.status(500).json({ success: false, error: 'Failed to fetch matches' });
  }
};

// ------------------------------
// UNMATCH
// ------------------------------
const deleteMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.user._id;

    const match = await matchService.unmatch(matchId, userId);

    return res.json({ success: true, message: 'Unmatched successfully', data: match });
  } catch (error) {
    logger.error('Error unmatching', { error: sanitizeForLog(error.message) });
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getMatches,
  deleteMatch
};

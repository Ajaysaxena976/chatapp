const { suggestionService } = require('../services');
const mongoose = require('mongoose');
const logger = require('../config/logger');
const { UserLimit } = require('../models')

// ============================================================================
// MAIN SUGGESTIONS
// ============================================================================

const getSuggestions = async (req, res) => {
  try {
    const userId = req.user?._id;
    let { limit = 10, refresh = false, dateDay, page = 1 } = req.query;

    logger.logControllerStart('SuggestionController', 'getSuggestions', { userId, limit, page, refresh, dateDay });


    // Handle dateDay as array if passed as comma-separated string
    if (dateDay && typeof dateDay === 'string' && dateDay.includes(',')) {
      dateDay = dateDay.split(',').map(id => id.trim());
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      logger.error('Invalid user ID provided', { userId });
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    const data = await suggestionService.generateSuggestions(userId, { limit, page, refresh, dateDay });

    logger.logControllerEnd('SuggestionController', 'getSuggestions', data);
    res.json({
      success: true,
      data
    });
  } catch (error) {
    logger.error('Error getting suggestions', {
      error: error.message,
      userId: userId
    });

    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(500).json({

      error: 'Failed to get suggestions'
    });
  }
}

// ============================================================================
// CATEGORIZED SUGGESTIONS
// ============================================================================

const getSuggestionsByCategory = async (req, res) => {
  try {
    const userId = req.user._id;

    logger.logControllerStart('SuggestionController', 'getSuggestionsByCategory', { userId });

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      logger.error('Invalid user ID provided', { userId });
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    const data = await suggestionService.generateCategorizedSuggestions(userId);

    logger.logControllerEnd('SuggestionController', 'getSuggestionsByCategory', {
      categoriesCount: Object.keys(data || {}).length,
      totalSuggestions: Object.values(data || {}).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0)
    });
    res.json({
      success: true,
      data
    });

  } catch (error) {
    logger.error('Error getting categorized suggestions', { error: error.message, userId });

    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to get categorized suggestions'
    });
  }
}


// ============================================================================
// PREFERENCE-BASED SUGGESTIONS
// ============================================================================

const getSuggestionsByPreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 10, page = 1, dateDay, refresh = false } = req.query;
    logger.logControllerStart('SuggestionController', 'getSuggestionsByPreferences', { userId, limit, page, dateDay, refresh });

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    const data = await suggestionService.getSuggestionsByPreferences(userId, {
      limit: parseInt(limit),
      page: parseInt(page),
      dateDay: dateDay || null,
      refresh: refresh === 'true' || refresh === true
    });
    logger.logControllerEnd('SuggestionController', 'getSuggestionsByPreferences', {
      suggestionsCount: data.suggestions?.length || 0,
      preferenceMatch: data.preferenceMatch
    });

    res.json({
      success: true,
      data
    });

  } catch (error) {
    logger.error('Error getting preference-based suggestions', { error: error.message });

    res.status(500).json({
      success: false,
      error: 'Failed to get preference-based suggestions'
    });
  }
};

// ============================================================================
// SUGGESTION STATS
// ============================================================================

const getSuggestionStats = async (req, res) => {
  try {
    const userId = req.user._id;

    logger.logControllerStart('SuggestionController', 'getSuggestionStats', { userId });

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      logger.error('Invalid user ID provided', { userId });
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    const data = await suggestionService.generateSuggestionStats(userId);

    logger.logControllerEnd('SuggestionController', 'getSuggestionStats', data);
    res.json({
      success: true,
      data
    });

  } catch (error) {
    logger.error('Error getting suggestion stats', { error: error.message, userId });

    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to get suggestion stats'
    });
  }
}

const getUserCounts = async (req, res) => {
  try {
    const userId = req.user._id;
    const { dateDay } = req.query;

    if (!dateDay) {
      return res.status(400).json({
        success: false,
        message: "dateDay query param is required"
      });
    }

    const result = await suggestionService.getUserSwipeMeetCounts(userId, dateDay);

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  getSuggestions,
  getSuggestionsByCategory,
  getSuggestionStats,
  getSuggestionsByPreferences,
  getUserCounts
};
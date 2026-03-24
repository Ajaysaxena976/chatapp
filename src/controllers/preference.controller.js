const { preferenceService } = require('../services');
const mongoose = require('mongoose');
const logger = require('../config/logger');
const { sanitizeForLog } = logger;

const updatePreferences = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { general_filter, advance_filter } = req.body;
    
    logger.logControllerStart('PreferenceController', 'updatePreferences', { 
      userId: sanitizeForLog(String(userId).replace(/[^a-f0-9]/gi, '')),
      hasGeneralFilter: !!general_filter,
      hasAdvanceFilter: !!advance_filter
    });

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      logger.error('Invalid user ID provided', { userId: sanitizeForLog(String(userId))});
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid user ID'
      });
    }

    const updatedPreferences = await preferenceService.updateUserPreferences(userId, { general_filter, advance_filter });
    
    logger.logControllerEnd('PreferenceController', 'updatePreferences', { 
      success: true,
      preferencesUpdated: !!updatedPreferences
    });
    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: updatedPreferences
    });
  } catch (error) {
    logger.error('Error updating preferences', { 
      error: sanitizeForLog(error.message || error), 
      userId: sanitizeForLog(String(req.user?._id || ''))
    });
    
    if (error.message === 'User not found') {
      return res.status(400).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    res.status(500).json({ 
      success: false, 
      error: sanitizeForLog(error.message || error)  || 'Failed to update preferences' 
    });
  }
}


const getPreferences = async (req, res) => {
  try {
    const userId = req.user?._id;

    logger.logControllerStart('PreferenceController', 'getPreferences', {
      userId: sanitizeForLog(String(userId).replace(/[^a-f0-9]/gi, ''))
    });

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      logger.error('Invalid user ID provided', { userId: sanitizeForLog(String(userId))});
      return res.status(400).json({
        success: false,
        error: 'Invalid user\'s ID'
      });
    }

    const preferences = await preferenceService.getUserPreferences(userId);
    logger.logControllerEnd('PreferenceController', 'getPreferences', {
      success: true,
      preferencesFound: !!preferences
    });
    res.json({
      success: true,
      message: 'Preferences retrieved successfully',
      data: preferences
    });
  } catch (error) {
    logger.error('Error retrieving preferences', {
      error: sanitizeForLog(error.message || error),
      userId: sanitizeForLog(String(req.user?._id || ''))
    });

    if (error.message === 'User not found') {
      return res.status(400).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(500).json({
      success: false,
      error: sanitizeForLog(error.message || error)  || 'Failed to retrieve preferences'
    });
  }
}


module.exports = {
    updatePreferences,
    getPreferences
}


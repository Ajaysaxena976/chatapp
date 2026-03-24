const interactionService = require('../services/interaction.service');
const mongoose = require('mongoose');
const logger = require('../config/logger');
const { sanitizeForLog } = logger;
const User = require('../models/user.model');


// ============================================================================
// INTERACTION RECORDING
// ============================================================================


const recordInteraction = async (req, res) => {
  try {
    const { targetUserId, action, timeSpentViewing, swipeVelocity, dateDay } = req.body;
    const userId = req.user._id;

    req.body.userId = userId;

    logger.logControllerStart(
      'InteractionController',
      'recordInteraction',
      { userId, targetUserId, action, timeSpentViewing, swipeVelocity, dateDay }
    );

    /* -------------------------
       Required field validation
    -------------------------- */
    if (!userId || !targetUserId || !action) {
      logger.error('Missing required fields for interaction', {
        userId: sanitizeForLog(userId),
        targetUserId: sanitizeForLog(targetUserId),
        action: sanitizeForLog(action)
      });

      return res.status(400).json({
        success: false,
        error: 'Missing required fields: targetUserId, action'
      });
    }

    /* -------------------------
       ObjectId validation
    -------------------------- */
    const validtarget = await User.findById(targetUserId);
    console.log(validtarget)
    if (!validtarget) {
      return res.status(400).json({
        success: false,
        error: 'Invalid targetUserId'
      });
    }

    /* -------------------------
       Prevent self interaction
    -------------------------- */
    if (targetUserId.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        error: 'You cannot interact with yourself'
      });
    }

    /* -------------------------
       Process interaction
    -------------------------- */
    const data = await interactionService.processInteraction(req.body);

    logger.logControllerEnd(
      'InteractionController',
      'recordInteraction',
      { interactionId: data?._id }
    );

    return res.json({
      success: true,
      data
    });

  } catch (error) {
    logger.error('Error recording interaction', {
      error: sanitizeForLog(error.message),
      userId: sanitizeForLog(req.body?.userId),
      targetUserId: sanitizeForLog(req.body?.targetUserId)
    });

    // Duplicate interaction
    if (error.message === 'Already interacted with this user') {
      return res.status(409).json({
        success: false,
        error: 'Already interacted with this user'
      });
    }

    // Custom API errors
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to record interaction'
    });
  }
};



    

    



// ============================================================================
// ANALYTICS
// ============================================================================

const getInteractionAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;
    
    logger.logControllerStart('InteractionController', 'getInteractionAnalytics', { userId });

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      logger.error('Invalid user ID provided', { userId: sanitizeForLog(userId) });
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    const data = await interactionService.generateInteractionAnalytics(userId);
    
    logger.logControllerEnd('InteractionController', 'getInteractionAnalytics', data);
    res.json({ 
      success: true, 
      data
    });

  } catch (error) {
    logger.error('Error getting analytics', { error: sanitizeForLog(error.message), userId: sanitizeForLog(userId) });
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get analytics' 
    });
  }
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================


const recordBatchInteractions = async (req, res) => {
  try {
    const { interactions } = req.body;
    
    logger.logControllerStart('InteractionController', 'recordBatchInteractions', { count: interactions?.length });

    if (!Array.isArray(interactions) || interactions.length === 0) {
      logger.error('Invalid interactions array provided', { interactions: sanitizeForLog(JSON.stringify(interactions)) });
      return res.status(400).json({
        success: false,
        error: 'Invalid interactions array'
      });
    }

    const data = await interactionService.processBatchInteractions(interactions);
    
    logger.logControllerEnd('InteractionController', 'recordBatchInteractions', data);
    res.json({
      success: true,
      data
    });

  } catch (error) {
    logger.error('Error recording batch interactions', { error: sanitizeForLog(error.message), count: req.body.interactions?.length });
    res.status(500).json({ 
      success: false, 
      error: 'Failed to record batch interactions' 
    });
  }
}

// ============================================================================
// USER INTERACTION HISTORY
// ============================================================================

const getUserInteractionHistory = async (req, res) => {
  try {
    const  userId  = req.user._id;
    const { limit, page } = req.query;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
      })}

    const data = await interactionService.getInteractionHistory(userId, { limit, page });
    logger.logControllerEnd('InteractionController', 'getUserInteractionHistory', data);
    res.json({
      success: true,
      data
    });

  } catch (error) {
    logger.error('Error getting interaction history', { error: sanitizeForLog(error.message), userId: sanitizeForLog(userId) });
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get interaction history' 
    });
  }
}

const getReceivedInteractions = async (req, res) => {
  try {
    const targetUserId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    logger.logControllerStart(
      'InteractionController',
      'getReceivedInteractions',
      { targetUserId, page, limit }
    );

    const data = await interactionService.getReceivedInteractions(
      targetUserId,
      {
        page: Number(page),
        limit: Number(limit)
      }
    );

    logger.logControllerEnd(
      'InteractionController',
      'getReceivedInteractions',
      { count: data?.results?.length || 0 }
    );

    return res.json(data);

  } catch (error) {
    console.error('🔥 ERROR getReceivedInteractions:', error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


 

module.exports = {
  recordInteraction,
  getInteractionAnalytics,
  recordBatchInteractions,
  getUserInteractionHistory,
  getReceivedInteractions
};
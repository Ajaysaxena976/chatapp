const { User, Interaction, UserProfile, SwipeConfig } = require('../models');
const datingEngine = require('./dating-engine.service');
const CheckUserLimit = require('./userLimit.service');
const mongoose = require('mongoose');
const logger = require('../config/logger');
const { sanitizeForLog } = logger;
const moment = require("moment");
const ApiError = require('../utils/api-error');
const httpStatus = require('http-status');
const matchService = require('./match.service');


// ============================================================================
// DATA ACCESS LAYER
// ============================================================================

const findExistingInteraction = async (userId, targetUserId) => {
  try {
    return await Interaction.findOne({ userId, targetUserId });
  } catch (error) {
    console.error('Error finding existing interaction:', error);
    return null;
  }
};

const createInteraction = async (interactionData) => {
  try {
    return await new Interaction(interactionData).save();
  } catch (error) {
    console.error('Error creating interaction:', error);
    throw error;
  }
};

const findReciprocalInteraction = async (userId, targetUserId) => {
  try {
    // Sanitize and validate input to prevent injection
    const sanitizedUserId = String(userId).replace(/[^a-f0-9]/gi, '');
    const sanitizedTargetUserId = String(targetUserId).replace(/[^a-f0-9]/gi, '');

    // Validate ObjectIds to prevent injection
    if (!mongoose.Types.ObjectId.isValid(sanitizedUserId) || !mongoose.Types.ObjectId.isValid(sanitizedTargetUserId)) {
      throw new Error('Invalid user IDs provided');
    }

    return await Interaction.findOne({
      userId: new mongoose.Types.ObjectId(sanitizedTargetUserId),
      targetUserId: new mongoose.Types.ObjectId(sanitizedUserId),
      action: { $in: ['like', 'superlike'] }
    });
  } catch (error) {
    console.error('Error finding reciprocal interaction:', error);
    return null;
  }
};

const getUserById = async (userId) => {
  try {
    return await User.findById(userId);
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
};

const getInteractionAnalyticsData = async (userId) => {
  try {
    // Sanitize and validate input to prevent injection
    const sanitizedUserId = String(userId).replace(/[^a-f0-9]/gi, '');

    if (!mongoose.Types.ObjectId.isValid(sanitizedUserId)) {
      throw new Error('Invalid user ID provided');
    }

    return await Interaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(sanitizedUserId) } },
      {
        $group: {

          _id: '$action',
          count: { $sum: 1 },
          avgTimeViewing: { $avg: '$timeSpentViewing' },
          avgPhotosSeen: { $avg: { $size: { $ifNull: ['$photosSeen', []] } } },
          avgSwipeVelocity: { $avg: '$swipeVelocity' }
        }

      },
      { $sort: { count: -1 } }
    ]);
  } catch (error) {
    console.error('Error getting analytics data:', error);
    return [];
  }
};

const getUserInteractions = async (query, options) => {
  try {
    const { limit, skip } = options;

    const safeQuery = {};
    if (
      query.targetUserId &&
      mongoose.Types.ObjectId.isValid(query.targetUserId)
    ) {
      safeQuery.targetUserId = new mongoose.Types.ObjectId(query.targetUserId);
    }

    console.log("SAFE QUERY 👉", safeQuery);

    const [interactions, total] = await Promise.all([
      Interaction.aggregate([
        { $match: safeQuery },

        { $sort: { createdAt: -1 } },

        { $skip: skip },
        { $limit: limit },

        {
          $lookup: {
            from: 'users',
            localField: 'userId',   // SOURCE USER (who liked me)
            foreignField: '_id',
            as: 'sourceUser'
          }
        },
        { $unwind: '$sourceUser' },

        {
          $lookup: {
            from: 'userprofiles',
            localField: 'sourceUser._id',
            foreignField: 'user_id',
            as: 'userProfile'
          }
        },
        { $unwind: '$userProfile' },

        {
          $project: {
            _id: 1,
            action: 1,
            createdAt: 1,
            sourceUserId: '$userId',
            userProfile: 1
          }
        }
      ]),
      Interaction.countDocuments(safeQuery)
    ]);

    return { interactions, total };
  } catch (error) {
    console.error('Error getting user interactions:', error);
    return { interactions: [], total: 0 };
  }
};





// ============================================================================
// BUSINESS LOGIC LAYER
// ============================================================================

const processInteraction = async (interactionData) => {
  const { userId, targetUserId, action, timeSpentViewing, swipeVelocity, dateDay } = interactionData;

  // First fetch for subscription check
  const currentUser = await getUserById(userId);

  logger.logServiceStart('InteractionService', 'processInteraction', {
    userId: sanitizeForLog(String(userId).replace(/[^a-f0-9]/gi, '')),
    targetUserId: sanitizeForLog(String(targetUserId).replace(/[^a-f0-9]/gi, '')),
    action: sanitizeForLog(action),
    timeSpentViewing: parseInt(timeSpentViewing) || 0,
    swipeVelocity: parseInt(swipeVelocity) || 0
  });

  // Prevent duplicate interaction
  const existingInteraction = await findExistingInteraction(userId, targetUserId);
  if (existingInteraction) throw new Error('Already interacted with this user');

  // Apply swipe/meet limits

  const { allowed, reason, limit } = await CheckUserLimit.checkUserLimits(
    userId,
    action,
    currentUser.is_subscribed
  );
  console.log("User Limit Check:", { allowed, reason });
  if (!allowed) {
    if (reason === "WEEKLY_SWIPE_LIMIT") {
      throw new ApiError(429, 'Weekly swipe limit reached (100). Try again next Monday.');
    }
    if (reason === "DAILY_MEET_LIMIT") {
      throw new ApiError(429, 'Daily like limit reached (3). Try again tomorrow.');
    }
  }


  // Create interaction & fetch other user in parallel
  const [interaction, refreshedCurrentUser, targetUser] = await Promise.all([
    createInteraction({ userId, targetUserId, action, date_days: dateDay }),
    getUserById(userId),
    getUserById(targetUserId)
  ]);

  // Update swipe/meet counts
  if (currentUser.is_subscribed === false) {
    await CheckUserLimit.updateUserLimit(limit, action);
  }

  // Train ML model
  if (refreshedCurrentUser && targetUser) {
    await datingEngine.trainMLModel(refreshedCurrentUser, targetUser, action, {
      timeSpentViewing,
      swipeVelocity,
    });
  }

  // Check for match
  let match = null;

  if (action === 'like' || action === 'superlike') {
    match = await matchService.checkAndCreateMatch(userId, targetUserId);
  }

  const isMatch = Boolean(match);

  // --- AFTERHOURS: Update Pair State (Repetition & Interest Logic) ---
  const { PairState } = require('../models');
  const weekId = moment().format('YYYY-Www');

  // 1. Update Viewer's perspective of Candidate (Repetition control)
  await PairState.findOneAndUpdate(
    { viewer_id: userId, candidate_id: targetUserId },
    {
      $set: {
        last_swipe: (action === 'like' || action === 'superlike') ? 'like' : 'pass',
        consecutive_exposures_no_swipe: 0,
        week_id: weekId
      },
      $inc: {
        exposures_this_week: 1,
        pass_count: (action === 'pass') ? 1 : 0
      }
    },
    { upsert: true }
  );

  // 2. Update Candidate's perspective of Viewer (Interest/Organic Match logic)
  if (action === 'like' || action === 'superlike') {
    await PairState.findOneAndUpdate(
      { viewer_id: targetUserId, candidate_id: userId },
      {
        $set: {
          inbound_like_day: new Date(),
          week_id: weekId
        }
      },
      { upsert: true }
    );
  }
  // ---------------------------------------------------------

  return {
    interactionId: interaction._id,
    action,
    isMatch,
    matchId: match?._id || null,
    message: isMatch ? "It's a match! 🎉" : "Interaction recorded"
  };

};



// const processInteraction = async (interactionData) => {
//   const { userId, targetUserId, action, timeSpentViewing, swipeVelocity } = interactionData;
//   const currentUser = await getUserById(userId)

//   logger.logServiceStart('InteractionService', 'processInteraction', {
//     userId: sanitizeForLog(String(userId).replace(/[^a-f0-9]/gi, '')),
//     targetUserId: sanitizeForLog(String(targetUserId).replace(/[^a-f0-9]/gi, '')),
//     action: sanitizeForLog(action),
//     timeSpentViewing: parseInt(timeSpentViewing) || 0,
//     swipeVelocity: parseInt(swipeVelocity) || 0
//   });

//   // Check for duplicate interaction
//   const existingInteraction = await findExistingInteraction(userId, targetUserId);
//   if (existingInteraction) {
//     logger.warn('Duplicate interaction attempt', { userId: sanitizeForLog(userId), targetUserId: sanitizeForLog(targetUserId), action: sanitizeForLog(action) });
// throw new Error('Already interacted with this user');
//   }

//   const { allowed, reason, limit } = await checkUserLimits(
//     userId,
//     action,
//     currentUser.is_subscribed
//   );
//   if (!allowed) {
//     if (reason === "WEEKLY_SWIPE_LIMIT") {
//       throw new Error("Weekly swipe limit reached (100). Try again next Monday.");
//     }
//     if (reason === "DAILY_MEET_LIMIT") {
//       throw new Error("Daily like limit reached (3). Try again tomorrow.");
//     }
//   }


//   // Create interaction and fetch users in parallel
//   const [interaction, currentUser, targetUser] = await Promise.all([
//     createInteraction({
//       userId,
//       targetUserId,
//       action
//     }),
//     getUserById(userId),
//     getUserById(targetUserId)
//   ]);

//   await updateUserLimit(limit, action);


//   // Train ML model with behavioral data
//   if (currentUser && targetUser) {
//     logger.info('Training ML model with interaction data', { userId: sanitizeForLog(userId), targetUserId: sanitizeForLog(targetUserId), action: sanitizeForLog(action) });
//     await datingEngine.trainMLModel(currentUser, targetUser, action, {
//       timeSpentViewing: interactionData.timeSpentViewing,
//       swipeVelocity: interactionData.swipeVelocity,
//     });
//   }

//   // Check for match
//   const isMatch = await checkForMatch(userId, targetUserId, action);

//   if (isMatch) {
//     logger.info('Match detected!', { userId: sanitizeForLog(userId), targetUserId: sanitizeForLog(targetUserId) });
//   }

//   const result = {
//     interactionId: interaction._id,
//     action,
//     isMatch,
//     message: isMatch ? "It's a match! 🎉" : "Interaction recorded"
//   };

//   logger.logServiceEnd('InteractionService', 'processInteraction', {
//     interactionId: result.interactionId,
//     action: sanitizeForLog(result.action),
//     isMatch: result.isMatch
//   });
//   return result;
// };

const checkForMatch = async (userId, targetUserId, action) => {
  if (action !== 'like' && action !== 'superlike') return false;
  const reciprocalInteraction = await findReciprocalInteraction(userId, targetUserId);
  return !!reciprocalInteraction;
};
// amazonq-ignore-next-line

const generateInteractionAnalytics = async (userId) => {
  logger.logServiceStart('InteractionService', 'generateInteractionAnalytics', {
    userId: sanitizeForLog(String(userId).replace(/[^a-f0-9]/gi, ''))
  });
  const analytics = await getInteractionAnalyticsData(userId);
  const totalInteractions = analytics.reduce((sum, item) => sum + item.count, 0);
  const likeRate = analytics.find(a => a._id === 'like')?.count || 0;
  const passRate = analytics.find(a => a._id === 'pass')?.count || 0;
  const summary = {
    totalInteractions,

    passRate: totalInteractions > 0 ? Math.round((passRate / totalInteractions) * 100) : 0
  };
  const result = { analytics, summary };
  logger.logServiceEnd('InteractionService', 'generateInteractionAnalytics', {
    analyticsCount: result.analytics?.length || 0,
    summary: {
      totalInteractions: result.summary?.totalInteractions || 0,
      passRate: result.summary?.passRate || 0
    }
  });
  return result;
};

const processBatchInteractions = async (interactions) => {
  logger.logServiceStart('InteractionService', 'processBatchInteractions', { count: interactions.length });

  const results = await Promise.allSettled(
    interactions.map(async (interaction) => {
      const existing = await findExistingInteraction(interaction.userId, interaction.targetUserId);

      if (!existing) {
        return createInteraction(interaction);
      }
      return null;
    })
  );

  const successful = results.filter(r => r.status === 'fulfilled' && r.value).length;

  // amazonq-ignore-next-line
  const result = {
    processed: interactions.length,
    successful,
    skipped: interactions.length - successful
  };

  logger.logServiceEnd('InteractionService', 'processBatchInteractions', {
    processed: result.processed || 0,
    successful: result.successful || 0,
    skipped: result.skipped || 0
  });
  return result;
};

const getInteractionHistory = async (userId, options) => {
  const { limit = 50, page = 1 } = options;

  logger.logServiceStart('InteractionService', 'getInteractionHistory', {
    userId: sanitizeForLog(String(userId).replace(/[^a-f0-9]/gi, '')),
    limit: parseInt(limit) || 50,
    page: parseInt(page) || 1
  });

  // Validate and sanitize userId to prevent injection
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID provided');
  }
  const isValiduser = await User.findById(userId);
  if (!isValiduser) return "Invalid user id"
  const query = { userId: new mongoose.Types.ObjectId(userId) };

  const { interactions, total } = await getUserInteractions(query, {
    limit: parseInt(limit),
    skip: parseInt(page - 1) * parseInt(limit)
  });
  // amazonq-ignore-next-line

  const result = {
    interactions,
    pagination: {
      total,
      limit: parseInt(limit),
      page: parseInt(page),
      total_pages: Math.ceil(total / parseInt(limit)),
      hasMore: total > parseInt((page - 1) * limit) + parseInt(limit)
    }
  };

  logger.logServiceEnd('InteractionService', 'getInteractionHistory', {
    interactionCount: result.interactions?.length || 0,
    pagination: {
      total: result.pagination?.total || 0,
      limit: result.pagination?.limit || 0,
      page: result.pagination?.page || 0,
      total_pages: result.pagination?.total_pages || 0,
      hasMore: result.pagination?.hasMore || false
    }
  });
  return result;
};


const getReceivedInteractions = async (targetUserId, options) => {
  const { limit = 20, page = 1 } = options;

  // ✅ Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    throw new Error('Invalid targetUserId');
  }

  const matchQuery = {
    targetUserId: new mongoose.Types.ObjectId(targetUserId)
  };

  const skip = (page - 1) * limit;

  const [results, totalResults] = await Promise.all([
    Interaction.aggregate([
      { $match: matchQuery },

      {
        $lookup: {
          from: 'users',
          localField: 'userId',      // source user (who liked/disliked)
          foreignField: '_id',
          as: 'sourceUser'
        }
      },
      {
        $unwind: {
          path: '$sourceUser',
          preserveNullAndEmptyArrays: true
        }
      },

      {
        $project: {
          _id: 0,
          type: { $literal: 'interaction' },
          sourceUserId: '$userId',
          action: 1,
          createdAt: 1
        }
      },

      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]),
    Interaction.countDocuments(matchQuery)
  ]);

  // ✅ Correct return shape (matches frontend & controller)
  return {
    results,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(totalResults / limit),
      totalResults
    }
  };
};






// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  processInteraction,
  checkForMatch,
  generateInteractionAnalytics,
  processBatchInteractions,
  getInteractionHistory,
  getReceivedInteractions
};
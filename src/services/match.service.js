const mongoose = require('mongoose');
const Match = require('../models/matching.model');
const Interaction = require('../models/interaction.model');
const User = require('../models/user.model');
const logger = require('../config/logger');
const { sanitizeForLog } = logger;

// ------------------------------
// CREATE MATCH IF NOT EXISTS
// ------------------------------
const checkAndCreateMatch = async (userId1, userId2) => {
  try {
    const u1 = new mongoose.Types.ObjectId(userId1);
    const u2 = new mongoose.Types.ObjectId(userId2);

    // 1️⃣ Has userId2 already liked userId1?
    const reciprocalLike = await Interaction.findOne({
      userId: u2,
      targetUserId: u1,
      action: { $in: ['like', 'superlike'] }
    });

    if (!reciprocalLike) return null;

    // 2️⃣ Check if match already exists
    let existingMatch = await Match.findOne({
      users: { $all: [u1, u2] }
    });

    if (existingMatch) return existingMatch;

    // 3️⃣ Create match
    const newMatch = await Match.create({
      users: [u1, u2],
      matchedAt: new Date(),
      isActive: true
    });

    logger.info('Match created', {
      users: [sanitizeForLog(userId1), sanitizeForLog(userId2)],
      matchId: sanitizeForLog(newMatch._id)
    });

    return newMatch;

  } catch (error) {
    logger.error('Error creating match', {
      error: sanitizeForLog(error.message),
      userId1: sanitizeForLog(userId1),
      userId2: sanitizeForLog(userId2)
    });
    throw error;
  }
};




// ------------------------------
// GET MATCHES FOR A USER
// ------------------------------
const getUserMatches = async (userId, options = {}) => {
    const { limit = 20, page = 1 } = options;
    const skip = (page - 1) * limit;

    if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error('Invalid user ID');

    const pipeline = [
        {
            $match: {
                users: { $in: [new mongoose.Types.ObjectId(userId)] },
                isActive: true
            }
        },
        { $sort: { matchedAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
            $lookup: {
                from: 'users',
                localField: 'users',
                foreignField: '_id',
                as: 'userDetails'
            }
        },
        {
            $project: {
                _id: 1,
                matchedAt: 1,
                isActive: 1,
                users: 1,
                userDetails: 1
            }
        }
    ];

    const [matches, total] = await Promise.all([
        Match.aggregate(pipeline),
        Match.countDocuments({
            users: { $in: [new mongoose.Types.ObjectId(userId)] },
            isActive: true
        })

    ]);

    return {
        results: matches,
        pagination: {
            page,
            limit,
            totalResults: total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

// ------------------------------
// UNMATCH / DELETE MATCH
// ------------------------------
const unmatch = async (matchId, userId) => {
    const match = await Match.findById(matchId);
    if (!match || !match.isActive) throw new Error('Match not found');

    if (!match.users.some(u => u.toString() === userId.toString())) {
        throw new Error('Not authorized');
    }



    match.isActive = false;
    await match.save();
    return match;
};

module.exports = {
    checkAndCreateMatch,
    getUserMatches,
    unmatch
};

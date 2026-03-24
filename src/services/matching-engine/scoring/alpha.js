const { Interaction } = require('../../../models');
const dayjs = require('dayjs');

/**
 * Viewer Activity Segmentation
 * 
 * Rules:
 * - Cold: 0-10 weekly interactions -> alpha = 0.75
 * - Normal: 11-50 weekly interactions -> alpha = 0.65
 * - Active: 51+ weekly interactions -> alpha = 0.55
 * 
 * Interactions = Swipes + Likes Sent + Likes Received + Matches (Last 7 Days)
 */

const SEGMENTS = {
    COLD: { name: 'cold', alpha: 0.75, min: 0, max: 10 },
    NORMAL: { name: 'normal', alpha: 0.65, min: 11, max: 50 },
    ACTIVE: { name: 'active', alpha: 0.55, min: 51, max: Infinity }
};

const calculateViewerAlpha = async (viewerId) => {
    const sevenDaysAgo = dayjs().subtract(7, 'day').toDate();

    // 1. Count Swipes/Likes Sent (Source)
    const sentCount = await Interaction.countDocuments({
        userId: viewerId,
        createdAt: { $gte: sevenDaysAgo }
    });

    // 2. Count Likes Received (Target)
    // Assuming 'like' action
    const receivedCount = await Interaction.countDocuments({
        targetUserId: viewerId,
        action: 'like',
        createdAt: { $gte: sevenDaysAgo }
    });

    // Total Interactions
    const totalInteractions = sentCount + receivedCount; // + matches if separate

    let segment = SEGMENTS.COLD;
    if (totalInteractions > SEGMENTS.NORMAL.max) {
        segment = SEGMENTS.ACTIVE;
    } else if (totalInteractions > SEGMENTS.COLD.max) {
        segment = SEGMENTS.NORMAL;
    }

    return {
        alpha: segment.alpha,
        segment: segment.name,
        interactions: totalInteractions
    };
};

module.exports = {
    calculateViewerAlpha,
    SEGMENTS
};

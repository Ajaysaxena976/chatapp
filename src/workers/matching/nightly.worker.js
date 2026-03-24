const { UserProfile } = require('../../models');
const { calculateViewerAlpha } = require('../matching-engine/scoring/alpha');
const logger = require('../../config/logger');

/**
 * Nightly Rebuild Worker
 * 
 * Responsibilities:
 * 1. Refresh Alpha segments for all active users based on last 7 days.
 * 2. Reset weekly exposure counters in PairStates (Handled by separate logic or week_id shift).
 * 3. Pre-cache decks (Optional).
 */
const runNightlyRebuild = async () => {
    logger.info('[NIGHTLY WORKER] Starting Matching Engine Rebuild...');

    // 1. Get all active profiles
    // For large datasets, use cursor/batching
    const profiles = await UserProfile.find({});
    logger.info(`[NIGHTLY WORKER] Processing ${profiles.length} profiles...`);

    for (const profile of profiles) {
        try {
            // Recalculate Alpha
            const alphaRes = await calculateViewerAlpha(profile.user_id);

            // Sync to profile
            profile.activity_segment = alphaRes.segment;
            profile.alpha_value = alphaRes.alpha;

            await profile.save();
        } catch (err) {
            logger.error(`[NIGHTLY WORKER] Failed to update profile ${profile._id}: ${err.message}`);
        }
    }

    logger.info('[NIGHTLY WORKER] Rebuild complete.');
};

// Export for use in Cron/BullMQ
module.exports = {
    runNightlyRebuild
};

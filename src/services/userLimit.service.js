const moment = require("moment");
const {UserLimit, DatingSwipeConfig} = require("../models");

const checkUserLimits = async (user_id, action, isSubscribed) => {
  let limit = await UserLimit.findOne({ user_id });
  console.log("Current User Limit:", limit);
  // Create if not exist
  if (!limit) {
    limit = await UserLimit.create({
      user_id,
      weekly_reset_at: moment().endOf("isoWeek").toDate(),
      daily_reset_at: moment().endOf("day").toDate()
    });
  }

  // Auto-reset weekly swipes
  if (moment().isAfter(limit.weekly_reset_at)) {
    limit.swipe_count = 0;
    limit.weekly_reset_at = moment().endOf("isoWeek").toDate();
  }

  // Auto-reset daily meets
  if (moment().isAfter(limit.daily_reset_at)) {
    limit.meet_count = 0;
    limit.daily_reset_at = moment().endOf("day").toDate();
  }

  // ---------- APPLY LIMIT LOGIC ----------
if (!isSubscribed) {
    const config = await DatingSwipeConfig.findOne();
    console.log("Swipe Config:", config.daily_meet_limit, config.swipe_max_limit);

    // Block on PASS (weekly swipe limit)
    if (action === "pass" && limit.swipe_count >= config.swipe_max_limit) {
        return { allowed: false, reason: "WEEKLY_SWIPE_LIMIT" };
    }
    if (action === "dislike" && limit.swipe_count >= config.swipe_max_limit) {
        return { allowed: false, reason: "DAILY_MEET_LIMIT" };
    }
    console.log("Passed swipe limit check",action, limit.meet_count, config.daily_meet_limit);
    // Block on LIKE (daily meet limit)
    if (action === "like" && limit.meet_count >= config.daily_meet_limit) {
        return { allowed: false, reason: "DAILY_MEET_LIMIT" };
    }
}
  return { allowed: true, limit };
};

const updateUserLimit = async (limit, action) => {
  if (action === "pass") limit.swipe_count += 1;
  if (action === "like") limit.meet_count += 1;
  if (action === "dislike") limit.meet_count += 1;


  await limit.save();
};

module.exports = {
  checkUserLimits,
  updateUserLimit
};

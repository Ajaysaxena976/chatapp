const mongoose = require("mongoose");
const { toJSON } = require('./plugins');

const DatingSwipeConfigSchema = new mongoose.Schema({
  swipe_max_limit : {type:Number, default:100},
  daily_meet_limit: { type: Number, default: 3 },
});

DatingSwipeConfigSchema.plugin(toJSON);
module.exports = mongoose.model("DatingSwipeConfig", DatingSwipeConfigSchema);

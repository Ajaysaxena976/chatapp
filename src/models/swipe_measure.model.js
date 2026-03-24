const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const UserlimitSchema = mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  swipe_count: { type: Number, default: 0 },
  meet_count: { type: Number, default: 0 },

  weekly_reset_at: { type: Date },
  daily_reset_at: { type: Date },
},
{ timestamps: true });

UserlimitSchema.plugin(toJSON);

const UserLimit = mongoose.model('UserLimit', UserlimitSchema);
module.exports = UserLimit;

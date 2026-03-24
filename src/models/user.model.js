const mongoose = require('mongoose');
const validator = require('validator');
const { toJSON, paginate } = require('./plugins');

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    auth_id: {
      type: String,
      trim: true,
      // unique: true,
    },
    phone_number: {
      type: String,
      trim: true,
      // unique: true,
    },
    phone_code: {
      type: String,
      trim: true,
    },
    is_mobile_verified: {
      type: Boolean,
      default: false
    },
    is_social_login: {
      type: Boolean,
      default: false
    },
    social_login_type:{
      type: String,
      trim: true,
      enum: ['google', 'apple']
    },
    social_authId:{
      type: String,
    },
    is_registered:{
      type: Boolean,
      default: false,
    },
    is_detailed_submit:{
      type: Boolean,
      default: false
    },
    is_subscribed:{
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * @typedef User
 */
const User = mongoose.model('User', userSchema);

module.exports = User;

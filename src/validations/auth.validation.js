const Joi = require('joi');
const { password, objectId } = require('./custom.validation');


// The validation schema has a few issues:
// 1. social_detail is defined as Joi.string() but then uses .when() to validate it as an object
// 2. This will cause validation errors when is_social_login is true
// Here is the corrected version:

const register = {
  body: Joi.object().keys({
    dates_days: Joi.array().items(Joi.string().custom(objectId)).required(),
    name: Joi.string().required(),
    date_of_birth: Joi.string().required().regex(/^\d{2}-\d{2}-\d{4}$/).messages({
      'string.pattern.base': 'Date of birth must be in the format DD-MM-YYYY'
    }),
    gender: Joi.string().required().custom(objectId),
    interestedIn: Joi.string().required().custom(objectId),
    lookingFor: Joi.array().items(Joi.string().custom(objectId)).min(1).required(),
    phone: Joi.string().required().regex(/^\d{6,15}$/),
    phone_code: Joi.string().required().regex(/^\+\d{1,4}$/),
    is_social_login: Joi.boolean().default(false),
    social_detail: Joi.when('is_social_login', { 
      is: true, 
      then: Joi.object().keys({
        type: Joi.string().valid('google', 'apple').required(),
        token: Joi.string().required()
      }),
      otherwise: Joi.forbidden()
    }),
  })
}
const registerPhoneVerify = {
  body: Joi.object().keys({
    token: Joi.string().required(),
    otp: Joi.string().required().regex(/^\d{6}$/).messages({
      'string.pattern.base': 'OTP must be a 6-digit number'
    }),
  })
}

const afterRegisterDetail = {
  body: Joi.object().keys({
    about_yourself: Joi.string().required(),
    idea_of_great_date: Joi.string().required(),
    main_photo_url: Joi.string().required(),
    additional_photos: Joi.array().items(Joi.string()).required(),
    favorites_dates: Joi.object().keys({
      food_and_drink: Joi.string().required().custom(objectId),
      active_and_outdoor: Joi.string().required().custom(objectId),
      fun: Joi.string().required().custom(objectId),
      chill_and_cozy: Joi.string().required().custom(objectId),
    }),
    location: Joi.object().keys({
      address: Joi.string().required(),
      lat: Joi.number()
        .min(-90)
        .max(90)
        .required(),
      lng: Joi.number()
        .min(-180)
        .max(180)
        .required()
    }).required(),
  })
}
const mobileLogin = {
  body: Joi.object().keys({
    phone: Joi.string().required().regex(/^\d{6,15}$/),
    phone_code: Joi.string().required().regex(/^\+\d{1,4}$/)
  })
}
const login = {
  body: Joi.object().keys({
    phone: Joi.string().required().regex(/^\d{6,15}$/),
    phone_code: Joi.string().required().regex(/^\+\d{1,4}$/)
  }),
};

const socialLogin = {
  body: Joi.object().keys({
    type: Joi.string().valid('google', 'apple').required(),
    token: Joi.string()
  })
}
const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};


const verifySMS = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
  body: Joi.object().keys({
    code: Joi.string().required(),
  }),
};

const sendVerificationSMS = {
  body: Joi.object().keys({
    phone: Joi.string().required(),
  }),
};


const loginMobileVerify = {
  body: Joi.object().keys({
    token: Joi.string().required(),
    otp: Joi.string().required().regex(/^\d{6}$/).messages({
      'string.pattern.base': 'OTP must be a 6-digit number'
    }),
  })
}
module.exports = {
  login,
  logout,
  refreshTokens,
  verifySMS,
  sendVerificationSMS,
  socialLogin,
  register,
  registerPhoneVerify,
  mobileLogin,
  loginMobileVerify,
  afterRegisterDetail
};

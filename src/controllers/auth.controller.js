const httpStatus = require('http-status');
const catchAsync = require('../utils/catch-async');
const { authService, tokenService, userService, twilioService } = require('../services');
const { encode, decode } = require('../utils/security');
const logger = require('../config/logger');
const { sanitizeForLog } = logger;
const ApiError = require('../utils/api-error');

const register = catchAsync(async (req, res) => {
  const { phone, phone_code, is_social_login } = req.body;
  logger.logControllerStart('AuthController', 'register', { phone: sanitizeForLog(phone), phone_code: sanitizeForLog(phone_code) });

  await userService.dataValidation(req.body);
  const isAvailable = await userService.checkExistingPhoneNumber(phone, phone_code);

  let response_msg;

  if (isAvailable) {
    logger.warn(
      '[CONTROLLER] AuthController.register - Phone number exists',
      { phone: sanitizeForLog(phone), phone_code: sanitizeForLog(phone_code) }
    );

    if (isAvailable.is_social_login === true) {
      if (isAvailable.social_login_type === 'apple') {
        response_msg =
          'This mobile number is already linked to an Apple login account. Please sign in using Apple or use a different mobile number.';
      } else if (isAvailable.social_login_type === 'google') {
        response_msg =
          'This mobile number is already linked to a Google login account. Please sign in using Google or use a different mobile number.';
      } else {
        response_msg =
          'This mobile number is already linked to a social login account. Please sign in using the same method or use a different mobile number.';
      }
    } else {
      response_msg =
        'This mobile number is already linked to an existing account. Please sign in using your mobile number or use a different number..';
    }

    res.status(httpStatus.OK).send({
      message: response_msg,
      mobile_exist: true,
      user: isAvailable
    });

    return;
  }


  if (is_social_login) {
    const socialLogin = await authService.socialLogin(req.body.social_detail);
    req.body["socialLogin"] = socialLogin;
  }
  const sendOTP = await twilioService.sendOTP(`${phone_code}${phone}`);
  if (!sendOTP.success) {
    logger.error('[CONTROLLER] AuthController.register - Failed to send OTP', { phone: sanitizeForLog(phone), phone_code: sanitizeForLog(phone_code) });
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to send OTP retry again please.');
  }
  const parseData = await encode(JSON.stringify(req.body));
  logger.logControllerEnd('AuthController', 'register', { tokenGenerated: true });
  res.status(httpStatus.OK).send({ token: parseData, mobile_exist: false });
});

const mobileLogin = catchAsync(async (req, res) => {
  const { phone, phone_code } = req.body;
  logger.logControllerStart('AuthController', 'mobileLogin', { phone: sanitizeForLog(phone), phone_code: sanitizeForLog(phone_code) });

  const user = await userService.checkIsRegistered(phone, phone_code);
  if (!user) {
    res.status(httpStatus.OK).send({
      token: null,
      is_registered: false,
      message: 'Please register first'
    });
    return;
  }
  const sendOTP = await twilioService.sendOTP(`${phone_code}${phone}`);
  if (!sendOTP.success) {
    logger.error('[CONTROLLER] AuthController.mobileLogin - Failed to send OTP', { phone: sanitizeForLog(phone), phone_code: sanitizeForLog(phone_code) });
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to send OTP retry again please.');
  }
  const tokenData = user ? await encode(JSON.stringify(user)) : null;
  logger.logControllerEnd('AuthController', 'mobileLogin', { tokenGenerated: true, isRegistered: !!user, otpSent: true });
  res.status(httpStatus.OK).send({
    token: tokenData,
    is_registered: !!user,
    message: user
      ? 'User found, OTP sent successfully.'
      : 'User not registered, OTP sent for registration.'
  });
});



const loginMobileVerify = catchAsync(async (req, res) => {
  const { token, otp } = req.body;
  logger.logControllerStart('AuthController', 'loginMobileVerify', { hasToken: !!token, hasOtp: !!otp });

  const decodeData = await decode(token);
  const data = JSON.parse(decodeData);
  const verifyOTP = await twilioService.verifyOTP(`${data.phone_code}${data.phone_number}`, otp);
  if (!verifyOTP.success) {
    logger.warn('[CONTROLLER] AuthController.loginMobileVerify - Invalid OTP', { phone: sanitizeForLog(data.phone_number?.toString().replace(/[^0-9+]/g, '')) });
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid OTP');
  }
  const tokens = await tokenService.generateAuthTokens(data);
  logger.logControllerEnd('AuthController', 'loginMobileVerify', { userId: sanitizeForLog(String(data._id).replace(/[^a-f0-9]/gi, '')) });
  res.status(httpStatus.OK).send({ user: data, tokens });
});


const registerPhoneVerify = catchAsync(async (req, res) => {
  const { token, otp } = req.body
  logger.logControllerStart('AuthController', 'registerPhoneVerify', { hasToken: !!token, hasOtp: !!otp });

  const decodeData = await decode(token);
  let data = JSON.parse(decodeData);
  let verifyOTP = await twilioService.verifyOTP(`${data.phone_code}${data.phone}`, otp);
  if (!verifyOTP.success) {
    logger.warn('[CONTROLLER] AuthController.registerPhoneVerify - Invalid OTP', { phone: sanitizeForLog(data.phone?.toString().replace(/[^0-9+]/g, '')) });
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid OTP');
  }
  const saveUser = await userService.registerUser(data);
  const tokens = await tokenService.generateAuthTokens(saveUser.registerUser);
  logger.logControllerEnd('AuthController', 'registerPhoneVerify', { userId: sanitizeForLog(saveUser.registerUser._id) });
  res.status(httpStatus.OK).send({ user: saveUser.registerUser, tokens });
})


const socialLogin = catchAsync(async (req, res) => {
  const { type, token } = req.body;
  const user = await authService.loginUserWithSocialToken(type, token);
  if (!user) {
    res.status(httpStatus.OK).send({
      token: null,
      is_registered: false,
      message: 'Please register first'
    });
    return;
  }
  // const tokens = await tokenService.generateAuthTokens(user);
  const tokens = await tokenService.generateAuthTokens(user.user);

  logger.logControllerEnd('AuthController', 'socialLogin', {isRegistered: true });

  // res.send({ user, tokens });
  res.status(httpStatus.OK).send({
    success: true,
    is_registered: true,
    message: 'Login successful.',
    user: user,
    tokens,
  });
});

const logout = catchAsync(async (req, res) => {
  logger.logControllerStart('AuthController', 'logout', { hasRefreshToken: !!req.body.refreshToken });
  await authService.logout(req.body.refreshToken);
  logger.logControllerEnd('AuthController', 'logout');
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  logger.logControllerStart('AuthController', 'refreshTokens', { hasRefreshToken: !!req.body.refreshToken });
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  logger.logControllerEnd('AuthController', 'refreshTokens', { tokensGenerated: !!tokens });
  res.status(httpStatus.OK).send({ ...tokens });
});

const afterRegisterDetail = catchAsync(async (req, res) => {
  const { about_yourself, idea_of_great_date, main_photo_url, additional_photos, favorites_dates, location } = req.body;
  logger.logControllerStart('AuthController', 'afterRegisterDetail', {
    about_yourself: sanitizeForLog(about_yourself),
    idea_of_great_date: sanitizeForLog(idea_of_great_date),
    main_photo_url: sanitizeForLog(main_photo_url)
  });
  const user = req.user
  logger.logControllerStart('AuthController', 'user from token', { userId: sanitizeForLog(String(user._id)) });
  await userService.validateAfterRegisterData(req.body);
  const update_detail = await userService.updateAfterRegisterData(req.body, user);
  res.status(httpStatus.OK).send({ updated_detail: update_detail });

});

const appleLoginCallback = catchAsync(async (req, res) => {
  console.log("requests  :::", req);
  console.log("res end");
  res.status(httpStatus.OK).send();
})

const deleteAccount = catchAsync(async (req, res) => {
  const user = req.user
  logger.logControllerStart('AuthController', 'deleteAccount', { userId: sanitizeForLog(String(user._id).replace(/[^a-f0-9]/gi, '')) });
  await userService.deleteUserAccount(user);
  logger.logControllerEnd('AuthController', 'deleteAccount', { userId: sanitizeForLog(String(user._id).replace(/[^a-f0-9]/gi, '')) });
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  logout,
  refreshTokens,
  socialLogin,
  register,
  registerPhoneVerify,
  mobileLogin,
  loginMobileVerify,
  afterRegisterDetail,
  appleLoginCallback,
  deleteAccount
};

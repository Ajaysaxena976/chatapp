
const httpStatus = require('http-status');
const tokenService = require('./token.service');
const userService = require('./user.service');
const Token = require('../models/token.model');
const ApiError = require('../utils/api-error');
const { tokenTypes } = require('../config/tokens');
const logger = require('../config/logger');
const { sanitizeForLog } = logger;
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const { User } = require('../models');
const { OAuth2Client } = require("google-auth-library");
const bcrypt = require("bcryptjs");
const { login } = require('../validations/auth.validation');
const { warmUserCache } = require('./matching-engine/pipeline.service');


/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<user>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  logger.logServiceStart('AuthService', 'loginUserWithEmailAndPassword', { email: sanitizeForLog(email) });
  const user = await userService.getUserByEmail(email);
  if (!user || !(await user.isPasswordMatch(password))) {
    logger.warn('[SERVICE] AuthService.loginUserWithEmailAndPassword - Invalid credentials', { email: sanitizeForLog(email) });
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  logger.logServiceEnd('AuthService', 'loginUserWithEmailAndPassword', { userId: user._id });

  // Background Warming: Pre-compute feed for zero latency
  warmUserCache(user._id);

  return user;
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken) => {
  logger.logServiceStart('AuthService', 'logout', { hasRefreshToken: !!refreshToken });
  const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
  if (!refreshTokenDoc) {
    logger.warn('[SERVICE] AuthService.logout - Refresh token not found');
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }

  await refreshTokenDoc.remove();
  logger.logServiceEnd('AuthService', 'logout');
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  logger.logServiceStart('AuthService', 'refreshAuth', { hasRefreshToken: !!refreshToken });
  try {

    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await userService.getUserById(refreshTokenDoc.user);
    if (!user) {
      logger.warn('[SERVICE] AuthService.refreshAuth - User not found for token');
      throw new Error();
    }
    await refreshTokenDoc.remove();
    const tokens = await tokenService.generateAuthTokens(user);
    logger.logServiceEnd('AuthService', 'refreshAuth', { userId: user._id });
    return tokens;
  } catch (error) {
    logger.error('[SERVICE] AuthService.refreshAuth - Authentication failed', { error: sanitizeForLog(error.message) });
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (resetPasswordToken, newPassword) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD);
    const user = await userService.getUserById(resetPasswordTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await userService.updateUserById(user.id, { password: newPassword });
    await Token.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
  }
};

/**
 * Verify email
 * @param {string} verifyEmailToken
 * @returns {Promise}
 */
const verifyEmail = async (verifyEmailToken) => {
  try {
    const verifyEmailTokenDoc = await tokenService.verifyToken(verifyEmailToken, tokenTypes.VERIFY_EMAIL);
    const user = await userService.getUserById(verifyEmailTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await Token.deleteMany({ user: user.id, type: tokenTypes.VERIFY_EMAIL });
    await userService.updateUserById(user.id, { isEmailVerified: true });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
  }
};



const getUserByAuthId = async (authId, type) => {
  const find_user = await User.findOne({
    social_login_type: type,
    social_authId: authId,
  }).catch((e) => { console.log(e) });
  return find_user;
}
const verifyGoogle = async (token) => {
  try {
    logger.logServiceStart('AuthService', 'verifyGoogle', { token: sanitizeForLog(token) });
    const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (payload.exp < Date.now() / 1000) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired Google token.');
    }
    const user = await getUserByAuthId(payload.sub, 'google');
    if (user) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Google ID already linked with another account.');
    }
    logger.logServiceEnd('AuthService', 'verifyGoogle', { userId: payload.sub });
    return {
      id: payload.sub,
      email: payload.email,
      email_verified: payload.email_verified,
      type: 'google'
    };
  } catch (error) {
    logger.error('[SERVICE] AuthService.verifyApple - Authentication failed', { error: sanitizeForLog(error.message) });
    throw new ApiError(httpStatus.UNAUTHORIZED, error.message);
  }
}

const verifyApple = async (token) => {
  try {
    logger.logServiceStart('AuthService', 'verifyApple', { token: sanitizeForLog(token) });
    // 1. Get the key ID from the token header
    const decodedTokenHeader = jwt.decode(token, { complete: true }).header;
    const kid = decodedTokenHeader.kid;

    // 2. Create a JWKS client to fetch Apple's public keys
    const client = jwksClient({
      jwksUri: 'https://appleid.apple.com/auth/keys',
    });

    // 3. Get the specific signing key from Apple using the key ID
    const key = await client.getSigningKey(kid);
    const signingKey = key.getPublicKey();

    // 4. Verify the token's signature and claims
    const payload = jwt.verify(token, signingKey, {
      algorithms: ['RS256'],
      issuer: 'https://appleid.apple.com',
      audience: process.env.APPLE_CLIENT_ID,
    });

    // 5. Check if the token is still valid (Apple tokens are short-lived)
    if (payload.exp < Date.now() / 1000) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired Apple token.');
    }
    const user = await getUserByAuthId(payload.sub, 'apple');
    if (user) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Apple ID already linked with another account.');
    }
    logger.logServiceEnd('AuthService', 'verifyApple', { userId: payload.sub });
    return {
      id: payload.sub,
      email: payload.email,
      email_verified: payload.email_verified,
      type: 'apple'
    };
  } catch (error) {
    logger.error('[SERVICE] AuthService.verifyApple - Authentication failed', { error: sanitizeForLog(error.message) });
    throw new ApiError(httpStatus.UNAUTHORIZED, error.message);
  }
}


const socialLogin = async (socialDetail) => {
  logger.logServiceStart('AuthService', 'socialLogin', { socialDetail: sanitizeForLog(socialDetail) });
  const { type, token } = socialDetail;
  let token_output;
  if (type === 'google') {
    token_output = await verifyGoogle(token);
  } else if (type === 'apple') {
    token_output = await verifyApple(token);
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid social login type');
  }
  logger.logServiceEnd('AuthService', 'socialLogin');
  return token_output;
}

const appleLogin = async (token) => {
  try {
    logger.logServiceStart('AuthService', 'appleLogin', { token: sanitizeForLog(token) });
    // 1. Get the key ID from the token header
    const decodedTokenHeader = jwt.decode(token, { complete: true }).header;
    const kid = decodedTokenHeader.kid;

    // 2. Create a JWKS client to fetch Apple's public keys
    const client = jwksClient({
      jwksUri: 'https://appleid.apple.com/auth/keys',
    });

    // 3. Get the specific signing key from Apple using the key ID
    const key = await client.getSigningKey(kid);
    const signingKey = key.getPublicKey();

    // 4. Verify the token's signature and claims
    const payload = jwt.verify(token, signingKey, {
      algorithms: ['RS256'],
      issuer: 'https://appleid.apple.com',
      audience: process.env.APPLE_CLIENT_ID,
    });

    // 5. Check if the token is still valid (Apple tokens are short-lived)
    if (payload.exp < Date.now() / 1000) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired Apple token.');
    }
    logger.logServiceEnd('AuthService', 'appleLogin', { userId: payload.sub });
    return {
      id: payload.sub,
      email: payload.email,
      email_verified: payload.email_verified,
      type: 'apple'
    };
  } catch (error) {
    logger.error('[SERVICE] AuthService.appleLogin - Authentication failed', { error: sanitizeForLog(error.message) });
    throw new ApiError(httpStatus.UNAUTHORIZED, error.message);
  }
}

const googleLogin = async (token) => {
  try {
    logger.logServiceStart('AuthService', 'googleLogin', { token: sanitizeForLog(token) });
    const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (payload.exp < Date.now() / 1000) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired Google token.');
    }
    logger.logServiceEnd('AuthService', 'googleLogin', { userId: payload.sub });
    return {
      id: payload.sub,
      email: payload.email,
      email_verified: payload.email_verified,
      type: 'google'
    };
  } catch (error) {
    logger.error('[SERVICE] AuthService.googleLogin - Authentication failed', { error: sanitizeForLog(error.message) });
    throw new ApiError(httpStatus.UNAUTHORIZED, error.message);
  }
}
const loginUserWithSocialToken = async (type, token) => {
  logger.logServiceStart('AuthService', 'loginUserWithSocialToken', { type: sanitizeForLog(type), token: sanitizeForLog(token) });
  let token_output;
  if (type === 'google') {
    token_output = await googleLogin(token);
  } else if (type === 'apple') {
    token_output = await appleLogin(token);
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid social login type');
  }
  let user = await getUserByAuthId(token_output.id, type);
  if (!user) {
    return null;
  }

  if (!user.is_registered) {
    // throw new ApiError(httpStatus.BAD_REQUEST, 'User registration incomplete, please complete registration.');
    return { is_registered: false, user, socialData: token_output };
  }
  // Background Warming: Pre-compute feed for zero latency
  warmUserCache(user._id);

  logger.logServiceEnd('AuthService', 'loginUserWithSocialToken', { userId: user._id });
  return { is_registered: true, user, socialData: token_output };
}

module.exports = {
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
  resetPassword,
  verifyEmail,
  socialLogin,
  loginUserWithSocialToken
};

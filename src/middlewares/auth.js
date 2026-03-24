const passport = require('passport');
const ApiError = require('../utils/api-error');
const { roleRights } = require('../config/roles');
const logger = require('../config/logger');
const { sanitizeForLog } = logger;

const verifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
  if (err || info || !user) {
    logger.warn('[MIDDLEWARE] Auth - Authentication failed', { 
      url: req.originalUrl, 
      method: req.method,
      error: sanitizeForLog(err?.message),
      info: sanitizeForLog(info?.message) 
    });
    return reject(new ApiError(require('http-status').UNAUTHORIZED, 'Please authenticate'));
  }
  req.user = user;
  logger.logMiddleware('Auth', 'USER_AUTHENTICATED', { userId: user.id, role: user.role });

  if (requiredRights.length) {
    const userRights = roleRights.get(user.role);
    const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
    if (!hasRequiredRights && req.params.userId !== user.id) {
      logger.warn('[MIDDLEWARE] Auth - Insufficient permissions', { 
        userId: user.id, 
        role: user.role, 
        requiredRights, 
        userRights: Array.from(userRights) 
      });
      return reject(new ApiError(require('http-status').FORBIDDEN, 'Forbidden'));
    }
    logger.logMiddleware('Auth', 'AUTHORIZATION_SUCCESS', { userId: user.id, requiredRights });
  }

  resolve();
};

const auth = (...requiredRights) => async (req, res, next) => {
  logger.logMiddleware('Auth', 'START', { 
    url: req.originalUrl, 
    method: req.method, 
    requiredRights 
  });
  
  return new Promise((resolve, reject) => {
    passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
  })
    .then(() => {
      logger.logMiddleware('Auth', 'SUCCESS', { userId: req.user?.id });
      next();
    })
    .catch((err) => {
      logger.error('[MIDDLEWARE] Auth - Authentication error', { 
        error: sanitizeForLog(err.message), 
        url: sanitizeForLog(req.originalUrl), 
        method: sanitizeForLog(req.method) 
      });
      next(err);
    });
};



module.exports = auth;

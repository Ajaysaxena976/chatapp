const csrf = require('csrf');
const httpStatus = require('http-status');
const ApiError = require('../utils/api-error');

const tokens = new csrf();

const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET requests
  if (req.method === 'GET') {
    return next();
  }

  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const secret = req.headers['x-csrf-secret'] || req.session?.csrfSecret;

  if (!token || !secret) {
    return next(new ApiError(httpStatus.FORBIDDEN, 'CSRF token missing'));
  }

  if (!tokens.verify(secret, token)) {
    return next(new ApiError(httpStatus.FORBIDDEN, 'Invalid CSRF token'));
  }

  next();
};

module.exports = csrfProtection;
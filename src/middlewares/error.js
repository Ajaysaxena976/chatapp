const mongoose = require('mongoose');
const httpStatus = require('http-status');
const logger = require('../config/logger');
const { sanitizeForLog } = logger;
const ApiError = require('../utils/api-error');
const { ERROR_TYPES } = require('../utils/error-types');

const errorConverter = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    let statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    let message = err.message || httpStatus[statusCode];
    let type = null;

    // Handle Mongoose validation errors
    if (err instanceof mongoose.Error.ValidationError) {
      statusCode = httpStatus.BAD_REQUEST;
      message = Object.values(err.errors).map(e => e.message).join(', ');
      type = ERROR_TYPES.VALIDATION_ERROR;
    }
    // Handle Mongoose duplicate key errors
    else if (err.code === 11000) {
      statusCode = httpStatus.CONFLICT;
      const field = Object.keys(err.keyValue)[0];
      message = `${field} already exists`;
      type = ERROR_TYPES.DUPLICATE_ERROR;
    }
    // Handle Mongoose cast errors
    else if (err instanceof mongoose.Error.CastError) {
      statusCode = httpStatus.BAD_REQUEST;
      message = `Invalid ${err.path}: ${err.value}`;
      type = ERROR_TYPES.VALIDATION_ERROR;
    }
    // Handle JWT errors
    else if (err.name === 'JsonWebTokenError') {
      statusCode = httpStatus.UNAUTHORIZED;
      message = 'Invalid token';
      type = ERROR_TYPES.AUTHENTICATION_ERROR;
    }
    else if (err.name === 'TokenExpiredError') {
      statusCode = httpStatus.UNAUTHORIZED;
      message = 'Token expired';
      type = ERROR_TYPES.AUTHENTICATION_ERROR;
    }
    // Handle Joi validation errors
    else if (err.isJoi) {
      statusCode = httpStatus.BAD_REQUEST;
      message = err.details.map(detail => detail.message).join(', ');
      type = ERROR_TYPES.VALIDATION_ERROR;
    }

    error = new ApiError(statusCode, message, false, err.stack);
    error.type = type;
  }
  next(error);
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let { statusCode, message, type } = err;
  const { roleRights } = require('../config/roles');
  
  // Check if user is authorized to see detailed error information
  const isAuthorizedForDetails = req.user && 
    roleRights.get(req.user.role)?.includes('manageUsers');
  
  // Log error details
  const errorLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    error: {
      type: type || 'UNKNOWN_ERROR',
      statusCode,
      message,
      stack: err.stack
    }
  };

  if (require('../config/config').env === 'production' && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = 'Internal server error';
    logger.error('Unhandled error:', {
      ...errorLog,
      method: sanitizeForLog(errorLog.method),
      url: sanitizeForLog(errorLog.url),
      userAgent: sanitizeForLog(errorLog.userAgent),
      error: {
        ...errorLog.error,
        message: sanitizeForLog(errorLog.error.message)
      }
    });
  } else {
    logger.error('Error occurred:', {
      ...errorLog,
      method: sanitizeForLog(errorLog.method),
      url: sanitizeForLog(errorLog.url),
      userAgent: sanitizeForLog(errorLog.userAgent),
      error: {
        ...errorLog.error,
        message: sanitizeForLog(errorLog.error.message)
      }
    });
  }

  res.locals.errorMessage = err.message;

  const response = {
    success: false,
    error: {
      code: statusCode,
      type: type || 'UNKNOWN_ERROR',
      message,
      timestamp: new Date().toISOString(),
      ...(err.details && (type === ERROR_TYPES.VALIDATION_ERROR || isAuthorizedForDetails) && { details: err.details }),
      ...(require('../config/config').env === 'development' && isAuthorizedForDetails && { stack: err.stack })
    }
  };

  res.status(statusCode).send(response);
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { 
    promise: sanitizeForLog(String(promise)), 
    reason: sanitizeForLog(String(reason)) 
  });
  // Graceful shutdown instead of immediate exit
  setTimeout(() => process.exit(1), 1000);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

module.exports = {
  errorConverter,
  errorHandler,
};

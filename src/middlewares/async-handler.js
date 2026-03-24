const logger = require('../config/logger');
const ErrorFactory = require('../utils/error-factory');

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    // Log the error with context
    logger.error('Async operation failed', {
      error: error.message,
      stack: error.stack,
      method: req.method,
      url: req.originalUrl,
      timestamp: new Date().toISOString()
    });

    // Handle specific error types
    if (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
      return next(ErrorFactory.createDatabaseError('Database connection failed'));
    }

    if (error.code === 'ECONNREFUSED') {
      return next(ErrorFactory.createExternalServiceError('Service', 'Service connection refused'));
    }

    next(error);
  });
};

module.exports = asyncHandler;
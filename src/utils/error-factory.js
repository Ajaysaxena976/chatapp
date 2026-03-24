const ApiError = require('./api-error');
const { ERROR_TYPES, ERROR_MESSAGES, ERROR_STATUS_CODES } = require('./error-types');

class ErrorFactory {
  static createValidationError(message = ERROR_MESSAGES[ERROR_TYPES.VALIDATION_ERROR], details = null) {
    const error = new ApiError(ERROR_STATUS_CODES[ERROR_TYPES.VALIDATION_ERROR], message);
    error.type = ERROR_TYPES.VALIDATION_ERROR;
    error.details = details;
    return error;
  }

  static createAuthenticationError(message = ERROR_MESSAGES[ERROR_TYPES.AUTHENTICATION_ERROR]) {
    const error = new ApiError(ERROR_STATUS_CODES[ERROR_TYPES.AUTHENTICATION_ERROR], message);
    error.type = ERROR_TYPES.AUTHENTICATION_ERROR;
    return error;
  }

  static createAuthorizationError(message = ERROR_MESSAGES[ERROR_TYPES.AUTHORIZATION_ERROR]) {
    const error = new ApiError(ERROR_STATUS_CODES[ERROR_TYPES.AUTHORIZATION_ERROR], message);
    error.type = ERROR_TYPES.AUTHORIZATION_ERROR;
    return error;
  }

  static createNotFoundError(resource = 'Resource', message = null) {
    const errorMessage = message || `${resource} not found`;
    const error = new ApiError(ERROR_STATUS_CODES[ERROR_TYPES.NOT_FOUND_ERROR], errorMessage);
    error.type = ERROR_TYPES.NOT_FOUND_ERROR;
    return error;
  }

  static createDuplicateError(resource = 'Resource', message = null) {
    const errorMessage = message || `${resource} already exists`;
    const error = new ApiError(ERROR_STATUS_CODES[ERROR_TYPES.DUPLICATE_ERROR], errorMessage);
    error.type = ERROR_TYPES.DUPLICATE_ERROR;
    return error;
  }

  static createExternalServiceError(service = 'External service', message = null) {
    const errorMessage = message || `${service} is currently unavailable`;
    const error = new ApiError(ERROR_STATUS_CODES[ERROR_TYPES.EXTERNAL_SERVICE_ERROR], errorMessage);
    error.type = ERROR_TYPES.EXTERNAL_SERVICE_ERROR;
    return error;
  }

  static createDatabaseError(message = ERROR_MESSAGES[ERROR_TYPES.DATABASE_ERROR]) {
    const error = new ApiError(ERROR_STATUS_CODES[ERROR_TYPES.DATABASE_ERROR], message);
    error.type = ERROR_TYPES.DATABASE_ERROR;
    return error;
  }

  static createBusinessLogicError(message = ERROR_MESSAGES[ERROR_TYPES.BUSINESS_LOGIC_ERROR]) {
    const error = new ApiError(ERROR_STATUS_CODES[ERROR_TYPES.BUSINESS_LOGIC_ERROR], message);
    error.type = ERROR_TYPES.BUSINESS_LOGIC_ERROR;
    return error;
  }
}

module.exports = ErrorFactory;
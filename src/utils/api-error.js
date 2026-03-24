class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.type = null;
    this.details = null;
    this.timestamp = new Date().toISOString();
    
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      type: this.type,
      details: this.details,
      timestamp: this.timestamp,
      isOperational: this.isOperational
    };
  }
}

module.exports = ApiError;

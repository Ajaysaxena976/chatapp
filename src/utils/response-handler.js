const httpStatus = require('http-status');
const logger = require('../config/logger');

class ResponseHandler {
  static success(res, data = null, message = 'Success', statusCode = httpStatus.OK) {
    const response = {
      success: true,
      message,
      timestamp: new Date().toISOString(),
      ...(data && { data })
    };
    
    logger.info('[RESPONSE] Success response sent', {
      statusCode,
      message,
      hasData: !!data,
      dataType: data ? typeof data : null
    });
    
    return res.status(statusCode).json(response);
  }

  static created(res, data = null, message = 'Resource created successfully') {
    logger.info('[RESPONSE] Created response sent', { message, hasData: !!data });
    return this.success(res, data, message, httpStatus.CREATED);
  }

  static noContent(res, message = 'Operation completed successfully') {
    const response = {
      success: true,
      message,
      timestamp: new Date().toISOString()
    };
    
    return res.status(httpStatus.NO_CONTENT).json(response);
  }

  static paginated(res, data, pagination, message = 'Data retrieved successfully') {
    const response = {
      success: true,
      message,
      timestamp: new Date().toISOString(),
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        totalPages: pagination.totalPages,
        totalResults: pagination.totalResults,
        hasNextPage: pagination.hasNextPage,
        hasPrevPage: pagination.hasPrevPage
      }
    };
    
    logger.info('[RESPONSE] Paginated response sent', {
      message,
      dataCount: data?.length,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        totalResults: pagination.totalResults
      }
    });
    
    return res.status(httpStatus.OK).json(response);
  }
}

module.exports = ResponseHandler;
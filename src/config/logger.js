const winston = require('winston');

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

const logger = winston.createLogger({
  level: (() => {
    const config = require('./config');
    return config.env === 'development' ? 'debug' : 'info';
  })(),
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    enumerateErrorFormat(),
    (() => {
      const config = require('./config');
      return config.env === 'development' ? winston.format.colorize() : winston.format.uncolorize();
    })(),
    winston.format.splat(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
      return `[${timestamp}] ${level}: ${message}${metaStr}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error'],
    }),
  ],
});

// Helper function to sanitize log inputs
const sanitizeLogInput = (input) => {
  if (typeof input !== 'string') {
    return String(input);
  }
  // Remove or replace potentially dangerous characters
  return input.replace(/[\r\n\t]/g, '_').replace(/[\x00-\x1f\x7f-\x9f]/g, '');
};

// Export sanitizeLogInput for use in other modules
const sanitizeForLog = sanitizeLogInput;

// Helper functions for structured logging
logger.logControllerStart = (controllerName, methodName, params = {}) => {
  const sanitizedController = sanitizeLogInput(controllerName);
  const sanitizedMethod = sanitizeLogInput(methodName);
  logger.info(`[CONTROLLER] ${sanitizedController}.${sanitizedMethod} - START`, { params });
};

logger.logControllerEnd = (controllerName, methodName, result = null) => {
  const sanitizedController = sanitizeLogInput(controllerName);
  const sanitizedMethod = sanitizeLogInput(methodName);
  logger.info(`[CONTROLLER] ${sanitizedController}.${sanitizedMethod} - END`, { 
    resultType: result ? typeof result : 'null',
    hasData: !!result 
  });
};

logger.logServiceStart = (serviceName, methodName, params = {}) => {
  const sanitizedService = sanitizeLogInput(serviceName);
  const sanitizedMethod = sanitizeLogInput(methodName);
  logger.info(`[SERVICE] ${sanitizedService}.${sanitizedMethod} - START`, { params });
};

logger.logServiceEnd = (serviceName, methodName, result = null) => {
  const sanitizedService = sanitizeLogInput(serviceName);
  const sanitizedMethod = sanitizeLogInput(methodName);
  logger.info(`[SERVICE] ${sanitizedService}.${sanitizedMethod} - END`, { 
    resultType: result ? typeof result : 'null',
    hasData: !!result 
  });
};

logger.logMiddleware = (middlewareName, action, data = {}) => {
  const sanitizedMiddleware = sanitizeLogInput(middlewareName);
  const sanitizedAction = sanitizeLogInput(action);
  logger.info(`[MIDDLEWARE] ${sanitizedMiddleware} - ${sanitizedAction}`, data);
};

module.exports = logger;
module.exports.sanitizeForLog = sanitizeForLog;

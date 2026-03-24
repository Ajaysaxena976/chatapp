const logger = require('../config/logger');
const { sanitizeForLog } = logger;

const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  logger.info('Request received', {
    method: sanitizeForLog(String(req.method)),
    url: sanitizeForLog(String(req.originalUrl)),
    ip: sanitizeForLog(String(req.ip)),
    userAgent: sanitizeForLog(String(req.get('User-Agent'))),
    timestamp: sanitizeForLog(new Date().toISOString())
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    
    logger.info('Request completed', {
      method: sanitizeForLog(req.method),
      url: sanitizeForLog(req.originalUrl),
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
    
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

module.exports = requestLogger;
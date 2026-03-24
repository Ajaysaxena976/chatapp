const logger = require('../config/logger');
const { sanitizeForLog } = logger;

const apiLogger = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;
  const userAgent = req.get('User-Agent');
  
  // Log API request start
  logger.info('[API] Request started', {
    method: sanitizeForLog(method),
    url: sanitizeForLog(originalUrl),
    ip: sanitizeForLog(ip),
    userAgent: sanitizeForLog(userAgent),
    userId: req.user?.id || 'anonymous',
    timestamp: new Date().toISOString()
  });

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(body) {
    const duration = Date.now() - start;
    
    // Log API response
    logger.info('[API] Request completed', {
      method: sanitizeForLog(method),
      url: sanitizeForLog(originalUrl),
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id || 'anonymous',
      responseSize: JSON.stringify(body).length,
      success: res.statusCode < 400,
      timestamp: new Date().toISOString()
    });

    // Performance warning for slow requests
    if (duration > 5000) {
      logger.warn('[API] Slow request detected', {
        method: sanitizeForLog(method),
        url: sanitizeForLog(originalUrl),
        duration: `${duration}ms`,
        userId: req.user?.id || 'anonymous'
      });
    }

    return originalJson.call(this, body);
  };

  next();
};

module.exports = apiLogger;
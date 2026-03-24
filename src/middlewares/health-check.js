const mongoose = require('mongoose');
const httpStatus = require('http-status');
const ResponseHandler = require('../utils/response-handler');

const healthCheck = async (req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    status: 'OK',
    services: {
      database: 'OK',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
      }
    }
  };

  try {
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      health.services.database = 'DISCONNECTED';
      health.status = 'DEGRADED';
    }
  } catch (error) {
    health.services.database = 'ERROR';
    health.status = 'DOWN';
  }

  const statusCode = health.status === 'OK' ? httpStatus.OK : httpStatus.SERVICE_UNAVAILABLE;
  return ResponseHandler.success(res, health, 'Health check completed', statusCode);
};

module.exports = healthCheck;
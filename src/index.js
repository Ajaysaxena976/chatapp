const mongoose = require('mongoose');
const http = require('http');            
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const { initSocket } = require('./socket');

let server;

mongoose
  .connect(process.env.MONGODB_URL, config.mongoose.options)
  .then(() => {
    logger.info('Connected to MongoDB');

    // ✅ Create HTTP server from express app
    server = http.createServer(app);

    // ✅ Initialize Socket.IO with the SAME server
    initSocket(server);

    // ✅ Start listening
    server.listen(config.port, () => {
      logger.info(`Listening to port ${config.port}`);
    });
  })
  .catch((err) => {
    logger.error('MongoDB connection failed', err);
    process.exit(1);
  });


// =======================
// Graceful shutdown
// =======================

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});

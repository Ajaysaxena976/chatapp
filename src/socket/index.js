const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const logger = require("../config/logger");
const registerChathandlers = require('./chat.socket');

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*", // restrict in prod
      methods: ["GET", "POST"]
    }
  });

  //  AUTH MIDDLEWARE
 io.use((socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||          // future-proof
      socket.handshake.query?.token;            // 👈 TEST CLIENT SUPPORT

    if (!token) {
      return next(new Error("NO_TOKEN"));
    }

    const payload = jwt.verify(token, config.jwt.secret);

    socket.user = {
      id: payload.sub
    };

    next();
  } catch (err) {
    next(new Error("INVALID_TOKEN"));
  }
});



  io.on("connection", (socket) => {
    logger.info("Socket connected", { userId: socket.user.id });

    registerChathandlers(io, socket);

    socket.on("disconnect", () => {
      logger.info("Socket disconnected", { userId: socket.user.id });
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

module.exports = {
  initSocket,
  getIO
};

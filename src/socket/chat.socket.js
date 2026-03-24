const mongoose = require('mongoose');
const Match = require('../models/matching.model');
const logger = require('../config/logger');

const registerChatHandlers = (io, socket) => {

  socket.on('join_match', async ({ matchId }) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(matchId)) {
        return socket.emit("error", "Invalid matchId");
      }

      const match = await Match.findOne({
        _id: matchId,
        isActive: true,
        users: socket.user.id
      });

      if (!match) {
        return socket.emit("error", "Chat not allowed");
      }

      socket.join(matchId);

      logger.info("User joined match room", {
        userId: socket.user.id,
        matchId
      });

      socket.emit("joined_match", { matchId });

    } catch (error) {
      logger.error("Join match error", error);
      socket.emit("error", "Failed to join chat");
    }
  });
};


module.exports = registerChatHandlers;

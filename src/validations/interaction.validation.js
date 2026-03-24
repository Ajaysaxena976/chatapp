const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const recordInteraction = {
    body: Joi.object().keys({
      targetUserId : Joi.string().required().custom(objectId), 
      action : Joi.string().required().valid('like', 'pass', 'dislike'),
      timeSpentViewing : Joi.number().min(1).required(),
      swipeVelocity : Joi.number().min(1).required(),
      dateDay : Joi.string().required().custom(objectId),
    }),
};

const getUserInteractionHistory = {
    query : Joi.object().keys({
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
    }),
}

const getReceivedInteractions = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(20),
  sortBy: Joi.string().optional().default('createdAt:desc'),
  action: Joi.string().valid('pass', 'like', 'dislike').optional(),
});

module.exports = {
    recordInteraction,
    getUserInteractionHistory,
    getReceivedInteractions
};
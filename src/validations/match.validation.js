const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const getMatches = {
  query: Joi.object().keys({
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const deleteMatch = {
  params: Joi.object().keys({
    matchId: Joi.string().required().custom(objectId),
  }),
};

module.exports = {
  getMatches,
  deleteMatch,
};

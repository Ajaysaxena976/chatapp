const Joi = require('joi');
const { objectId } = require('./custom.validation');

const addPets = {
    body: Joi.object().keys({
        name: Joi.string().required(),
    }),
};

const createReligion = {
    body: Joi.object().keys({
        name: Joi.string().required(),
    }),
};

const createEthnicity = {
    body: Joi.object().keys({
        name: Joi.string().required(),
    }),
};
module.exports = {
    addPets,
    createReligion,
    createEthnicity
}
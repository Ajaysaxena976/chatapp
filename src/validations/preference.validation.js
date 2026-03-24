const Joi = require('joi');
const { password, objectId } = require('./custom.validation');
const { max } = require('moment');

const updatePrefernce = {
    body: Joi.object().keys({
        general_filter: Joi.object().keys({
            interested_in: Joi.object().keys({
                interests: Joi.array().items(Joi.string().custom(objectId)).optional(),
                isImportant: Joi.boolean().optional()
            }).optional(),
            dates_days: Joi.array().items(Joi.string().custom(objectId)).optional(),

            looking_for: Joi.object().keys({
                looking: Joi.array().items(Joi.string().custom(objectId)).optional(),
                isImportant: Joi.boolean().optional()
            }).optional(),
            currentlocation: Joi.alternatives().try(
                Joi.object({
                    address: Joi.string().allow('').optional(),
                    lat: Joi.number().min(-90).max(90).required(),
                    lon: Joi.number().min(-180).max(180).required(),
                }).required(),

                Joi.valid(null),        // explicit null
                Joi.valid(''),          // empty string
                Joi.object().length(0)  // empty object {}
            ).optional(),

            hometown: Joi.alternatives().try(
                Joi.object({
                    address: Joi.string().allow('').optional(),
                    lat: Joi.number().min(-90).max(90).required(),
                    lon: Joi.number().min(-180).max(180).required(),
                }),

                Joi.valid(null),
                Joi.valid(''),
                Joi.object().length(0)
            ).optional(),
            age: Joi.object().keys({
                min: Joi.number().integer().min(1).max(100).optional(),
                max: Joi.number().integer().min(1).max(100).optional(),
                opt_run_out: Joi.boolean().optional()
            }).optional(),
            distance: Joi.object().keys({
                value: Joi.number().integer().min(1).max(100).optional(),
                opt_run_out: Joi.boolean().optional()
            }).optional(),
        }).optional(),
        advance_filter: Joi.object().keys({
            height: Joi.object().keys({
                min: Joi.number().integer().min(1).optional(),
                max: Joi.number().integer().min(1).optional(),
                unit: Joi.string().valid("cm", "ft").optional(),
                isImportant: Joi.boolean().optional()
            }).optional(),
            exercise: Joi.object().keys({
                exercises: Joi.array().items(Joi.string().custom(objectId)).optional(),
                isImportant: Joi.boolean().optional()
            }).optional(),
            diet: Joi.object().keys({
                diets: Joi.array().items(Joi.string().custom(objectId)).optional(),
                isImportant: Joi.boolean().optional()
            }).optional(),
            drink: Joi.object().keys({
                drinks: Joi.array().items(Joi.string().custom(objectId)).optional(),
                isImportant: Joi.boolean().optional()
            }).optional(),
            smoke: Joi.object().keys({
                smokings: Joi.array().items(Joi.string().custom(objectId)).optional(),
                isImportant: Joi.boolean().optional()
            }).optional(),
            religion: Joi.object().keys({
                religions: Joi.array().items(Joi.string().custom(objectId)).optional(),
                isImportant: Joi.boolean().optional()
            }).optional(),
            ethnicity: Joi.object().keys({
                ethnicities: Joi.array().items(Joi.string().custom(objectId)).optional(),
                isImportant: Joi.boolean().optional()
            }).optional(),
            cultural_background: Joi.object().keys({
                cultural_backgrounds: Joi.array().items(Joi.string().custom(objectId)).optional(),
                isImportant: Joi.boolean().optional()
            }).optional(),
            education_level: Joi.object().keys({
                education_levels: Joi.array().items(Joi.string().custom(objectId)).optional(),
                isImportant: Joi.boolean().optional()
            }).optional(),
            family_plan: Joi.object().keys({
                family_plans: Joi.array().items(Joi.string().custom(objectId)).optional(),
                isImportant: Joi.boolean().optional()
            }).optional(),
            kid: Joi.object().keys({
                kids: Joi.array().items(Joi.string().custom(objectId)).optional(),
                isImportant: Joi.boolean().optional()
            }).optional(),
            pets: Joi.object().keys({
                pets: Joi.array().items(Joi.string().custom(objectId)).optional(),
                isImportant: Joi.boolean().optional()
            }).optional(),
            zodiac: Joi.object().keys({
                zodiacs: Joi.array().items(Joi.string().custom(objectId)).optional(),
                isImportant: Joi.boolean().optional()
            }).optional(),
            languages: Joi.object().keys({
                languages: Joi.array().items(Joi.string().custom(objectId)).optional(),
                isImportant: Joi.boolean().optional()
            }).optional(),
            political: Joi.object().keys({
                politics: Joi.array().items(Joi.string().custom(objectId)).optional(),
                isImportant: Joi.boolean().optional()
            }).optional(),
        }).optional(),
    }).optional(),
};

module.exports = {
    updatePrefernce
};

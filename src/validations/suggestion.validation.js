const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

/**
 * Reusable Advanced Filter Schema
 * - Height is ALWAYS inches
 * - No unit allowed
 * - No advance_filter.isImportant allowed
 */
const advanceFilterSchema = Joi.object({
  height: Joi.object({
    min: Joi.number().integer().min(1).optional(), // inches
    max: Joi.number().integer().min(1).optional(), // inches
    isImportant: Joi.boolean().optional()
  }).optional(),

  exercise: Joi.object({
    exercises: Joi.array().items(Joi.string()).optional(),
    isImportant: Joi.boolean().optional()
  }).optional(),

  diet: Joi.object({
    diets: Joi.array().items(Joi.string()).optional(),
    isImportant: Joi.boolean().optional()
  }).optional(),

  drink: Joi.object({
    drinks: Joi.array().items(Joi.string()).optional(),
    isImportant: Joi.boolean().optional()
  }).optional(),

  smoke: Joi.object({
    smokings: Joi.array().items(Joi.string()).optional(),
    isImportant: Joi.boolean().optional()
  }).optional(),

  religion: Joi.object({
    religions: Joi.array().items(Joi.string()).optional(),
    isImportant: Joi.boolean().optional()
  }).optional(),

  ethnicity: Joi.object({
    ethnicities: Joi.array().items(Joi.string()).optional(),
    isImportant: Joi.boolean().optional()
  }).optional(),

  cultural_background: Joi.object({
    cultural_backgrounds: Joi.array().items(Joi.string()).optional(),
    isImportant: Joi.boolean().optional()
  }).optional(),

  education_level: Joi.object({
    education_levels: Joi.array().items(Joi.string()).optional(),
    isImportant: Joi.boolean().optional()
  }).optional(),

  family_plan: Joi.object({
    family_plans: Joi.array().items(Joi.string()).optional(),
    isImportant: Joi.boolean().optional()
  }).optional(),

  kid: Joi.object({
    kids: Joi.array().items(Joi.string()).optional(),
    isImportant: Joi.boolean().optional()
  }).optional(),

  pets: Joi.object({
    pets: Joi.array().items(Joi.string()).optional(),
    isImportant: Joi.boolean().optional()
  }).optional(),

  zodiac: Joi.object({
    zodiacs: Joi.array().items(Joi.string()).optional(),
    isImportant: Joi.boolean().optional()
  }).optional(),

  languages: Joi.object({
    languages: Joi.array().items(Joi.string()).optional(),
    isImportant: Joi.boolean().optional()
  }).optional(),

  political: Joi.object({
    politics: Joi.array().items(Joi.string()).optional(),
    isImportant: Joi.boolean().optional()
  }).optional()
}).unknown(false); // ❌ blocks advance_filter.isImportant


const refreshSuggestions = {
  body: Joi.object().keys({
    suggestion: Joi.string().required(),
  }),
};


const getSuggestions = {
  query: Joi.object().keys({
    refresh: Joi.boolean().required(),
    limit: Joi.number().integer().min(1).default(10),
    page: Joi.number().min(1).default(1),
    dateDay: Joi.alternatives().try(
      Joi.string(),
      Joi.array().items(Joi.string())
    ).optional()
  }),

  body: Joi.object({
    advance_filter: advanceFilterSchema.optional()
  }).optional()
};


const getSuggestionsByPreferences = {
  query: Joi.object().keys({
    limit: Joi.number().integer().min(1).max(50).default(10),
    page: Joi.number().integer().min(1).default(1),
    dateDay: Joi.string().allow('', null).optional(),
    refresh: Joi.boolean().optional().default(false)
  }),
  body: Joi.object({
    advance_filter: Joi.object().optional()
  }).optional()
};



module.exports = {
  refreshSuggestions,
  getSuggestions,
  getSuggestionsByPreferences
};

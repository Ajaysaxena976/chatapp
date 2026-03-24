const Joi = require('joi');
const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/api-error');
const logger = require('../config/logger');

const validate = (schema) => (req, res, next) => {
  logger.logMiddleware('Validate', 'START', { 
    url: req.originalUrl, 
    method: req.method,
    schemaKeys: Object.keys(schema)
  });
  
  const validSchema = pick(schema, ['params', 'query', 'body']);
  const object = pick(req, Object.keys(validSchema));
  const { value, error } = Joi.object(validSchema)
    .prefs({ errors: { label: 'key' }, abortEarly: false })
    .validate(object);

  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(', ');
    logger.warn('[MIDDLEWARE] Validate - Validation failed', { 
      url: req.originalUrl,
      method: req.method,
      errors: error.details.map(d => ({ field: d.path.join('.'), message: d.message }))
    });
    return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
  }
  
  Object.assign(req, value);
  logger.logMiddleware('Validate', 'SUCCESS', { url: req.originalUrl });
  return next();
};

module.exports = validate;

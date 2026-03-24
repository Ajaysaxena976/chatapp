const Joi = require('joi');
const httpStatus = require('http-status');
const ErrorFactory = require('../utils/error-factory');
const pick = require('../utils/pick');

const validate = (schema) => (req, res, next) => {
  const validSchema = pick(schema, ['params', 'query', 'body']);
  const object = pick(req, Object.keys(validSchema));
  
  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: 'key' }, abortEarly: false })
    .validate(object);

  if (error) {
    const errorDetails = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value
    }));
    
    const validationError = ErrorFactory.createValidationError(
      'Validation failed',
      errorDetails
    );
    
    return next(validationError);
  }
  
  Object.assign(req, value);
  return next();
};

module.exports = validate;
const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createUserDateDays = {
  body: Joi.object().keys({
    dates_days: Joi.array()
      .items(Joi.string().required())
      .min(1)
      .required(),
  }),
};


const updateProfile = {
  body: Joi.object().keys({
    name: Joi.string().optional(),
    dates_days: Joi.array().items(Joi.string().custom(objectId)).optional(),
    date_of_birth: Joi.date().optional(),
    gender: Joi.string().custom(objectId).optional(),
    gender_visibility: Joi.boolean().optional(),
    interested_in: Joi.string().allow('').custom(objectId).optional(),
    looking_for: Joi.array()
      .items(Joi.string().custom(objectId))
      .optional()
      .empty(''),
    looking_for_visibility: Joi.boolean().optional(),
    work : Joi.string().allow('').custom(objectId).optional(),
    work_visibility: Joi.boolean().optional(),
    about_yourself: Joi.string().optional(),
    idea_of_great_date: Joi.string().optional().allow(''),
    favorite_dates: Joi.array()
        .items(Joi.string().custom(objectId))
        .optional()
        .empty('')
        ,

    main_img: Joi.string().uri().optional(),
    images: Joi.array().items(Joi.string().uri()).optional(),
    social_links: Joi.array()
        .items(
          Joi.object({
            platform: Joi.string().allow('').optional(),
            url: Joi.string().uri().allow('').optional(),
            username: Joi.string().allow('').optional(),
            isConnected: Joi.boolean().optional()
          })
        )
        .optional()
        .empty('')
      ,
    education: Joi.object()
      .keys({
        Institute_name: Joi.string().optional().allow(''),
        major_degree: Joi.string().optional().allow(''),
        graduation_year: Joi.number().integer().min(1930).max(2100).optional().allow('')
      })
      .optional(),
    education_visibility: Joi.boolean().optional(),
    location: Joi.object()
      .keys({
        address: Joi.string().optional().allow(''),
        type: Joi.string().valid('Point').optional().allow(''),
        coordinates: Joi.array()
          .ordered(
            Joi.number().min(-180).max(180), // lng
            Joi.number().min(-90).max(90)    // lat
          )
          .optional().allow('')
      })
      .optional(),

    location_visibility: Joi.boolean().optional(),
    hometown: Joi.object()
      .keys({
        address: Joi.string().optional().allow(''),
        lat: Joi.number().min(-90).max(90).optional().allow(''),
        lng: Joi.number().min(-180).max(180).optional().allow('') 
      })
      .optional(),
    hometown_visibility: Joi.boolean().optional(),
    occupation: Joi.object()
      .keys({
        company_name: Joi.string().optional().allow(''),
        job_title: Joi.string().optional().allow('')
      })
      .optional()
      .empty('')
      ,
    occupation_visibility: Joi.boolean().optional(),
    height: Joi.string().optional().allow(''),
    height_unit: Joi.string().valid('cm', 'ft').optional().allow(''),
    height_visibility: Joi.boolean().optional(),
    exercise: Joi.string().allow('').custom(objectId).optional(),
    exercise_visibility: Joi.boolean().optional(),
    diet: Joi.string().allow('').custom(objectId).optional(),
    diet_visibility: Joi.boolean().optional(),
    drink: Joi.string().allow('').custom(objectId).optional(),
    drink_visibility: Joi.boolean().optional(),
    smoking: Joi.string().allow('').custom(objectId).optional(),
    smoking_visibility: Joi.boolean().optional(),
    religion: Joi.string().allow('').custom(objectId).optional(),
    religion_visibility: Joi.boolean().optional(),
    ethnicity: Joi.string().allow('').custom(objectId).optional(),
    ethnicity_visibility: Joi.boolean().optional(),
    education_level: Joi.string().allow('').custom(objectId).optional(),
    education_level_visibility: Joi.boolean().optional(),
    cultural_background: Joi.array().items(Joi.string().custom(objectId)).allow('').optional(),
    cultural_background_visibility: Joi.boolean().optional(),
    kids: Joi.string().allow('').custom(objectId).optional(),
    kids_visibility: Joi.boolean().optional(),
    pets: Joi.string().allow('').custom(objectId).optional(),
    pets_visibility: Joi.boolean().optional(),
    zodiac: Joi.string().allow('').custom(objectId).optional(),
    zodiac_visibility: Joi.boolean().optional(),
    languages: Joi.array()
      .items(Joi.string().custom(objectId))
      .optional()
      .empty('')
      ,
    languages_visibility: Joi.boolean().optional(),
    politics: Joi.string().allow('').custom(objectId).optional(),
    politics_visibility: Joi.boolean().optional()
  })
};

const updateProfileImageUrl = {
  body: Joi.object().keys({
    url: Joi.string().uri().required(),
  })
};

module.exports = {
  updateProfile,
  updateProfileImageUrl,
  createUserDateDays
};
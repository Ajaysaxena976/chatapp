const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const userPreferenceSchema = mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    dates_days: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DateDay'
    }],
    interested_in: {
      interests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InterestedIn'
      }]
    },
    looking_for: {
      looking: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LookingFor'
      }],
      isImportant: {
        type: Boolean,
        default: false
      }
    },

    currentlocation: {
      type: {
        type: String,
        enum: ['Point'], // 'location.type' must be 'Point'
        // default: 'Point',
      },
      coordinates: {
        type: [Number], // Array of numbers for [longitude, latitude]
      },
      address: {
        type: String,
        trim: true,
      }
    },

    hometown: {
      type: {
        type: String,
        enum: ['Point'], // 'location.type' must be 'Point'
        // default: 'Point',
      },
      coordinates: {
        type: [Number], // Array of numbers for [longitude, latitude]
      },
      address: {
        type: String,
        trim: true,
      }
    },
    age: {
      min: {
        type: Number,
      },
      max: {
        type: Number,
      },
      opt_run_out: {
        type: Boolean,
        default: false
      }
    },
    distance: {
      value: {
        type: Number,
      },
      opt_run_out: {
        type: Boolean,
        default: false
      }
    },
    height: {
      min: {
        type: Number,
      },
      max: {
        type: Number,
      },
      unit: {
        type: String,
        enum: ['cm', 'ft'],
        default: 'cm'
      },
      isImportant: {
        type: Boolean,
        default: false
      }
    },
    exercise: {
      exercises: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exercise'
      }],
      isImportant: {
        type: Boolean,
        default: false
      }
    },
    diet: {
      diets: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Diet'
      }],
      isImportant: {
        type: Boolean,
        default: false
      }
    },
    drink: {
      drinks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Drink'
      }],
      isImportant: {
        type: Boolean,
        default: false
      }
    },
    smoke: {
      smokings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Smoking'
      }],
      isImportant: {
        type: Boolean,
        default: false
      }
    },
    religion: {
      religions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Religion'
      }],
      isImportant: {
        type: Boolean,
        default: false
      }
    },
    ethnicity: {
      ethnicities: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ethnicity'
      }],
      isImportant: {
        type: Boolean,
        default: false
      }
    },
    cultural_background: {
      cultural_backgrounds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CulturalBackground'
      }],
      isImportant: {
        type: Boolean,
        default: false
      }
    },
    education_level: {
      education_levels: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EducationLevel'
      }],
      isImportant: {
        type: Boolean,
        default: false
      }
    },
    family_plan: {
      family_plans: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FamilyPlan'
      }],
      isImportant: {
        type: Boolean,
        default: false
      }
    },
    kid: {
      kids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Kids'
      }],
      isImportant: {
        type: Boolean,
        default: false
      }
    },
    pets: {
      pets: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pets'
      }],
      isImportant: {
        type: Boolean,
        default: false
      }
    },
    zodiac: {
      zodiacs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Zodiac'
      }],
      isImportant: {
        type: Boolean,
        default: false
      }
    },
    languages: {
      languages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Language'
      }],
      isImportant: {
        type: Boolean,
        default: false
      }
    },
    political: {
      politics: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Politics'
      }],
      isImportant: {
        type: Boolean,
        default: false
      }
    }
  },
  {
    timestamps: true,
  }
);

userPreferenceSchema.plugin(toJSON);
userPreferenceSchema.plugin(paginate);
userPreferenceSchema.index({ currentlocation: '2dsphere' });
userPreferenceSchema.index({ hometown: '2dsphere' });

/**
 * @typedef UserPreference
 */
const UserPreference = mongoose.model('UserPreference', userPreferenceSchema);

module.exports = UserPreference;

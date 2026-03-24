const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const userProfileSchema = mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            //   unique: true,
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        dates_days: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DateDay'
        }],
        date_of_birth: {
            type: Date,
        },
        gender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Gender'
        },
        gender_visibility: {
            type: Boolean,
            default: true
        },
        interested_in: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'InterestedIn'
        },
        looking_for: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'LookingFor'
        }],
        looking_for_visibility: {
            type: Boolean,
            default: true
        },
        work: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Work'
        },
        work_visibility: {
            type: Boolean,
            default: true
        },
        about_yourself: {
            type: String,
            trim: true
        },
        idea_of_great_date: {
            type: String,
            trim: true
        },
        favorite_dates: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DateActivity'
        }],
        main_img: {
            type: String,
            trim: true
        },
        images: {
            type: Array,
            default: []
        },
        social_links: {
            type: [
                {
                    platform: { type: String, required: true },
                    url: { type: String, required: true },
                    username: { type: String },
                    isConnected: { type: Boolean, default: false }
                }
            ],
            default: []
        },
        education: {
            Institute_name: {
                type: String,
                trim: true
            },
            major_degree: {
                type: String,
                trim: true
            },
            graduation_year: {
                type: Number,
                min: 1900,
                max: 2100
            }
        },
        education_visibility: {
            type: Boolean,
            default: true
        },
        education_level: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'EducationLevel'
        },
        education_level_visibility: {
            type: Boolean,
            default: true
        },
        cultural_background: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CulturalBackground'
        }],
        cultural_background_visibility: {
            type: Boolean,
            default: true
        },
        location: {
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
        location_visibility: {
            type: Boolean,
            default: true
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
        hometown_visibility: {
            type: Boolean,
            default: true
        },
        occupation: {
            company_name: {
                type: String,
                trim: true
            },
            job_title: {
                type: String,
                trim: true
            }
        },
        occupation_visibility: {
            type: Boolean,
            default: true
        },
        height: {
            type: String,
        },
        height_unit: {
            type: String,
            enum: ['cm', 'ft'],
            default: 'cm'
        },
        height_visibility: {
            type: Boolean,
            default: true
        },
        exercise: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Exercise'
        },
        exercise_visibility: {
            type: Boolean,
            default: true
        },
        diet: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Diet'
        },
        diet_visibility: {
            type: Boolean,
            default: true
        },
        drink: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Drink'
        },
        drink_visibility: {
            type: Boolean,
            default: true
        },
        smoking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Smoking'
        },
        smoking_visibility: {
            type: Boolean,
            default: true
        },
        religion: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Religion'
        },
        religion_visibility: {
            type: Boolean,
            default: true
        },
        ethnicity: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ethnicity'
        },
        ethnicity_visibility: {
            type: Boolean,
            default: true
        },
        family_plan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'FamilyPlan'
        },
        family_plan_visibility: {
            type: Boolean,
            default: true
        },
        kids: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Kids'
        },
        kids_visibility: {
            type: Boolean,
            default: true
        },
        pets: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Pets'
        },
        pets_visibility: {
            type: Boolean,
            default: true
        },
        zodiac: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Zodiac'
        },
        zodiac_visibility: {
            type: Boolean,
            default: true
        },
        languages: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Language'
        }],
        languages_visibility: {
            type: Boolean,
            default: true
        },
        politics: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Politics'
        },
        politics_visibility: {
            type: Boolean,
            default: true
        },
        // -- Matching Engine Cache --
        activity_segment: {
            type: String,
            enum: ['cold', 'normal', 'active'],
            default: 'cold'
        },
        alpha_value: {
            type: Number,
            default: 0.75
        },
        total_exposures_count: {
            type: Number,
            default: 0
        }


    },
    {
        timestamps: true,
    }
);

userProfileSchema.plugin(toJSON);
userProfileSchema.plugin(paginate);
userProfileSchema.index({ location: '2dsphere' });
userProfileSchema.index({ hometown: '2dsphere' });

/**
 * @typedef UserProfile
 */
const UserProfile = mongoose.model('UserProfile', userProfileSchema);

module.exports = UserProfile;

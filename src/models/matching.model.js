const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const MatchSchema = new mongoose.Schema({
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        validate: {
            validator: function (v) { return this.users.length === 2; },
            message: 'Match must have exactly 2 users'
        }
    }],
    matchedAt: {
        type: Date,
        default: Date.now
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },
    lastMessageAt: Date,
    score: {
         type: Number,
         min: 0,
         max: 100
    },
    matchingFactors: {
        locationScore: {
            type: Number,
            min: 0,
            max: 100
        },
        ageScore: {
            type: Number,
            min: 0,
            max: 100
        },
        interestsScore: {
            type: Number,
            min: 0,
            max: 100
        },
        lifestyleScore: {
            type: Number,
            min: 0,
            max: 100
        },
        activityScore: {
            type: Number,
            min: 0,
            max: 100
        }
    }
}, {
    timestamps: true
});

MatchSchema.index({ users: 1 });
MatchSchema.index({ matchedAt: -1 });
MatchSchema.index({ isActive: 1 });

MatchSchema.plugin(toJSON);

const Match = mongoose.model('Match', MatchSchema);

module.exports = Match;
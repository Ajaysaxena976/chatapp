const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const InteractionSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    targetUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    action: {
        type: String,
        enum: ['like', 'pass', 'dislike'],
        required: true,
        index: true  // Add index for analytics
    },
    date_days: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DateDay',
        required: true
    },
}, {
    timestamps: true
});

// Compound indexes for performance
InteractionSchema.index({ userId: 1, targetUserId: 1 }, { unique: true });
InteractionSchema.index({ userId: 1, createdAt: -1 }); // User's interaction history
InteractionSchema.index({ targetUserId: 1, action: 1, createdAt: -1 }); // Who liked/passed this user
InteractionSchema.index({ action: 1, createdAt: -1 }); // Action analytics
InteractionSchema.index({ userId: 1, action: 1, createdAt: -1 }); // User behavior patterns

// TTL index - auto-delete after 2 years for privacy
InteractionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 63072000 });

InteractionSchema.plugin(toJSON);

const Interaction = mongoose.model('Interaction', InteractionSchema);

module.exports = Interaction;

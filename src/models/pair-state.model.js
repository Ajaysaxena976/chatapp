const mongoose = require('mongoose');

const pairStateSchema = mongoose.Schema(
    {
        viewer_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        candidate_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        // -- Interest / Recency --
        last_seen_at: {
            type: Date,
            index: true,
        },

        // -- Repetition Rules --
        exposures_this_week: {
            type: Number,
            default: 0,
        },
        consecutive_exposures_no_swipe: {
            type: Number,
            default: 0,
        },

        // -- Interaction State --
        last_swipe: {
            type: String, // 'like', 'pass', 'none'
            enum: ['like', 'pass', 'none'],
            default: 'none',
        },
        inbound_like_day: {
            type: Date,
            default: null,
        },
        pass_count: {
            type: Number,
            default: 0,
        },

        // -- Shelving / Cooldowns --
        shelved_until: {
            type: Date,
            default: null,
        },
        cooldown_until: {
            type: Date,
            default: null,
        },

        // -- Metadata --
        week_id: {
            type: String, // e.g., "2024-W08"
            index: true
        },
        was_top_3_yesterday: {
            type: Boolean,
            default: false
        },
        closed_match_at: {
            type: Date,
            default: null
        }

    },
    {
        timestamps: true,
    }
);

// Compound index for fast lookup of specific pair
pairStateSchema.index({ viewer_id: 1, candidate_id: 1 }, { unique: true });

// Index for cleanups
pairStateSchema.index({ week_id: 1 });

const PairState = mongoose.model('PairState', pairStateSchema);

module.exports = PairState;

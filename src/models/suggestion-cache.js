// models/SuggestionCache.js
const { Schema, model } = require('mongoose');

const suggestionSchema = new Schema({
    key: {
        type: String,
        required: true,
        unique: true
    }, // "<userId>_<limit>_<minComp>"
    suggestions: {
        type: Array,
        required: true
    },
    expiresAt: {
        type: Date,
        index: { expires: 0 }
    }        // MongoDB TTL index
});

module.exports = model('SuggestionCache', suggestionSchema);

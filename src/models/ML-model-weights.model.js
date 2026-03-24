const mongoose = require('mongoose');

const modelSchema = new mongoose.Schema({
  weights: {
    type: [Number],
    required: true,
  },
  bias: {
    type: Number,
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const MLModelWeights = mongoose.model('MLModelWeights', modelSchema);

module.exports = MLModelWeights;

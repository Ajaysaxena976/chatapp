const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const interestedInSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  index:{
    type: Number,
    required: true,
    unique: true,
  }
});

interestedInSchema.plugin(toJSON);

const InterestedIn = mongoose.model('InterestedIn', interestedInSchema);

module.exports = InterestedIn;
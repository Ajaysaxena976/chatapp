const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const citySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true
  }
});

citySchema.plugin(toJSON);

const City = mongoose.model('City', citySchema);

module.exports = City;
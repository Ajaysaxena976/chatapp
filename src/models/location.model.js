const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const locationSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  latitude: {
    type: String,
    required: true,
    unique: true,
  },
  longitude: {
    type: String,
    required: true,
    unique: true,
  }
});

locationSchema.plugin(toJSON);

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
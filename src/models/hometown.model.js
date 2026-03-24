const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const hometownSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  latitute: {
    type: String,
    required: true,
  },
  longitude: {
    type: String,
    required: true,
  },
});

hometownSchema.plugin(toJSON);

const Hometown = mongoose.model('Hometown', hometownSchema);

module.exports = Hometown;
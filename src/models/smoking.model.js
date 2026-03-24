const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const smokingSchema = mongoose.Schema({
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

smokingSchema.plugin(toJSON);

const Smoking = mongoose.model('Smoking', smokingSchema);

module.exports = Smoking;
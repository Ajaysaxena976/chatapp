const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const exerciseSchema = mongoose.Schema({
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

exerciseSchema.plugin(toJSON);

const Exercise = mongoose.model('Exercise', exerciseSchema);
module.exports = Exercise;



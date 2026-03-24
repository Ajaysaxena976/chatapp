const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const lookingForSchema = mongoose.Schema({
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

lookingForSchema.plugin(toJSON);

const LookingFor = mongoose.model('LookingFor', lookingForSchema);

module.exports = LookingFor;
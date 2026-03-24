const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const genderSchema = mongoose.Schema({
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

genderSchema.plugin(toJSON);

const Gender = mongoose.model('Gender', genderSchema);

module.exports = Gender;
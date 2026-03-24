const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const educationLevelSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  }
});

educationLevelSchema.plugin(toJSON);

const EducationLevel = mongoose.model('EducationLevel', educationLevelSchema);

module.exports = EducationLevel;
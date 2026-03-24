const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const languageSchema = mongoose.Schema({
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

languageSchema.plugin(toJSON);

const Language = mongoose.model('Language', languageSchema);

module.exports = Language;
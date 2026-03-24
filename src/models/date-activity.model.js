const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const dateActivitySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true
  },
  categoryIndex: {
    type: Number,
    required: true,
  },
  image_url: {
    type: String,
    trim: true
  },
  index:{
    type: Number,
    required: true,
    // unique: true,
  }
});

dateActivitySchema.plugin(toJSON);

const DateActivity = mongoose.model('DateActivity', dateActivitySchema);

module.exports = DateActivity;
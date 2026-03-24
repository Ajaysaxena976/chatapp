const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const dietSchema = mongoose.Schema({
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

dietSchema.plugin(toJSON);

const Diet = mongoose.model('Diet', dietSchema);

module.exports = Diet;
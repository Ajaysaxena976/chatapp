const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const kidsSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  main_title: {
    type: String,
    required: true,
  },
  index:{
    type: Number,
    required: true,
    unique: true,
  }
});

kidsSchema.plugin(toJSON);

const Kids = mongoose.model('Kids', kidsSchema);

module.exports = Kids;
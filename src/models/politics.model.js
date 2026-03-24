const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const politicsSchema = mongoose.Schema({
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

politicsSchema.plugin(toJSON);

const Politics = mongoose.model('Politics', politicsSchema);

module.exports = Politics;
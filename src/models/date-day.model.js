const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const dateDaySchema = mongoose.Schema({
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

dateDaySchema.plugin(toJSON);

const DateDay = mongoose.model('DateDay', dateDaySchema);

module.exports = DateDay;
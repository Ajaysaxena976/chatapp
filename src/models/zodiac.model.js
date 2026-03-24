const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const zodiacSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  index:{
    type: Number,
    unique: true,
  }
});


zodiacSchema.plugin(toJSON);


const Zodiac = mongoose.model('Zodiac', zodiacSchema);
module.exports = Zodiac;
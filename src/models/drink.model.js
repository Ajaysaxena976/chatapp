const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const drinkSchema = mongoose.Schema({
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

drinkSchema.plugin(toJSON);

const Drink = mongoose.model('Drink', drinkSchema);

module.exports = Drink;
const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const countrySchema = mongoose.Schema({
  alpha2: {
    type: String,
    required: true,
    unique: true,
  },
  alpha3: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  country_code: {
    type: String,
    required: true,
  },
  flag: {
    type: String,
    required: true,
  },
});

countrySchema.plugin(toJSON);

const Country = mongoose.model('Country', countrySchema);

module.exports = Country;
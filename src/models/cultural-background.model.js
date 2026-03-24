const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const culturalBackgroundSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  }
});
culturalBackgroundSchema.plugin(toJSON);
const CulturalBackground = mongoose.model('CulturalBackground', culturalBackgroundSchema);
module.exports = CulturalBackground;
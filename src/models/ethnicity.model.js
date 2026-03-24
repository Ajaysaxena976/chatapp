const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const ethnicitySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  index: {
    type: Number,
    unique: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
});

ethnicitySchema.plugin(toJSON);

// Auto-increment index before saving
ethnicitySchema.pre('save', async function (next) {
  if (!this.isNew) return next();

  const lastIndex = await this.constructor.findOne({}, {}, { sort: { index: -1 } });
  this.index = lastIndex ? lastIndex.index + 1 : 1;

  next();
});

const Ethnicity = mongoose.model('Ethnicity', ethnicitySchema);
module.exports = Ethnicity;

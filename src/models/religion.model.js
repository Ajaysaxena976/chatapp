const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const religionSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  index:{
    type: Number,
    // required: true,
    unique: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
});

religionSchema.plugin(toJSON);

religionSchema.pre('save', async function (next) {
  if (!this.isNew) return next();

  const lastReligion = await this.constructor.findOne({}, {}, { sort: { index: -1 } });
  this.index = lastReligion ? lastReligion.index + 1 : 1;

  next();
});

const Religion = mongoose.model('Religion', religionSchema);

module.exports = Religion;
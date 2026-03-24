const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const petsSchema = mongoose.Schema({
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

petsSchema.plugin(toJSON);

petsSchema.pre('save', async function (next) {
  if (!this.isNew) return next();
const lastPet = await this.constructor.findOne({}, {}, { sort: { index: -1 } });
  this.index = lastPet ? lastPet.index + 1 : 1;
  next();
});
const Pets = mongoose.model('Pets', petsSchema);

module.exports = Pets;
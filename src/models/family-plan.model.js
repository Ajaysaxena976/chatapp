const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const familyPlanSchema = mongoose.Schema({
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

familyPlanSchema.plugin(toJSON);

const FamilyPlan = mongoose.model('FamilyPlan', familyPlanSchema);

module.exports = FamilyPlan;
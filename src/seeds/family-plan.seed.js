const { FamilyPlan } = require('../models');

const familyPlanSeeds = [
  { name: "Don't want Kids", index: 1 },
  { name: 'Open to Having Kids', index: 2 },
  { name: 'Want Kids in Future', index: 3 },
  { name: 'Not sure yet', index: 4 },
];

const seedFamilyPlan = async () => {
  try {
    const count = await FamilyPlan.countDocuments().catch((e) => {console.log(e)});
    if (count === 0) {
      await FamilyPlan.insertMany(familyPlanSeeds).catch((e) => {console.log(e)});
      console.log('FamilyPlan seeds inserted successfully');
    }
  } catch (error) {
    console.error('Error seeding FamilyPlan:', error);
  }
};

module.exports = seedFamilyPlan;
const { LookingFor } = require('../models');

const lookingForSeeds = [
  { name: 'Fun & casual' , index: 1},
  { name: 'Long-term relationship' , index: 2},
  { name: 'Short-term relationship' , index: 3},
  { name: 'New friends' , index: 4},
  { name: 'Open to anything' , index: 5},
];

const seedLookingFor = async () => {
  try {
    const count = await LookingFor.countDocuments().catch((e) => {console.log(e)});
    if (count === 0) {
      await LookingFor.insertMany(lookingForSeeds).catch((e) => {console.log(e)});
      console.log('LookingFor seeds inserted successfully');
    }
  } catch (error) {
    console.error('Error seeding LookingFor:', error);
  }
};

module.exports = seedLookingFor;
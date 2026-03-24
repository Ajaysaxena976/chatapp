const { Smoking } = require('../models');

const smokingSeeds = [
  { name: 'Occasionally' , index: 1},
  { name: 'Socially' , index: 2},
  { name: 'Regularly' , index: 3},
  { name: 'Trying to Quit' , index: 4},
  { name: 'Never' , index: 5},
];

const seedSmoking = async () => {
  try {
    const count = await Smoking.countDocuments().catch((e) => {console.log(e)});
    if (count === 0) {
      await Smoking.insertMany(smokingSeeds).catch((e) => {console.log(e)});
      console.log('Smoking seeds inserted successfully');
    }
  } catch (error) {
    console.error('Error seeding Smoking:', error);
  }
};

module.exports = seedSmoking;
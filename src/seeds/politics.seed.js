const { Politics } = require('../models');

const politicsSeeds = [
  { name: 'Apolitical' , index: 1},
  { name: 'Moderate' , index: 2},
  { name: 'Left' , index: 3},
  { name: 'Right' , index: 4},
  { name: 'Communist' , index: 5},
  { name: 'Socialist' , index: 6},
];

const seedPolitics = async () => {
  try {
    const count = await Politics.countDocuments().catch((e) => {console.log(e)});
    if (count === 0) {
      await Politics.insertMany(politicsSeeds).catch((e) => {console.log(e)});
      console.log('Politics seeds inserted successfully');
    }
  } catch (error) {
    console.error('Error seeding Politics:', error);
  }
};

module.exports = seedPolitics;
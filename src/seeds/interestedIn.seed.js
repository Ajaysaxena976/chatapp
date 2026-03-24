const { InterestedIn } = require('../models');

const interestedInSeeds = [
  { name: 'Men' , index: 1},
  { name: 'Women' , index: 2},
  { name: 'Non - Binary' , index: 3},
  { name: 'All' , index: 4}
];

const seedInterestedIn = async () => {
  try {
    const count = await InterestedIn.countDocuments().catch((e) => {console.log(e)});
    if (count === 0) {
      await InterestedIn.insertMany(interestedInSeeds).catch((e) => {console.log(e)});
      console.log('InterestedIn seeds inserted successfully');
    }
  } catch (error) {
    console.error('Error seeding InterestedIn:', error);
  }
};

module.exports = seedInterestedIn;
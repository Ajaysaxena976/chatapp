const { Kids } = require('../models');

const kidsSeeds = [
  { name: 'No kids' , index: 1},
  { name: 'Have kids and Open to More' , index: 2},
  { name: 'Have kids and not open to more' , index: 3},
];

const seedKids = async () => {
  try {
    const count = await Kids.countDocuments().catch((e) => {console.log(e)});   
    if (count === 0) {
      await Kids.insertMany(kidsSeeds).catch((e) => {console.log(e)});
      console.log('Kids seeds inserted successfully');
    }
  } catch (error) {
    console.error('Error seeding Kids:', error);
  }
};

module.exports = seedKids;
const { Religion } = require('../models');

const religionSeeds = [
  { name: 'Christian' , index: 1},
  { name: 'Muslim' , index: 2},
  { name: 'Hindu' , index: 3},
  { name: 'Buddhist' , index: 4},
  { name: 'Jewish' , index: 5},
  { name: 'Sikh' , index: 6},
  { name: 'Baha\'i' , index: 7},
  { name: 'Jain' , index: 8},
  { name: 'Shinto' , index: 9},
  { name: 'Zoroastrian' , index: 10},
  { name: 'Spiritual' , index: 11},
  { name: 'Spiritual but Not Religious' , index: 12},
  { name: 'Agnostic' , index: 13},
  { name: 'Atheist' , index: 14},
  { name: 'None' , index: 15}

];

const seedReligion = async () => {
  try {
    const count = await Religion.countDocuments().catch((e) => {console.log(e)});
    if (count === 0) {
      await Religion.insertMany(religionSeeds).catch((e) => {console.log(e)});
      console.log('Religion seeds inserted successfully');
    }
  } catch (error) {
    console.error('Error seeding Religion:', error);
  }
};

module.exports = seedReligion;
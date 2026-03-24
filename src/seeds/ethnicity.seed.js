const { Ethnicity } = require('../models');

const ethnicitySeeds = [
  { name: 'White/Caucasian' , index : 1},
  { name: 'Black/African Descent' , index : 2},
  { name: 'Hispanic/Latino' , index : 3},
  { name: 'East Asian' , index : 4},
  { name: 'South Asian' , index : 5},
  { name: 'Middle Eastern' , index : 6},
  { name: 'Native American /Indigenous' , index : 7},
  { name: 'Pacific Islander' , index : 8},
  { name: 'Other' , index : 9},
];

const seedEthnicity = async () => {
  try {
    const count = await Ethnicity.countDocuments().catch((e) => {console.log(e)});
    if (count === 0) {
      await Ethnicity.insertMany(ethnicitySeeds).catch((e) => {console.log(e)});
      console.log('Ethnicity seeds inserted successfully');
    }
  } catch (error) {
    console.error('Error seeding Ethnicity:', error);
  }
};

module.exports = seedEthnicity;
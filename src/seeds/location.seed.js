const { Location } = require('../models');

const locationSeeds = [
  { name: 'New York' },
  { name: 'Los Angeles' },
  { name: 'Chicago' },
  { name: 'Houston' },
  { name: 'Phoenix' },
  { name: 'Philadelphia' },
  { name: 'San Antonio' },
  { name: 'San Diego' },
  { name: 'Dallas' },
  { name: 'San Jose' }
];

const seedLocation = async () => {
  try {
    const count = await Location.countDocuments().catch((e) => {console.log(e)});
    if (count === 0) {
      await Location.insertMany(locationSeeds).catch((e) => {console.log(e)});
      console.log('Location seeds inserted successfully');
    }
  } catch (error) {
    console.error('Error seeding Location:', error);
  }
};

module.exports = seedLocation;
const { Hometown } = require('../models');

const hometownSeeds = [
  { name: 'New York, USA' },
  { name: 'Los Angeles, USA' },
  { name: 'Chicago, USA' },
  { name: 'Houston, USA' },
  { name: 'Phoenix, USA' },
  { name: 'Philadelphia, USA' },
  { name: 'San Antonio, USA' },
  { name: 'San Diego, USA' },
  { name: 'Dallas, USA' },
  { name: 'San Jose, USA' }
];

const seedHometown = async () => {
  try {
    const count = await Hometown.countDocuments().catch((e) => {console.log(e)});
    if (count === 0) {
      await Hometown.insertMany(hometownSeeds).catch((e) => {console.log(e)});
      console.log('Hometown seeds inserted successfully');
    }
  } catch (error) {
    console.error('Error seeding Hometown:', error);
  }
};

module.exports = seedHometown;
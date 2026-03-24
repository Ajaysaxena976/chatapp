const { DateDay } = require('../models');

const dateDaySeeds = [
  { name: 'Monday', index: 1 },
  { name: 'Tuesday', index: 2 },
  { name: 'Wednesday', index: 3 },
  { name: 'Thursday', index: 4 },
  { name: 'Friday', index: 5 },
  { name: 'Saturday', index: 6 },
  { name: 'Sunday', index: 7 }
];

const seedDateDays = async () => {
  try {
    const count = await DateDay.countDocuments().catch((e) => {console.log(e)});
    if (count === 0) {
      await DateDay.insertMany(dateDaySeeds).catch((e) => {console.log(e)});
      console.log('DateDay seeds inserted successfully');
    }
  } catch (error) {
    console.error('Error seeding DateDays:', error);
  }
};

module.exports = seedDateDays;
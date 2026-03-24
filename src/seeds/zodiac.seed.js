const { Zodiac } = require('../models');

const zodiacSeeds = [
  { name: 'Aries', index: 1 },
  { name: 'Taurus', index: 2 },
  { name: 'Gemini', index: 3 },
  { name: 'Cancer', index: 4 },
  { name: 'Leo', index: 5 },
  { name: 'Virgo', index: 6 },
  { name: 'Scorpio', index: 7 },
  { name: 'Sagittarius', index: 8 },
  { name: 'Pisces', index: 9 },
  { name: 'Capricorn', index: 10 },
  { name: 'Libra', index: 11 },
  { name: 'Aquarius', index: 12 },
];

const seedZodiac = async () => {
  try {
    const count = await Zodiac.countDocuments().catch((e) => {console.log(e)});
    if (count === 0) {
      await Zodiac.insertMany(zodiacSeeds).catch((e) => {console.log(e)});
      console.log('Zodiac seeds inserted successfully');
    }
  } catch (error) {
    console.error('Error seeding Zodiac:', error);
  }
};

module.exports = seedZodiac;
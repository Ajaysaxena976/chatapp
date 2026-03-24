const { Work } = require('../models');

const workSeeds = [
  { name: 'Technology', index: 1 },
  { name: 'Healthcare', index: 2 },
  { name: 'Finance', index: 3 },
  { name: 'Education', index: 4 },
  { name: 'Marketing', index: 5 },
  { name: 'Sales', index: 6 },
  { name: 'Engineering', index: 7 },
  { name: 'Design', index: 8 },
  { name: 'Legal', index: 9 },
  { name: 'Consulting', index: 10 },
  { name: 'Media', index: 11 },
  { name: 'Retail', index: 12 },
  { name: 'Hospitality', index: 13 },
  { name: 'Government', index: 14 },
  { name: 'Non-profit', index: 15 },
  { name: 'Other', index: 16 }
];

const seedWork = async () => {
  try {
    const count = await Work.countDocuments().catch((e) => {console.log(e)});
    if (count === 0) {
      await Work.insertMany(workSeeds).catch((e) => {console.log(e)});
      console.log('Work seeds inserted successfully');
    }
  } catch (error) {
    console.error('Error seeding Work:', error);
  }
};

module.exports = seedWork;
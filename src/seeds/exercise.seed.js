const { Exercise } = require('../models');

const exerciseSeeds = [
  { name: 'Occasionally', index: 1 },
  { name: 'Regularly', index: 2 },
  { name: 'Daily', index: 3 },
  { name: 'Rarely', index: 4 },
  { name: 'Never', index: 5 }
];

const seedExercise = async () => {
  try {
    const count = await Exercise.countDocuments().catch((e) => {console.log(e)});
    if (count === 0) {
      await Exercise.insertMany(exerciseSeeds).catch((e) => {console.log(e)});
      console.log('Exercise seeds inserted successfully');
    }
  } catch (error) {
    console.error('Error seeding Exercise:', error);
  }
};

module.exports = seedExercise;
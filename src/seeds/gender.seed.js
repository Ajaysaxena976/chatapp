const { Gender } = require('../models');

const genderSeeds = [
  { name: 'Male', index: 1 },
  { name: 'Female', index: 2 },
  { name: 'Non - Binary', index: 3 },
  { name: 'Other', index: 4 }
];

const seedGenders = async () => {
  try {
    console.log('👥 Seeding genders...');
    
    const existingCount = await Gender.countDocuments().catch((e) => {console.log(e)});
    if (existingCount > 0) {
      console.log(`🗑️  ${existingCount} genders already exist. Skipping seeding.`);
      return { skipped: true, count: existingCount };
    }
    
    if (!Array.isArray(genderSeeds) || genderSeeds.length === 0) {
      throw new Error('Invalid gender data: must be non-empty array');
    }
    
    const result = await Gender.insertMany(genderSeeds).catch((e) => {console.log(e)});
    console.log(`✅ Successfully seeded ${result.length} genders`);
    return { success: true, count: result.length, data: result };
    
  } catch (error) {
    console.error('❌ Error seeding genders:', error.message);
    return { success: false, error: error.message, count: 0 };
  }
};

module.exports = seedGenders;
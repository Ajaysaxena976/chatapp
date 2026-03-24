const mongoose = require('mongoose');
const config = require('../config/config');
const { seedCountries } = require('./country.seed');
const seedGenders = require('./gender.seed');
const seedCity = require('./city.seed');
const { executeSeeds } = require('./seed-helper');
const seedDateActivity = require('./dateActivity.seed');
const seedDateDay = require('./dateDay.seed');
const seedDiet = require('./diet.seed');
const seedDrink = require('./drink.seed');
const seedEthnicity = require('./ethnicity.seed');
const seedExercise = require('./exercise.seed');
const seedFamilyPlans = require('./family-plan.seed');
const seedHomeTown = require('./hometown.seed');
const seedInterestedIn = require('./interestedIn.seed');
const seedKids = require('./kids.seed');
const seedLanguages = require('./language.seed');
const seedLookingFor = require('./lookingFor.seed');
const seedPolitics = require('./politics.seed');
const seedReligion = require('./religion.seed');
const seedSmoking = require('./smoking.seed');
const seedZodiac = require('./zodiac.seed');
// const seedWork = require('./work.seed');


async function runSeeds() {
  let connectionOpened = false;

  try {
    console.log('🚀 Starting database seeding...');

    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(config.mongoose.url, config.mongoose.options);
      connectionOpened = true;
      console.log('📦 Connected to MongoDB');
    }

    // Run all seeds with comprehensive error handling
    const seedFunctions = [
      { name: 'countries', seedFunction: seedCountries },
      { name: 'genders', seedFunction: seedGenders },
      { name: 'cities', seedFunction: seedCity },
      { name: 'date activities', seedFunction: seedDateActivity },
      { name: 'date days', seedFunction: seedDateDay },
      { name: 'diets', seedFunction: seedDiet },
      { name: 'drinks', seedFunction: seedDrink },
      { name: 'ethnicities', seedFunction: seedEthnicity },
      { name: 'exercises', seedFunction: seedExercise },
      { name: 'family plans', seedFunction: seedFamilyPlans },
      { name: 'home towns', seedFunction: seedHomeTown },
      { name: 'interested ins', seedFunction: seedInterestedIn },
      { name: 'kids', seedFunction: seedKids },
      { name: 'languages', seedFunction: seedLanguages },
      { name: 'looking for', seedFunction: seedLookingFor },
      { name: 'politics', seedFunction: seedPolitics },
      { name: 'religions', seedFunction: seedReligion },
      { name: 'smoking', seedFunction: seedSmoking },
      { name: 'zodiacs', seedFunction: seedZodiac },
      // { name: 'works', seedFunction: seedWork }
    ];

    const results = await executeSeeds(seedFunctions);

    // Log summary
    const successful = Object.values(results).filter(r => !r || (r && r.success !== false)).length;
    const total = Object.keys(results).length;
    console.log(`📊 Final Summary: ${successful}/${total} seed operations completed successfully`);

    console.log('🎉 Seeding process completed!');

  } catch (error) {
    console.error('💥 Critical seeding error:', error.message);
    // Don't exit process in production to prevent server crash
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  } finally {
    // Always close connection if we opened it
    if (connectionOpened && process.env.NODE_ENV !== 'production') {
      try {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
      } catch (closeError) {
        console.error('⚠️ Error closing database connection:', closeError.message);
      }
    }
  }
}

// Run seeds if this file is executed directly
if (require.main === module) {
  runSeeds();
}

module.exports = {
  runSeeds,
  seedCountries,
  seedGenders,
  seedCity
};

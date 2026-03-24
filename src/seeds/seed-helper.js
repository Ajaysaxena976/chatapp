/**
 * Generic seed helper with error handling to prevent server crashes
 */

/**
 * Safe seed execution wrapper
 * @param {string} seedName - Name of the seed for logging
 * @param {Function} Model - Mongoose model
 * @param {Array} data - Data to seed
 * @param {Object} options - Seeding options
 */
async function safeSeed(seedName, Model, data, options = {}) {
  const {
    batchSize = 50,
    skipIfExists = true,
    clearExisting = false
  } = options;

  try {
    console.log(`🌱 Seeding ${seedName}...`);

    // Check if data already exists
    if (skipIfExists) {
      const existingCount = await Model.countDocuments();
      if (existingCount > 0) {
        console.log(`🗑️  ${existingCount} ${seedName} already exist. Skipping seeding.`);
        return { skipped: true, count: existingCount };
      }
    }

    // Validate data
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error(`Invalid ${seedName} data: must be non-empty array`);
    }

    // Clear existing data if requested
    if (clearExisting) {
      await Model.deleteMany({});
      console.log(`🗑️  Cleared existing ${seedName}`);
    }

    // Insert data with batch processing
    const results = [];

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      try {
        const batchResult = await Model.insertMany(batch, { ordered: false });
        results.push(...batchResult);
      } catch (batchError) {
        console.warn(`⚠️  ${seedName} batch ${Math.floor(i / batchSize) + 1} had issues:`, batchError.message);
        // Continue with next batch instead of failing completely
      }
    }

    console.log(`✅ Successfully seeded ${results.length} ${seedName}`);
    return { success: true, count: results.length, data: results };

  } catch (error) {
    console.error(`❌ Error seeding ${seedName}:`, error.message);
    // Return error info instead of throwing to prevent crash
    return { success: false, error: error.message, count: 0 };
  }
}

/**
 * Execute multiple seeds safely
 * @param {Array} seeds - Array of seed functions
 */
async function executeSeeds(seeds) {
  const results = {};

  for (const { name, seedFunction } of seeds) {
    try {
      console.log(`\n📦 Running ${name} seed...`);
      results[name] = await seedFunction();
    } catch (error) {
      console.error(`❌ ${name} seed failed:`, error.message);
      results[name] = { success: false, error: error.message };
      // Continue with other seeds instead of stopping
    }
  }

  // Summary
  const successful = Object.values(results).filter(r => !r || (r && r.success !== false)).length;
  const total = Object.keys(results).length;

  console.log(`\n📊 Seeding Summary: ${successful}/${total} successful`);

  return results;
}

module.exports = {
  safeSeed,
  executeSeeds
};
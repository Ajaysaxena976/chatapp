const { UserPrefs } = require('../models');
const mongoose = require('mongoose');
const logger = require('../config/logger');
const { sanitizeForLog } = logger;

/**
 * Builds $set and $unset objects for a MongoDB update from a partial preference payload.
 *
 * Rules:
 *  - undefined  → skip entirely (field not in request → don't touch DB)
 *  - null | "" → $unset the field (user explicitly cleared it)
 *  - []         → $unset the field (empty array = clear preference)
 *  - ["id",…]  → $set the cleaned array
 *  - object     → recurse into sub-fields
 *  - primitive  → $set the value (number, boolean, string)
 */
const buildUpdate = (obj, parent = "") => {
  const $set = {};
  const $unset = {};

  for (const key in obj) {
    const path = parent ? `${parent}.${key}` : key;
    const value = obj[key];

    /** CASE 1: undefined → skip, partial update (don't touch DB) */
    if (value === undefined) continue;

    /** CASE 2: null or "" → $unset (clear this field in DB) */
    if (value === null || value === "") {
      $unset[path] = 1;
      continue;
    }

    /** CASE 3: Arrays → empty = $unset, non-empty = $set */
    if (Array.isArray(value)) {
      const cleaned = value.filter(v => v !== "" && v !== null && v !== undefined);
      if (cleaned.length === 0) {
        $unset[path] = 1;
      } else {
        $set[path] = cleaned;
      }
      continue;
    }

    /** CASE 4: Objects → recurse into sub-fields */
    if (typeof value === "object" && value !== null) {
      // Auto-turn off `isImportant` when the associated array is empty
      const arrayKeys = Object.keys(value).filter(k => Array.isArray(value[k]));
      if (arrayKeys.length > 0) {
        for (const arrKey of arrayKeys) {
          const cleaned = value[arrKey].filter(v => v !== "" && v !== null && v !== undefined);
          if (cleaned.length === 0) {
            value.isImportant = false;
          }
        }
      }

      const nested = buildUpdate(value, path);
      Object.assign($set, nested.$set);
      Object.assign($unset, nested.$unset);
      continue;
    }

    /** CASE 5: Primitives (boolean, number, string) → $set */
    $set[path] = value;
  }

  return { $set, $unset };
};

const updateUserPreferences = async (userId, preferences) => {
  try {
    logger.logServiceStart('PreferenceService', 'updateUserPreferences', {
      userId: sanitizeForLog(String(userId))
    });

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    let { general_filter = {}, advance_filter = {} } = preferences;

    // 🔥 Extract geo fields FIRST
    const currentlocationInput = general_filter.currentlocation;
    const hometownInput = general_filter.hometown;

    // 🔥 Remove geo fields so buildUpdate NEVER touches them
    delete general_filter.currentlocation;
    delete general_filter.hometown;

    // [REFACTOR] Remove isImportant from absolute gates (Gender) as requested
    if (general_filter.interested_in) {
      delete general_filter.interested_in.isImportant;
    }

    // ---------- CLEAN NON-GEO DATA ----------
    const { $set: setGeneral, $unset: unsetGeneral } = buildUpdate(general_filter);
    const { $set: setAdvance, $unset: unsetAdvance } = buildUpdate(advance_filter);

    const finalSet = {
      ...setGeneral,
      ...setAdvance,
    };

    const finalUnset = {
      ...unsetGeneral,
      ...unsetAdvance,
    };

    // ---------- CURRENT LOCATION ----------
    if (currentlocationInput === null) {
      finalUnset["currentlocation"] = 1;
    }
    else if (
      currentlocationInput &&
      typeof currentlocationInput.lat === 'number' &&
      typeof currentlocationInput.lon === 'number'
    ) {
      finalSet["currentlocation"] = {
        type: "Point",
        coordinates: [
          currentlocationInput.lon, // longitude FIRST
          currentlocationInput.lat  // latitude SECOND
        ],
        address: currentlocationInput.address || ''
      };
    }

    // ---------- HOMETOWN ----------
    if (hometownInput === null) {
      finalUnset["hometown"] = 1;
    }
    else if (
      hometownInput &&
      typeof hometownInput.lat === 'number' &&
      typeof hometownInput.lon === 'number'
    ) {
      finalSet["hometown"] = {
        type: "Point",
        coordinates: [
          hometownInput.lon,
          hometownInput.lat
        ],
        address: hometownInput.address || ''
      };
    }




    const updateQuery = {
      ...(Object.keys(finalSet).length && { $set: finalSet }),
      ...(Object.keys(finalUnset).length && { $unset: finalUnset }),
      $currentDate: { updated_at: true },
    };

    const updatedPrefs = await UserPrefs.findOneAndUpdate(
      { user_id: new mongoose.Types.ObjectId(userId) },
      updateQuery,
      { new: true, upsert: true }
    )
      .populate('pets.pets')
      .populate('interested_in.interests')
      .populate('looking_for.looking')
      .populate('exercise.exercises')
      .populate('diet.diets')
      .populate('drink.drinks')
      .populate('smoke.smokings')
      .populate('religion.religions')
      .populate('ethnicity.ethnicities')
      .populate('cultural_background.cultural_backgrounds')
      .populate('education_level.education_levels')
      .populate('family_plan.family_plans')
      .populate('kid.kids')
      .populate('user_id')
      .populate('dates_days')
      .populate('zodiac.zodiacs')
      .populate('languages.languages')
      .populate('political.politics');

    logger.logServiceEnd('PreferenceService', 'updateUserPreferences', {
      success: !!updatedPrefs,
      preferencesId: updatedPrefs?._id
    });

    return updatedPrefs;

  } catch (error) {
    logger.error("Error updating preferences", {
      error: sanitizeForLog(error.message),
      userId: sanitizeForLog(String(userId)),
    });
    throw error;
  }
};


const getUserPreferences = async (userId) => {

  const userPrefs = await UserPrefs.findOne({ user_id: new mongoose.Types.ObjectId(userId) })
    .populate('interested_in.interests')
    .populate('looking_for.looking')
    .populate('exercise.exercises')
    .populate('diet.diets')
    .populate('drink.drinks')
    .populate('smoke.smokings')
    .populate('religion.religions')
    .populate('ethnicity.ethnicities')
    .populate('cultural_background.cultural_backgrounds')
    .populate('education_level.education_levels')
    .populate('family_plan.family_plans')
    .populate('kid.kids')
    .populate('pets.pets')
    .populate('user_id')
    .populate('dates_days')
    .populate('zodiac.zodiacs')
    .populate('languages.languages')
    .populate('political.politics')

  return userPrefs;
};

module.exports = {
  updateUserPreferences,
  getUserPreferences
};

const { Drink } = require('../models');

const drinkSeeds = [
  { name: 'Never' , index: 1},
  { name: 'Socially' , index: 2},
  { name: 'Regularly' , index: 3},
  { name: 'Trying to Quit' , index: 4},
  { name: 'Never' , index: 5},

];

const seedDrink = async () => {
  try {
    const count = await Drink.countDocuments().catch((e) => {console.log(e)});
    if (count === 0) {
      await Drink.insertMany(drinkSeeds).catch((e) => {console.log(e)});
      console.log('Drink seeds inserted successfully');
    }
  } catch (error) {
    console.error('Error seeding Drink:', error);
  }
};

module.exports = seedDrink;
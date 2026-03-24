const { Diet } = require('../models');

const dietSeeds = [
  { name: 'Anything' ,index : 1},
  { name: 'Vegetarian' ,index : 2},
  { name: 'Vegan' ,index : 3},
  { name: 'Pescatarian' ,index : 4},
  { name: 'Kosher' ,index : 5},
  { name: 'Halal' ,index : 6},
  { name: 'Gluten-free' ,index : 7},
  { name: 'Lactose-free' ,index : 8},
  { name: 'Other' ,index : 9}
];

const seedDiet = async () => {
  try {
    const count = await Diet.countDocuments().catch((e) => {console.log(e)});
    if (count === 0) {
      await Diet.insertMany(dietSeeds).catch((e) => {console.log(e)});
      console.log('Diet seeds inserted successfully');
    }
  } catch (error) {
    console.error('Error seeding Diet:', error);
  }
};

module.exports = seedDiet;
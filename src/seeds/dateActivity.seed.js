const { DateActivity } = require('../models');

const dateActivitySeeds = [


  // Food and Drink
  { name: 'Coffee Date', category: 'food_and_drink' ,index : 1},
  { name: 'Drinks', category: 'food_and_drink' ,index : 2},
  { name: 'Dinner', category: 'food_and_drink' ,index : 3},
  { name: 'Food Trucks', category: 'food_and_drink' ,index : 4},
  { name: 'Wine Tasting', category: 'food_and_drink' ,index : 5},

  
  // Active and Outdoor
  { name: 'Park Walk', category: 'active_and_outdoor' ,index : 1},
  { name: 'Hiking', category: 'active_and_outdoor' ,index : 2},
  { name: 'Beach', category: 'active_and_outdoor' ,index : 3},
  { name: 'Biking', category: 'active_and_outdoor' ,index : 4},
  { name: 'Skating', category: 'active_and_outdoor' ,index : 5},
  { name: 'Mini Golf', category: 'active_and_outdoor' ,index : 6},

  
  // Fun
  { name: 'Museum Visit', category: 'fun' ,index : 1},
  { name: 'Comedy Show', category: 'fun' ,index : 2},
  { name: 'Clubbing', category: 'fun' ,index : 3},
  { name: 'Live Music', category: 'fun' ,index : 4},
  { name: 'Arcade & Bowling', category: 'fun' ,index : 5},
  { name: 'Escape Room', category: 'fun' ,index : 6},


  // Chill and Cosy
  { name: 'Movie Night', category: 'chill_and_cosy' ,index : 1},
  { name: 'Netflix & Chill', category: 'chill_and_cosy' ,index : 2},
  { name: 'Picnic', category: 'chill_and_cosy' ,index : 3},
  { name: 'Board Games', category: 'chill_and_cosy' ,index : 4}
];

const seedDateActivities = async () => {
  try {
    const count = await DateActivity.countDocuments().catch((e) => {console.log(e)});
    if (count === 0) {
      await DateActivity.insertMany(dateActivitySeeds).catch((e) => {console.log(e)});
      console.log('DateActivity seeds inserted successfully');
    }
  } catch (error) {
    console.error('Error seeding DateActivities:', error);
  }
};

module.exports = seedDateActivities;
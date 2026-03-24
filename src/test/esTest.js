// // // // // // // require('dotenv').config();
// // // // // // // const esClient = require('../config/esClient'); 

// // // // // // // async function test() {
// // // // // // //   try {
// // // // // // //     const info = await esClient.info();
// // // // // // //     console.log("ES Connected Successfully:", info);
// // // // // // //   } catch (err) {
// // // // // // //     console.error("ES Connection Error:", err.meta?.body || err);
// // // // // // //   }
// // // // // // // }
// // // // // // // test();


// // // // // // // test-es.js
// // // // // // process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // ignore self-signed certs

// // // // // // const { Client } = require('@elastic/elasticsearch');

// // // // // // const client = new Client({
// // // // // //   node: 'https://tst-ka-ara-mon-ela-1.maslocal.net:9200',
// // // // // //   auth: {
// // // // // //     username: 'spontime_dev',
// // // // // //     password: 'eJUrlNTCeRG_txECTUgnvjOr'
// // // // // //   },
// // // // // //   ssl: {
// // // // // //     rejectUnauthorized: false
// // // // // //   }
// // // // // // });

// // // // // // console.log("Elasticsearch Client Configured");
// // // // // // const info = client.info()
// // // // // //   try {
// // // // // //     const info =  client.info();
// // // // // //     console.log("ES Connected Successfully:", info);
// // // // // //   } catch (err) {
// // // // // //     console.error("ES Connection Error:", err.meta?.body || err);
// // // // // //   }

// // // // // // // const runTest = async () => {
// // // // // // //   try {
// // // // // // //     console.log("==== Elasticsearch Test Start ====");

// // // // // // //     // 1️⃣ Create test index
// // // // // // //     const indexName = "spontime_dev_test_index";
// // // // // // //     const indexExists = await client.indices.exists({ index: indexName });

// // // // // // //     if (!indexExists) {
// // // // // // //       await client.indices.create({
// // // // // // //         index: indexName,
// // // // // // //         settings: {
// // // // // // //           number_of_shards: 1,
// // // // // // //           number_of_replicas: 0
// // // // // // //         }
// // // // // // //       });
// // // // // // //       console.log(`Index '${indexName}' created`);
// // // // // // //     } else {
// // // // // // //       console.log(`Index '${indexName}' already exists`);
// // // // // // //     }

// // // // // // //     // 2️⃣ Add a sample document
// // // // // // //     const doc = {
// // // // // // //       userId: "123",
// // // // // // //       name: "Sumit",
// // // // // // //       age: 28,
// // // // // // //       profession: "Developer"
// // // // // // //     };

// // // // // // //     const addDoc = await client.index({
// // // // // // //       index: indexName,
// // // // // // //       document: doc
// // // // // // //     });

// // // // // // //     console.log("Document added:", addDoc.result || addDoc);

// // // // // // //     // 3️⃣ Search the index
// // // // // // //     const searchResult = await client.search({
// // // // // // //       index: indexName,
// // // // // // //       query: {
// // // // // // //         match_all: {}
// // // // // // //       }
// // // // // // //     });

// // // // // // //     console.log("Search results:");
// // // // // // //     console.log(searchResult.hits.hits);

// // // // // // //     console.log("==== Elasticsearch Test End ====");
// // // // // // //   } catch (err) {
// // // // // // //     console.error("Error:", err.meta?.body || err);
// // // // // // //   }
// // // // // // // };

// // // // // // // runTest();

// // // const mongoose = require('mongoose');
// // // const config = require('../config/config');
// // // const { User, UserProfile, UserPrefs } = require('../models');

// // // (async () => {
// // //   try {
// // //     await mongoose.connect(config.mongoose.url, {
// // //       useNewUrlParser: true,
// // //       useUnifiedTopology: true,
// // //     });

// // //     console.log('✅ MongoDB connected');

// // //     const result = await UserProfile.updateMany(
// // //       {},
// // //       {
// // //         $set: {
// // //           cultural_background: [
// // //             new mongoose.Types.ObjectId('69439f8bc28b9dd5e0d09ce2'),
// // //             new mongoose.Types.ObjectId('69439f8bc28b9dd5e0d09ca6'),
// // //           ],
// // //           cultural_background_visibility: false,
// // //         },
// // //       }
// // //     );

// // //     console.log(`✅ Updated ${result.modifiedCount} user profiles`);

// // //     await mongoose.disconnect();
// // //     process.exit(0);
// // //   } catch (err) {
// // //     console.error('❌ Error updating profiles:', err);
// // //     process.exit(1);
// // //   }
// // // })();



// // // // // (async () => {
// // // // //   for (let i = 10; i < 30; i++) {

// // // // //     // 1️⃣ Create User (await is REQUIRED)
// // // // //     const user = await User.create({
// // // // //       is_mobile_verified: true,
// // // // //       is_social_login: false,
// // // // //       is_registered: true,
// // // // //       is_detailed_submit: true,
// // // // //       is_subscribed: false,
// // // // //       phone_number: `97192520${i + 1}`,
// // // // //       phone_code: "+91",
// // // // //     });

// // // // //     console.log(`Created user with phone number: ${user.phone_number}`);

// // // // //     // 2️⃣ Create UserProfile
// // // // //     const mongoose = require("mongoose");

// // // // //     await UserProfile.create({
// // // // //       user_id: user._id,

// // // // //       name: "Jeevan Bisht" + (i + 1),

// // // // //       dates_days: [
// // // // //         new mongoose.Types.ObjectId("68cbe8f3fcf6a700110fb882"),
// // // // //         new mongoose.Types.ObjectId("68cbe8f3fcf6a700110fb883"),
// // // // //         new mongoose.Types.ObjectId("68cbe8f3fcf6a700110fb884"),
// // // // //         new mongoose.Types.ObjectId("68cbe8f3fcf6a700110fb885"),
// // // // //         new mongoose.Types.ObjectId("68cbe8f3fcf6a700110fb886"),
// // // // //         new mongoose.Types.ObjectId("68cbe8f3fcf6a700110fb887"),
// // // // //         new mongoose.Types.ObjectId("68cbe8f3fcf6a700110fb888"),
// // // // //       ],

// // // // //       date_of_birth: new Date("2005-08-15"),

// // // // //       gender: new mongoose.Types.ObjectId("68cbe8f3fcf6a700110fb6c3"),
// // // // //       gender_visibility: true,

// // // // //       interested_in: new mongoose.Types.ObjectId("68cbe8f3fcf6a700110fb8c2"),

// // // // //       looking_for: [
// // // // //         new mongoose.Types.ObjectId("68cbe8f3fcf6a700110fb8f3"),
// // // // //         new mongoose.Types.ObjectId("68cbe8f3fcf6a700110fb8f4"),
// // // // //         new mongoose.Types.ObjectId("68cbe8f3fcf6a700110fb8f5"),
// // // // //         new mongoose.Types.ObjectId("68cbe8f3fcf6a700110fb8f6"),
// // // // //         new mongoose.Types.ObjectId("68cbe8f3fcf6a700110fb8f7"),

// // // // //       ],
// // // // //       looking_for_visibility: true,

// // // // //       work: new mongoose.Types.ObjectId("691f12380b323856008a305a"),
// // // // //       work_visibility: true,

// // // // //       about_yourself: "I love traveling.",
// // // // //       idea_of_great_date: "Dinner + walk",

// // // // //       favorite_dates: [
// // // // //         new mongoose.Types.ObjectId("68cbe8f3fcf6a700110fb86c"),
// // // // //         new mongoose.Types.ObjectId("68cbe8f3fcf6a700110fb86b"),
// // // // //         new mongoose.Types.ObjectId("68cbe8f3fcf6a700110fb86d"),
// // // // //         new mongoose.Types.ObjectId("68cbe8f3fcf6a700110fb86f"),
// // // // //         new mongoose.Types.ObjectId("6920d68acb099d5d58830a49"),
// // // // //       ],
// // // // //       favorite_dates_visibility: true,

// // // // //       main_img:
// // // // //         "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1765977146322-my_dp_for_teams_20251217131226323.png",

// // // // //       images: [
// // // // //         "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1765977146322-my_dp_for_teams_20251217131226323.png",
// // // // //         "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1765977146322-my_dp_for_teams_20251217131226323.png"
// // // // //       ],

// // // // //       social_links: [
// // // // //         {
// // // // //           platform: "Twitter",
// // // // //           url: "https://twitter.com/afjal",
// // // // //           username: "afjal",
// // // // //           isConnected: false,
// // // // //         },
// // // // //       ],

// // // // //       education: {
// // // // //         Institute_name: "University of Example",
// // // // //         major_degree: "Computer Science",
// // // // //         graduation_year: 2015,
// // // // //       },
// // // // //       education_visibility: true,

// // // // //       education_level: new mongoose.Types.ObjectId("691f0afd0b323856008a3045"),
// // // // //       education_level_visibility: false,

// // // // //       cultural_background: new mongoose.Types.ObjectId("691f0a5f0b323856008a300d"),
// // // // //       cultural_background_visibility: false,

// // // // //       location: {
// // // // //         type: "Point",
// // // // //         coordinates: [-117.1611, 32.7157],
// // // // //         address: "San Diego, California, USA",
// // // // //       },
// // // // //       location_visibility: false,

// // // // //       hometown: {
// // // // //         type: "Point",
// // // // //         coordinates: [-117.1611, 32.7157],
// // // // //         address: "San Diego, California, USA",
// // // // //       },
// // // // //       hometown_visibility: false,

// // // // //       occupation: {
// // // // //         company_name: "Tech Corp",
// // // // //         job_title: "Software Engineer",
// // // // //       },
// // // // //       occupation_visibility: true,

// // // // //       height: "175",
// // // // //       height_unit: "cm",
// // // // //       height_visibility: true,

// // // // //       exercise: new mongoose.Types.ObjectId("68cbe8f3fcf6a700110fb8a9"),
// // // // //       exercise_visibility: false,

// // // // //       diet: new mongoose.Types.ObjectId("68cbe8f3fcf6a700110fb88c"),
// // // // //       diet_visibility: false,

// // // // //       drink: new mongoose.Types.ObjectId("68cbe8f3fcf6a700110fb896"),
// // // // //       drink_visibility: false,

// // // // //       smoking: new mongoose.Types.ObjectId("68cbe8f3fcf6a700110fb917"),
// // // // //       smoking_visibility: false,

// // // // //       religion: new mongoose.Types.ObjectId("68cbe8f3fcf6a700110fb904"),
// // // // //       religion_visibility: false,

// // // // //       ethnicity: new mongoose.Types.ObjectId("68cbe8f3fcf6a700110fb89f"),
// // // // //       ethnicity_visibility: false,

// // // // //       family_plan_visibility: false,

// // // // //       kids: new mongoose.Types.ObjectId("68cbe8f3fcf6a700110fb8c7"),
// // // // //       kids_visibility: true,

// // // // //       pets: new mongoose.Types.ObjectId("691f16090b323856008a3076"),
// // // // //       pets_visibility: true,

// // // // //       zodiac: new mongoose.Types.ObjectId("691f08ed0b323856008a2ff8"),
// // // // //       zodiac_visibility: true,

// // // // //       languages: [
// // // // //         new mongoose.Types.ObjectId("68cbe8f3fcf6a700110fb8cc"),
// // // // //       ],
// // // // //       languages_visibility: true,

// // // // //       politics: new mongoose.Types.ObjectId("68cbe8f3fcf6a700110fb8fb"),
// // // // //       politics_visibility: false,
// // // //     // });


// // // //     // 3️⃣ Create UserPrefs
// // // //     // await UserPrefs.create({
// // // //     //   user_id: user._id,

// // // //     //   interested_in: {
// // // //     //     interests: [
// // // //     //       new mongoose.Types.ObjectId("68cbe8f3fcf6a700110fb8c2")
// // // //     //     ],
// // // //     //     isImportant: false
// // // //     //   },

// // // //     //   looking_for: {
// // // //     //     looking: [
// // // //     //       new mongoose.Types.ObjectId("68cbe8f3fcf6a700110fb8f4")
// // // //     //     ],
// // // //     //     isImportant: false
// // // //     //   },

// // // //     //   dates_days: [
// // // //     //     new mongoose.Types.ObjectId("68cbe8f3fcf6a700110fb885"),
// // // //     //     new mongoose.Types.ObjectId("68cbe8f3fcf6a700110fb887"),
// // // //     //   ],

// // // //     //   currentlocation: { coordinates: [] },
// // // //     //   hometown: { coordinates: [] }
// // // //     // });
// // // // //   }

// // // // //   console.log("✅ All test users created successfully");
// // // // // })();



// const randomOne = (arr) =>
//   arr[Math.floor(Math.random() * arr.length)];

// const randomMany = (arr, min = 1, max = 3) =>
//   [...arr]
//     .sort(() => 0.5 - Math.random())
//     .slice(0, Math.floor(Math.random() * (max - min + 1)) + min);

// const oid = (id) => new mongoose.Types.ObjectId(id);

// const mongoose = require('mongoose');
// const config = require('../config/config');
// const { User, UserProfile, UserPrefs } = require('../models');


// const DATE_DAYS = [
//   "68cbe8f3fcf6a700110fb882",
//   "68cbe8f3fcf6a700110fb883",
//   "68cbe8f3fcf6a700110fb884",
//   "68cbe8f3fcf6a700110fb885",
//   "68cbe8f3fcf6a700110fb886",
//   "68cbe8f3fcf6a700110fb887",
//   "68cbe8f3fcf6a700110fb888",
// ];

// const DIET = [
//   "68cbe8f3fcf6a700110fb88b",
//   "68cbe8f3fcf6a700110fb88c",
//   "68cbe8f3fcf6a700110fb88d",
//   "68cbe8f3fcf6a700110fb88e",
//   "68cbe8f3fcf6a700110fb88f",
// ];

// const SMOKING = [
//   "68cbe8f3fcf6a700110fb913",
//   "68cbe8f3fcf6a700110fb914",
//   "68cbe8f3fcf6a700110fb915",
//   "68cbe8f3fcf6a700110fb916",
//   "68cbe8f3fcf6a700110fb917",
// ];

// const KIDS = [
//   "68cbe8f3fcf6a700110fb8c7",
//   "68cbe8f3fcf6a700110fb8c8",
//   "68cbe8f3fcf6a700110fb8c9",
//   "6923f43df2eec57b3c32cf34",
//   "6923f459f2eec57b3c32cf36",
// ];

// const EXERCISE = [
//   "68cbe8f3fcf6a700110fb8a9",
//   "68cbe8f3fcf6a700110fb8aa",
//   "68cbe8f3fcf6a700110fb8ac",
//   "68cbe8f3fcf6a700110fb8ab"
// ];

// const FAMILY_PLAN = [
//   "68cbe8f3fcf6a700110fb8af",
//   "68cbe8f3fcf6a700110fb8b0",
//   "68cbe8f3fcf6a700110fb8b1",
//   "68cbe8f3fcf6a700110fb8b2"
// ];

// const PETS = [
//   "691f15f90b323856008a3074",
//   "691f16090b323856008a3076",
//   "6923f0c5f2eec57b3c32cf2b",
//   "6923f0e3f2eec57b3c32cf2d"
// ];

// const ZODIAC = [
//   "691f08ed0b323856008a2ff8",
//   "691f08ed0b323856008a2ff9",
//   "691f08ed0b323856008a2ffa",
//   "691f08ed0b323856008a2ffb",
//   "691f08ed0b323856008a2ffc",
//   "691f08ed0b323856008a2ffd",
//   "691f08ed0b323856008a2ffe",
//   "691f08ed0b323856008a2fff",
//   "691f08ed0b323856008a3000",
//   "691f08ed0b323856008a3001",
//   "691f08ed0b323856008a3002",
//   "691f08ed0b323856008a3003",
// ];

// const POLITCS=[
//   "68cbe8f3fcf6a700110fb8fa",
//   "68cbe8f3fcf6a700110fb8fb",
//   "68cbe8f3fcf6a700110fb8fc",
//   "68cbe8f3fcf6a700110fb8fd",

// ];

// const DRINK = [
//   "68cbe8f3fcf6a700110fb897",
//   "68cbe8f3fcf6a700110fb898",
//   "68cbe8f3fcf6a700110fb899",
//   "692595562614107f7cdaea36"
  
// ];

// const RELIGION = [
//   "68cbe8f3fcf6a700110fb902",
//   "68cbe8f3fcf6a700110fb903",
//   "68cbe8f3fcf6a700110fb904",
//   "68cbe8f3fcf6a700110fb905",
//   "68cbe8f3fcf6a700110fb906",
//   "68cbe8f3fcf6a700110fb907",
//   "68cbe8f3fcf6a700110fb908",
//   "68cbe8f3fcf6a700110fb909",
//   '69494bcb044bfd22aeac0fe5',
//   '69494bcb044bfd22aeac0fe6',
//   '69494bcb044bfd22aeac0fe7',
//   '69494bcb044bfd22aeac0fe8',
//   '69494bcb044bfd22aeac0fe9',
//   '69494bcb044bfd22aeac0fea'

// ];
// const LOOKING_FOR=[
//     "68cbe8f3fcf6a700110fb8f3",
//     "68cbe8f3fcf6a700110fb8f4",
//     "68cbe8f3fcf6a700110fb8f5",
//     "68cbe8f3fcf6a700110fb8f6",
//     "68cbe8f3fcf6a700110fb8f7"
// ]
// const LANGUAGES = [
//   "68cbe8f3fcf6a700110fb8cc",
//   "68cbe8f3fcf6a700110fb8cd",
//   "68cbe8f3fcf6a700110fb8ce",
//   "68cbe8f3fcf6a700110fb8cf",
//   "68cbe8f3fcf6a700110fb8d0",
//   "68cbe8f3fcf6a700110fb8d1",
//   "68cbe8f3fcf6a700110fb8d2",
//   "68cbe8f3fcf6a700110fb8d3",
//   "68cbe8f3fcf6a700110fb8d4",
//   "68cbe8f3fcf6a700110fb8d5",
//   "68cbe8f3fcf6a700110fb8d6",
//   "68cbe8f3fcf6a700110fb8d7",
//   "68cbe8f3fcf6a700110fb8d8",
//   "68cbe8f3fcf6a700110fb8d9",
//   "68cbe8f3fcf6a700110fb8da",
//   "68cbe8f3fcf6a700110fb8db",
//   "68cbe8f3fcf6a700110fb8dc",
//   "68cbe8f3fcf6a700110fb8dd",
//   "68cbe8f3fcf6a700110fb8de",
//   "68cbe8f3fcf6a700110fb8df",
//   "68cbe8f3fcf6a700110fb8e0",
//   "68cbe8f3fcf6a700110fb8e1",
//   "68cbe8f3fcf6a700110fb8e2",
//   "68cbe8f3fcf6a700110fb8e3",
//   "68cbe8f3fcf6a700110fb8e4",
//   "68cbe8f3fcf6a700110fb8e5",
//   "68cbe8f3fcf6a700110fb8e6",
//   "68cbe8f3fcf6a700110fb8e7",
//   "68cbe8f3fcf6a700110fb8e8",
//   "68cbe8f3fcf6a700110fb8e9",
//   "68cbe8f3fcf6a700110fb8ea",
//   "68cbe8f3fcf6a700110fb8eb",
//   "68cbe8f3fcf6a700110fb8ec",
//   "68cbe8f3fcf6a700110fb8ed",
//   "68cbe8f3fcf6a700110fb8ee",
//   "68cbe8f3fcf6a700110fb8ef",
//   "68cbe8f3fcf6a700110fb8f0",

//   "6943fb5ac28b9dd5e0d09d75",
//   "6943fb5ac28b9dd5e0d09d76",
//   "6943fb5ac28b9dd5e0d09d77",
//   "6943fb5ac28b9dd5e0d09d78",
//   "6943fb5ac28b9dd5e0d09d79",
//   "6943fb5ac28b9dd5e0d09d7a",
//   "6943fb5ac28b9dd5e0d09d7b",
//   "6943fb5ac28b9dd5e0d09d7c",
//   "6943fb5ac28b9dd5e0d09d7d",
//   "6943fb5ac28b9dd5e0d09d7e",
//   "6943fb5ac28b9dd5e0d09d7f",
//   "6943fb5ac28b9dd5e0d09d80",
//   "6943fb5ac28b9dd5e0d09d81",
//   "6943fb5ac28b9dd5e0d09d82",
//   "6943fb5ac28b9dd5e0d09d83",
//   "6943fb5ac28b9dd5e0d09d84",
//   "6943fb5ac28b9dd5e0d09d85",
//   "6943fb5ac28b9dd5e0d09d86",
//   "6943fb5ac28b9dd5e0d09d87",
//   "6943fb5ac28b9dd5e0d09d88",
//   "6943fb5ac28b9dd5e0d09d89",
//   "6943fb5ac28b9dd5e0d09d8a",
//   "6943fb5ac28b9dd5e0d09d8b",
//   "6943fb5ac28b9dd5e0d09d8c",
//   "6943fb5ac28b9dd5e0d09d8d",
//   "6943fb5ac28b9dd5e0d09d8e",
//   "6943fb5ac28b9dd5e0d09d8f",
//   "6943fb5ac28b9dd5e0d09d90",
//   "6943fb5ac28b9dd5e0d09d91",
//   "6943fb5ac28b9dd5e0d09d92",
//   "6943fb5ac28b9dd5e0d09d93",
//   "6943fb5ac28b9dd5e0d09d94",
//   "6943fb5ac28b9dd5e0d09d95",
//   "6943fb5ac28b9dd5e0d09d96",
//   "6943fb5ac28b9dd5e0d09d97",
//   "6943fb5ac28b9dd5e0d09d98",
//   "6943fb5ac28b9dd5e0d09d99",
//   "6943fb5ac28b9dd5e0d09d9a",
//   "6943fb5ac28b9dd5e0d09d9b",
//   "6943fb5ac28b9dd5e0d09d9c",

//   "6943fb89c28b9dd5e0d09dcb",
//   "6943fb89c28b9dd5e0d09dcc",
//   "6943fb89c28b9dd5e0d09dcd",
//   "6943fb89c28b9dd5e0d09dce",
//   "6943fb89c28b9dd5e0d09dcf",
//   "6943fb89c28b9dd5e0d09dd0",
//   "6943fb89c28b9dd5e0d09dd1",
//   "6943fb89c28b9dd5e0d09dd2",
//   "6943fb89c28b9dd5e0d09dd3",
//   "6943fb89c28b9dd5e0d09dd4",
//   "6943fb89c28b9dd5e0d09dd5",
//   "6943fb89c28b9dd5e0d09dd6",
//   "6943fb89c28b9dd5e0d09dd7",
//   "6943fb89c28b9dd5e0d09dd8",
//   "6943fb89c28b9dd5e0d09dd9",
//   "6943fb89c28b9dd5e0d09dda",
//   "6943fb89c28b9dd5e0d09ddb",
//   "6943fb89c28b9dd5e0d09ddc",
//   "6943fb89c28b9dd5e0d09ddd",
//   "6943fb89c28b9dd5e0d09dde",
//   "6943fb89c28b9dd5e0d09ddf",
//   "6943fb89c28b9dd5e0d09de0",
//   "6943fb89c28b9dd5e0d09de1",
//   "6943fb89c28b9dd5e0d09de2",
//   "6943fb89c28b9dd5e0d09de3",
//   "6943fb89c28b9dd5e0d09de4",
//   "6943fb89c28b9dd5e0d09de5",
//   "6943fb89c28b9dd5e0d09de6",
//   "6943fb89c28b9dd5e0d09de7",
//   "6943fb89c28b9dd5e0d09de8",
//   "6943fb89c28b9dd5e0d09de9",
//   "6943fb89c28b9dd5e0d09dea",
//   "6943fb89c28b9dd5e0d09deb",
//   "6943fb89c28b9dd5e0d09dec",
//   "6943fb89c28b9dd5e0d09ded",
//   "6943fb89c28b9dd5e0d09dee",
//   "6943fb89c28b9dd5e0d09def",
//   "6943fb89c28b9dd5e0d09df0",
//   "6943fb89c28b9dd5e0d09df1",
//   "6943fb89c28b9dd5e0d09df2",
//   "6943fb89c28b9dd5e0d09df3",
//   "6943fb89c28b9dd5e0d09df4",
//   "6943fb89c28b9dd5e0d09df5",
//   "6943fb89c28b9dd5e0d09df6"
// ];

// const WORK = [
//     '691f12380b323856008a3058',
//     '691f12380b323856008a3059',
//     '691f12380b323856008a305a',
//     '691f12380b323856008a305b',
//     '691f12380b323856008a305c',
//     '691f12380b323856008a305d',
//     '691f12380b323856008a305e',
//     '691f12380b323856008a306d'

// ]

// const FAV_DATE = [
//   "68cbe8f3fcf6a700110fb86b",
//   "68cbe8f3fcf6a700110fb86c",
//   "68cbe8f3fcf6a700110fb86d",
//   "68cbe8f3fcf6a700110fb86e",
//   "68cbe8f3fcf6a700110fb86f",
//   "6920d68acb099d5d58830a49",
//   "6920d68acb099d5d58830a4b",
//   "6920d68acb099d5d58830a4c",
//   "6920d68acb099d5d58830a4d",
//   "6920d68acb099d5d58830a4e",
//   "6920d68acb099d5d58830a4f",
//   "6920d68acb099d5d58830a50",
//   "6920d68acb099d5d58830a51",
//   "6920d68acb099d5d58830a52",
//   "6920d68acb099d5d58830a53",
//   "6920d68acb099d5d58830a54",
//   "6920d68acb099d5d58830a55",
//   "6920d68acb099d5d58830a56",
//   "6920d68acb099d5d58830a57",
//   "6920d68acb099d5d58830a58",
//   "6920d68acb099d5d58830a59"
// ];

// const EDUCATION_LEVEL = [
//     '691f0afd0b323856008a3041',
//     '691f0afd0b323856008a3042',
//     '691f0afd0b323856008a3043',
//     '691f0afd0b323856008a3044',
//     '691f0afd0b323856008a3045',
//     '691f0afd0b323856008a3046',
//     '691f0afd0b323856008a3047',
// ]

// const CULTURAL_BACK_ID = [
//   "69439f8bc28b9dd5e0d09c5d","69439f8bc28b9dd5e0d09c5e","69439f8bc28b9dd5e0d09c5f","69439f8bc28b9dd5e0d09c60",
//   "69439f8bc28b9dd5e0d09c61","69439f8bc28b9dd5e0d09c62","69439f8bc28b9dd5e0d09c63","69439f8bc28b9dd5e0d09c64",
//   "69439f8bc28b9dd5e0d09c65","69439f8bc28b9dd5e0d09c66","69439f8bc28b9dd5e0d09c67","69439f8bc28b9dd5e0d09c68",
//   "69439f8bc28b9dd5e0d09c69","69439f8bc28b9dd5e0d09c6a","69439f8bc28b9dd5e0d09c6b","69439f8bc28b9dd5e0d09c6c",
//   "69439f8bc28b9dd5e0d09c6d","69439f8bc28b9dd5e0d09c6e","69439f8bc28b9dd5e0d09c6f","69439f8bc28b9dd5e0d09c70",
//   "69439f8bc28b9dd5e0d09c71","69439f8bc28b9dd5e0d09c72","69439f8bc28b9dd5e0d09c73","69439f8bc28b9dd5e0d09c74",
//   "69439f8bc28b9dd5e0d09c75","69439f8bc28b9dd5e0d09c76","69439f8bc28b9dd5e0d09c77","69439f8bc28b9dd5e0d09c78",
//   "69439f8bc28b9dd5e0d09c79","69439f8bc28b9dd5e0d09c7a","69439f8bc28b9dd5e0d09c7b","69439f8bc28b9dd5e0d09c7c",
//   "69439f8bc28b9dd5e0d09c7d","69439f8bc28b9dd5e0d09c7e","69439f8bc28b9dd5e0d09c7f","69439f8bc28b9dd5e0d09c80",
//   "69439f8bc28b9dd5e0d09c81","69439f8bc28b9dd5e0d09c82","69439f8bc28b9dd5e0d09c83","69439f8bc28b9dd5e0d09c84",
//   "69439f8bc28b9dd5e0d09c85","69439f8bc28b9dd5e0d09c86","69439f8bc28b9dd5e0d09c87","69439f8bc28b9dd5e0d09c88",
//   "69439f8bc28b9dd5e0d09c89","69439f8bc28b9dd5e0d09c8a","69439f8bc28b9dd5e0d09c8b","69439f8bc28b9dd5e0d09c8c",
//   "69439f8bc28b9dd5e0d09c8d","69439f8bc28b9dd5e0d09c8e","69439f8bc28b9dd5e0d09c8f","69439f8bc28b9dd5e0d09c90",
//   "69439f8bc28b9dd5e0d09c91","69439f8bc28b9dd5e0d09c92","69439f8bc28b9dd5e0d09c93","69439f8bc28b9dd5e0d09c94",
//   "69439f8bc28b9dd5e0d09c95","69439f8bc28b9dd5e0d09c96","69439f8bc28b9dd5e0d09c97","69439f8bc28b9dd5e0d09c98",
//   "69439f8bc28b9dd5e0d09c99","69439f8bc28b9dd5e0d09c9a","69439f8bc28b9dd5e0d09c9b","69439f8bc28b9dd5e0d09c9c",
//   "69439f8bc28b9dd5e0d09c9d","69439f8bc28b9dd5e0d09c9e","69439f8bc28b9dd5e0d09c9f","69439f8bc28b9dd5e0d09ca0",
//   "69439f8bc28b9dd5e0d09ca1","69439f8bc28b9dd5e0d09ca2","69439f8bc28b9dd5e0d09ca3","69439f8bc28b9dd5e0d09ca4",
//   "69439f8bc28b9dd5e0d09ca5","69439f8bc28b9dd5e0d09ca6","69439f8bc28b9dd5e0d09ca7","69439f8bc28b9dd5e0d09ca8",
//   "69439f8bc28b9dd5e0d09ca9","69439f8bc28b9dd5e0d09caa","69439f8bc28b9dd5e0d09cab","69439f8bc28b9dd5e0d09cac",
//   "69439f8bc28b9dd5e0d09cad","69439f8bc28b9dd5e0d09cae","69439f8bc28b9dd5e0d09caf","69439f8bc28b9dd5e0d09cb0",
//   "69439f8bc28b9dd5e0d09cb1","69439f8bc28b9dd5e0d09cb2","69439f8bc28b9dd5e0d09cb3","69439f8bc28b9dd5e0d09cb4",
//   "69439f8bc28b9dd5e0d09cb5","69439f8bc28b9dd5e0d09cb6","69439f8bc28b9dd5e0d09cb7","69439f8bc28b9dd5e0d09cb8",
//   "69439f8bc28b9dd5e0d09cb9","69439f8bc28b9dd5e0d09cba","69439f8bc28b9dd5e0d09cbb","69439f8bc28b9dd5e0d09cbc",
//   "69439f8bc28b9dd5e0d09cbd","69439f8bc28b9dd5e0d09cbe","69439f8bc28b9dd5e0d09cbf","69439f8bc28b9dd5e0d09cc0",
//   "69439f8bc28b9dd5e0d09cc1","69439f8bc28b9dd5e0d09cc2","69439f8bc28b9dd5e0d09cc3","69439f8bc28b9dd5e0d09cc4",
//   "69439f8bc28b9dd5e0d09cc5","69439f8bc28b9dd5e0d09cc6","69439f8bc28b9dd5e0d09cc7","69439f8bc28b9dd5e0d09cc8",
//   "69439f8bc28b9dd5e0d09cc9","69439f8bc28b9dd5e0d09cca","69439f8bc28b9dd5e0d09ccb","69439f8bc28b9dd5e0d09ccc",
//   "69439f8bc28b9dd5e0d09ccd","69439f8bc28b9dd5e0d09cce","69439f8bc28b9dd5e0d09ccf","69439f8bc28b9dd5e0d09cd0",
//   "69439f8bc28b9dd5e0d09cd1","69439f8bc28b9dd5e0d09cd2","69439f8bc28b9dd5e0d09cd3","69439f8bc28b9dd5e0d09cd4",
//   "69439f8bc28b9dd5e0d09cd5","69439f8bc28b9dd5e0d09cd6","69439f8bc28b9dd5e0d09cd7","69439f8bc28b9dd5e0d09cd8",
//   "69439f8bc28b9dd5e0d09cd9","69439f8bc28b9dd5e0d09cda","69439f8bc28b9dd5e0d09cdb","69439f8bc28b9dd5e0d09cdc",
//   "69439f8bc28b9dd5e0d09cdd","69439f8bc28b9dd5e0d09cde","69439f8bc28b9dd5e0d09cdf","69439f8bc28b9dd5e0d09ce0",
//   "69439f8bc28b9dd5e0d09ce1","69439f8bc28b9dd5e0d09ce2","69439f8bc28b9dd5e0d09ce3","69439f8bc28b9dd5e0d09ce4",
//   "69439f8bc28b9dd5e0d09ce5","69439f8bc28b9dd5e0d09ce6","69439f8bc28b9dd5e0d09ce7","69439f8bc28b9dd5e0d09ce8",
//   "69439f8bc28b9dd5e0d09ce9","69439f8bc28b9dd5e0d09cea","69439f8bc28b9dd5e0d09ceb","69439f8bc28b9dd5e0d09cec",
//   "69439f8bc28b9dd5e0d09ced","69439f8bc28b9dd5e0d09cee","69439f8bc28b9dd5e0d09cef","69439f8bc28b9dd5e0d09cf0",
//   "69439f8bc28b9dd5e0d09cf1","69439f8bc28b9dd5e0d09cf2","69439f8bc28b9dd5e0d09cf3","69439f8bc28b9dd5e0d09cf4",
//   "69439f8bc28b9dd5e0d09cf5","69439f8bc28b9dd5e0d09cf6","69439f8bc28b9dd5e0d09cf7","69439f8bc28b9dd5e0d09cf8",
//   "69439f8bc28b9dd5e0d09cf9","69439f8bc28b9dd5e0d09cfa","69439f8bc28b9dd5e0d09cfb","69439f8bc28b9dd5e0d09cfc",
//   "69439f8bc28b9dd5e0d09cfd","69439f8bc28b9dd5e0d09cfe","69439f8bc28b9dd5e0d09cff","69439f8bc28b9dd5e0d09d00",
//   "69439f8bc28b9dd5e0d09d01","69439f8bc28b9dd5e0d09d02","69439f8bc28b9dd5e0d09d03","69439f8bc28b9dd5e0d09d04",
//   "69439f8bc28b9dd5e0d09d05","69439f8bc28b9dd5e0d09d06","69439f8bc28b9dd5e0d09d07","69439f8bc28b9dd5e0d09d08",
//   "69439f8bc28b9dd5e0d09d09","69439f8bc28b9dd5e0d09d0a","69439f8bc28b9dd5e0d09d0b","69439f8bc28b9dd5e0d09d0c",
//   "69439f8bc28b9dd5e0d09d0d","69439f8bc28b9dd5e0d09d0e","69439f8bc28b9dd5e0d09d0f",
//   "69439f8bc28b9dd5e0d09d10","69439f8bc28b9dd5e0d09d11","69439f8bc28b9dd5e0d09d12"
// ];

// const ETHINICIY_ID = [
//   "68cbe8f3fcf6a700110fb89d",
//   "68cbe8f3fcf6a700110fb89f",
//   "68cbe8f3fcf6a700110fb8a0",
//   "68cbe8f3fcf6a700110fb8a1",
//   "68cbe8f3fcf6a700110fb8a2",
//   "68cbe8f3fcf6a700110fb8a3",
//   "68cbe8f3fcf6a700110fb8a4",
//   "68cbe8f3fcf6a700110fb8a5",
//   "68cbe8f3fcf6a700110fb89e",
//   "6943d7fbe0319234cc1575c2",
//   "694540388917aa0012c6f33c",
//   "69454056a25bfb00122f4859",
//   "694540f78917aa0012c6f343",
//   "6945410e7362e20012efbbd1",
//   "6945417eb8bafa0012230e06",
//   "694541e4b8bafa0012230e0d"
// ];

// // // female image
// const IMAGES = [
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766483792387-brian-wangenheim-zwU-ruI2aUU-unsplash_20251223095632387.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766483800423-behrouz-sasani-sNIjfHYSwHc-unsplash_20251223095640423.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766483803242-navid-sohrabi-22oaLWWo_sY-unsplash_20251223095643242.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766483806565-russell-ferrer-dXg-SHZbFOw-unsplash_20251223095646565.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766483810281-arturo-anez-V7QcRnuv-5k-unsplash_20251223095650281.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766483812861-omid-armin-65JdPsTtL-0-unsplash_20251223095652861.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766483816433-angello-pro-UqmWgLHoxW8-unsplash_20251223095656433.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766483819602-olga-zhuravleva-5c-B5MGiv2c-unsplash_20251223095659602.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766483822444-junior-moran-Ni6UqwIQh4M-unsplash_20251223095702444.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766483825687-dalton-smith-l8OuuTrrotU-unsplash_20251223095705687.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766483833578-behrouz-sasani-uFJT4ehWVzE-unsplash_20251223095713579.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766483837210-kyle-smith-tlowJ-oYAjU-unsplash_20251223095717210.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766483842147-jon-ly-ADBOC3UP4eQ-unsplash_20251223095722147.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766483846264-brian-lawson-gfR5vwWe0bw-unsplash_20251223095726264.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766483849163-brian-lawson-4A5ItQSnbNY-unsplash_20251223095729163.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766483851815-michael-dam-mEZ3PoFGs_k-unsplash_20251223095731815.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766483855178-andrey-zvyagintsev-RWDB9X1CvwA-unsplash_20251223095735178.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766483858271-bishesh-shrestha-NtTRTWwaULw-unsplash_20251223095738271.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766483862650-bishesh-shrestha-2b7QWN-XG_o-unsplash_20251223095742650.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766483866041-brian-lawson-a-mtphgCGo8-unsplash_20251223095746041.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766483869030-olga-zhuravleva-6fAlS0h9vU8-unsplash_20251223095749030.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766483872027-alexandru-zdrobau-BGz8vO3pK8k-unsplash_20251223095752027.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766483876188-brian-lawson-FV2CegHV31A-unsplash_20251223095756188.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766483879849-dillon-kydd-npTIcA--Q4Y-unsplash_20251223095759849.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766483885110-olga-zhuravleva-A3MleA0jtoE-unsplash_20251223095805110.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766483887301-suheyl-burak-vlqtzHsZKRo-unsplash_20251223095807301.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766483889988-atikh-bana-2c0midsQKe0-unsplash_20251223095809988.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766483894047-alexander-krivitskiy-8gGUMSQQz0E-unsplash_20251223095814047.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766483900954-khaled-ghareeb-7KKwt_BsE54-unsplash_20251223095820954.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766483905836-fineas-gavre-CE_1ZBQ__Ns-unsplash_20251223095825837.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766483911198-gabriel-silverio-K_b41GaWC5Y-unsplash_20251223095831198.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766483920023-ph-m-duy-quang-QGr6H7pri-Q-unsplash_20251223095840023.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766483924890-rafaella-mendes-diniz-et_78QkMMQs-unsplash_20251223095844890.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766483928824-pouriya-kafaei-dNmmjX2Owxk-unsplash_20251223095848824.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766483933819-andrea-bertozzini-VoertyDYyjA-unsplash_20251223095853819.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766483936460-ayo-ogunseinde-6W4F62sN_yI-unsplash_20251223095856460.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766483940451-houcine-ncib-B4TjXnI0Y2c-unsplash_20251223095900451.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766483946390-jeffery-erhunse-Z9lbmEjyYjU-unsplash_20251223095906390.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766483953342-ospan-ali-6xv4A1VA1rU-unsplash_20251223095913342.jpg",
//         "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766484952171-michael-austin-sgOeia0hRN8-unsplash_20251223101552171.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766484957315-daniele-la-rosa-messina-w_5DfWl2ihE-unsplash_20251223101557315.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766484962131-farshad-sheikhzadeh-Oxmc8d-axcU-unsplash_20251223101602131.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766484965861-agung-setiawan-uqIQkQE0gtM-unsplash_20251223101605861.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766484973715-michael-austin-oM9vBc8FZRI-unsplash_20251223101613715.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766484977189-mihaela-claudia-puscas-wBzepnIadF0-unsplash_20251223101617189.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766484979891-vlad-rudkov-Q_ZIfj3Ahro-unsplash_20251223101619891.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766484992095-shalom-ejiofor-nWWzZiAjs4Y-unsplash__1__20251223101632095.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766484998899-shalom-ejiofor-nWWzZiAjs4Y-unsplash_20251223101638899.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766485002429-behrouz-sasani-RUZENemwKy8-unsplash_20251223101642429.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766485006783-arturo-anez-tt5r7DYIQm4-unsplash_20251223101646783.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766485011226-arturo-anez-SQ-SRMQfxn0-unsplash_20251223101651226.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766485015762-arturo-anez-l09BBHLiML0-unsplash_20251223101655762.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766485018926-arturo-anez-tjp81cG4U1Y-unsplash_20251223101658926.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766485022289-arturo-anez-5qhnRM4zcP8-unsplash_20251223101702289.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766485025394-daniele-la-rosa-messina-O4x83H1jVeY-unsplash_20251223101705394.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766485032678-panagiotis-falcos-h2nNs62IoCE-unsplash_20251223101712678.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766485040045-jonas-horsch-ni2uHFtetzE-unsplash_20251223101720045.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766485050167-brian-wangenheim-zwU-ruI2aUU-unsplash_20251223101730167.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766485063925-behrouz-sasani-sNIjfHYSwHc-unsplash_20251223101743925.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766485066567-navid-sohrabi-22oaLWWo_sY-unsplash_20251223101746567.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766485071884-russell-ferrer-dXg-SHZbFOw-unsplash_20251223101751884.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766485075927-arturo-anez-V7QcRnuv-5k-unsplash_20251223101755927.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766485079277-omid-armin-65JdPsTtL-0-unsplash_20251223101759277.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766485083009-angello-pro-UqmWgLHoxW8-unsplash_20251223101803009.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766485087183-olga-zhuravleva-5c-B5MGiv2c-unsplash_20251223101807183.jpg",
//      "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766485517177-junior-moran-Ni6UqwIQh4M-unsplash_20251223102517177.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766485521682-behrouz-sasani-uFJT4ehWVzE-unsplash_20251223102521682.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766485524373-kyle-smith-tlowJ-oYAjU-unsplash_20251223102524373.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766485529916-jon-ly-ADBOC3UP4eQ-unsplash_20251223102529916.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766485534778-brian-lawson-gfR5vwWe0bw-unsplash_20251223102534778.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766485537453-brian-lawson-4A5ItQSnbNY-unsplash_20251223102537453.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766485539135-michael-dam-mEZ3PoFGs_k-unsplash_20251223102539135.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766485541786-andrey-zvyagintsev-RWDB9X1CvwA-unsplash_20251223102541786.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766485545511-bishesh-shrestha-NtTRTWwaULw-unsplash_20251223102545511.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766485550021-rayul-_M6gy9oHgII-unsplash_20251223102550021.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766485553304-houcine-ncib-B4TjXnI0Y2c-unsplash_20251223102553304.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766485557403-jeffery-erhunse-Z9lbmEjyYjU-unsplash_20251223102557403.jpg",
//         "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766485756636-omar-elsharawy-0urE8CCi-To-unsplash_20251223102916636.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766485765941-joshua-rondeau-ZnHRNtwXg6Q-unsplash__1__20251223102925941.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766485768823-jennifer-burk-o5NBw8GTnMc-unsplash_20251223102928823.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766485775809-stefan-stefancik-QXevDflbl8A-unsplash__1__20251223102935809.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766485785276-michael-dam-mEZ3PoFGs_k-unsplash__1__20251223102945276.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766485788158-senjuti-kundu-JfolIjRnveY-unsplash_20251223102948158.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766485791755-alex-mccarthy-RGKdWJOUFH0-unsplash_20251223102951755.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766485794884-michael-austin-sgOeia0hRN8-unsplash_20251223102954885.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766485797706-daniele-la-rosa-messina-w_5DfWl2ihE-unsplash_20251223102957707.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766485801127-farshad-sheikhzadeh-Oxmc8d-axcU-unsplash_20251223103001127.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766485806433-agung-setiawan-uqIQkQE0gtM-unsplash_20251223103006433.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766485814191-michael-austin-oM9vBc8FZRI-unsplash_20251223103014191.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766485817872-mihaela-claudia-puscas-wBzepnIadF0-unsplash_20251223103017872.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766485820901-vlad-rudkov-Q_ZIfj3Ahro-unsplash_20251223103020901.jpg"
// ,
// // // ];

// // const IMAGES = [
//   "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766405965515-jonathon-dorofy-KZ0uH23koWQ-unsplash_20251222121925515.jpg",
//   "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766405560256-joshua-rondeau-ZnHRNtwXg6Q-unsplash_20251222121240256.jpg",
//   "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766406105321-frank-alarcon-dZtgrqgsksg-unsplash_20251222122145321.jpg",
//   "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766406139264-ethan-hoover-mUJJ1seSpmM-unsplash_20251222122219264.jpg",
//   "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766406186230-talen-de-st-croix-EXr_Qif3Vl8-unsplash_20251222122306230.jpg",
//   "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766406313729-nathan-dumlao-zI4qr861JpU-unsplash_20251222122513729.jpg",
//   "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766474746881-nathan-dumlao-zI4qr861JpU-unsplash_20251223072546882.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766474751876-smiling-young-businessman-walking-outdoors_20251223072551876.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766474760363-new-york-city_20251223072600363.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766474765630-smiling-portrait-businessman-holding-takeaway-coffee-cup-digital-tablet-showing-victory-gesture_20251223072605630.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766474775087-smiley-man-with-coffee-cup-front-view_20251223072615087.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766474784017-happy-male-tourist-leaning-railing-listening-music_20251223072624017.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766474789418-male-traveler-with-camera-local-park_20251223072629419.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766474791843-portrait-man-smiling-city_20251223072631843.jpg",
//      "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766475364938-gregory-hayes-h5cd51KXmRQ-unsplash_20251223073604939.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766475368041-albert-dera-ILip77SbmOE-unsplash__1__20251223073608042.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766475371420-drew-hays-Kt8eGw8_S8Y-unsplash_20251223073611420.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766475373922-mohammad-faruque-TwuPHbcQ57w-unsplash_20251223073613922.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766475377274-janko-ferlic-G-jo31ESuRE-unsplash_20251223073617274.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766475382373-john-mark-arnold-xbBaOa_dd5I-unsplash_20251223073622373.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766475388225-mitchell-luo-ymo_yC_N_2o-unsplash_20251223073628225.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766475395537-gabriel-arancibia-wYvCXc-xUTg-unsplash_20251223073635537.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766475398806-albert-dera-ILip77SbmOE-unsplash_20251223073638806.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766475402742-smiling-young-businessman-walking-outdoors_20251223073642742.jpg",
//         "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766475495833-lachlan-dempsey-6VPEOdpFNAs-unsplash_20251223073815833.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766475499101-ana-nichita-BI91NrppE38-unsplash_20251223073819101.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766475502561-ludovic-migneault-EZ4TYgXPNWk-unsplash_20251223073822561.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766475506910-janko-ferlic-G-jo31ESuRE-unsplash__1__20251223073826910.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766475512455-mitchell-luo-ymo_yC_N_2o-unsplash__1__20251223073832455.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766475516652-charlie-green-3JmfENcL24M-unsplash_20251223073836652.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766475519820-gregory-hayes-h5cd51KXmRQ-unsplash_20251223073839820.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766475523064-albert-dera-ILip77SbmOE-unsplash__1__20251223073843064.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766475526296-drew-hays-Kt8eGw8_S8Y-unsplash_20251223073846296.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766475615038-dmitry-vechorko-E9PFbdhZmus-unsplash_20251223074015038.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766475618359-stephanie-tuohy-NDCy2-9JhUs-unsplash_20251223074018359.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766475621105-duman-photography-GvvtE31b0JI-unsplash_20251223074021105.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766475624083-behrouz-sasani-cEnSr1WRHUY-unsplash_20251223074024083.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766475626481-lachlan-dempsey-6VPEOdpFNAs-unsplash__1__20251223074026481.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766475630180-logan-weaver-lgnwvr-p0B7ueoZz8E-unsplash_20251223074030180.jpg",
//     "https://pub-21e03081050a4e96b966c284620cc707.r2.dev/1766475633604-rayul-_M6gy9oHgII-unsplash_20251223074033604.jpg"

// ];

//  (async () => {
//   try {
//     await mongoose.connect(config.mongoose.url);
//     console.log("✅ MongoDB connected");

// for (let i = 1; i <= 500; i++) {
//   const user = await User.create({
//     phone_number: `9615301${100 + i}`,
//     phone_code: "+91",
//     is_mobile_verified: true,
//     is_registered: true,
//   });

//   await UserProfile.create({
//     user_id: user._id,
//     name: `John ${i}`,
//     gender: new mongoose.Types.ObjectId("68cbe8f3fcf6a700110fb6c5"),
//     dates_days: randomMany(DATE_DAYS).map(oid),
//     interested_in: new mongoose.Types.ObjectId("68cbe8f3fcf6a700110fb8c4"),
//     looking_for: randomMany(LOOKING_FOR, 2, 4).map(oid),
//     work: oid(randomOne(WORK)),
//     about_yourself: "I am a dummy user",
//     idea_of_great_date: "I am a dummy user",
//     favorite_dates: randomMany(FAV_DATE, 2, 4).map(oid),
//     ethnicity: oid(randomOne(ETHINICIY_ID)),
//     exercise: oid(randomOne(EXERCISE)),
//     diet: oid(randomOne(DIET)),
//     smoking: oid(randomOne(SMOKING)),
//     drink: oid(randomOne(DRINK)),
//     main_img: randomOne(IMAGES),
//     images: randomMany(IMAGES, 2, 4),
//     // social_links: [
       
//     //   ],
//     education: {
//         Institute_name: "University of Test",
//         major_degree: "Computer Science",
//         graduation_year: 2015,
//       },
//     education_level: oid(randomOne(EDUCATION_LEVEL)),
//     religion: oid(randomOne(RELIGION)),
//     kids: oid(randomOne(KIDS)),
//     // family_plan: oid(randomOne(FAMILY_PLAN)),
//     pets: oid(randomOne(PETS)),
//     zodiac: oid(randomOne(ZODIAC)),
//     politics: oid(randomOne(POLITCS)),
//     languages: randomMany(LANGUAGES, 2, 4).map(oid),
//     height: String(160 + Math.floor(Math.random() * 25)),
//     date_of_birth: new Date(1995 + Math.floor(Math.random() * 8), 5, 15),
//     cultural_background: randomMany(CULTURAL_BACK_ID, 2, 4).map(oid),
//     location: {
//       type: "Point",
//       coordinates: [
//         -118.24 + Math.random() * 0.2,
//         34.05 + Math.random() * 0.2,
//       ],
//       address: "San Diego, CA, USA",
//     },
//     location_visibility: true,

//     hometown: {
//       type: "Point",
//       coordinates: [
//         -118.24 + Math.random() * 0.2,
//         34.05 + Math.random() * 0.2,
//       ],
//       address: "San Diego, CA, USA",
//     },
//     hometown_visibility: true,

//     // occupation: {
//     //     company_name: "Tech Corp",
//     //     job_title: "Software Engineer",
//     //   },
//       occupation_visibility: true,
//   });
// }
//    console.log("✅ Seeding done");
//   } catch (err) {
//     console.error(err);
//     await mongoose.disconnect();
//   }
// })();

const mongoose = require('mongoose');
const { UserProfile } = require('../models'); // path check kar lena
const config = require('../config/config');

const MONGO_URL = config.mongoose.url; // ⚠️ apna DB name

async function fixWorkForAllProfiles() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('✅ MongoDB connected');

    const result = await UserProfile.updateMany(
      { work: { $type: 'objectId' } },
      [
        {
          $set: {
            work: ['$work']
          }
        }
      ]
    );

    console.log('✅ Updated documents:', result.modifiedCount);
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
  }
}

fixWorkForAllProfiles();

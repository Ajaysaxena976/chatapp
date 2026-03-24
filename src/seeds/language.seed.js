const { Language } = require('../models');

const languageSeeds = [{
  "name": "English",
  "index": 1
},
{
  "name": "Spanish",
  "index": 2
},
{
  "name": "French",
  "index": 3
},
{
  "name": "German",
  "index": 4
},
{
  "name": "Italian",
  "index": 5
},
{
  "name": "Portuguese",
  "index": 6
},
{
  "name": "Russian",
  "index": 7
},
{
  "name": "Chinese",
  "index": 8
},
{
  "name": "Japanese",
  "index": 9
},
{
  "name": "Korean",
  "index": 10
},
{
  "name": "Arabic",
  "index": 11
},
{
  "name": "Hindi",
  "index": 12
},
{
  "name": "Dutch",
  "index": 13
},
{
  "name": "Swedish",
  "index": 14
},
{
  "name": "Other",
  "index": 15
},
{
  "name": "Mandarin Chinese",
  "index": 16
},
{
  "name": "Arabic (Modern Standard)",
  "index": 17
},
{
  "name": "Bengali",
  "index": 18
},
{
  "name": "Indonesian",
  "index": 19
},
{
  "name": "Urdu",
  "index": 20
},
{
  "name": "Nigerian Pidgin",
  "index": 21
},
{
  "name": "Egyptian Arabic",
  "index": 22
},
{
  "name": "Marathi",
  "index": 23
},
{
  "name": "Vietnamese",
  "index": 24
},
{
  "name": "Telugu",
  "index": 25
},
{
  "name": "Hausa",
  "index": 26
},
{
  "name": "Turkish",
  "index": 27
},
{
  "name": "Yue Chinese (Cantonese)",
  "index": 28
},
{
  "name": "Wu Chinese (Shanghainese)",
  "index": 29
},
{
  "name": "Iranian Persian",
  "index": 30
},
{
  "name": "Thai",
  "index": 31
},
{
  "name": "Javanese",
  "index": 32
},
{
  "name": "Gujarati",
  "index": 33
},
{
  "name": "Levantine Arabic",
  "index": 34
},
{
  "name": "Amharic",
  "index": 35
},
{
  "name": "Kannada",
  "index": 36
},
{
  "name": "Bhojpuri",
  "index": 37
}
]

const seedLanguage = async () => {
  try {
    const count = await Language.countDocuments().catch((e) => {console.log(e)});
    if (count === 0) {
      await Language.insertMany(languageSeeds).catch((e) => {console.log(e)});
      console.log('Language seeds inserted successfully');
    }
  } catch (error) {
    console.error('Error seeding Language:', error);
  }
};

module.exports = seedLanguage;
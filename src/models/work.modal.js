const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const workSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  }
});

workSchema.plugin(toJSON);

const Work = mongoose.model('Work', workSchema);

module.exports = Work;
const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const UserDateDaysSchema = mongoose.Schema({
    user_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
    dates_days: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DateDay'
      }],
    
    })

    
UserDateDaysSchema.plugin(toJSON);

const UserDateDays = mongoose.model('UserDateDays', UserDateDaysSchema);

module.exports = UserDateDays;
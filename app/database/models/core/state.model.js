const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StateSchema = new Schema({
  abbreviation: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true }
});

module.exports = mongoose.model('State', StateSchema, 'states');


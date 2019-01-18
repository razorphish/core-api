const mongoose = require('mongoose');
const Schema    = mongoose.Schema;

const RoleSchema = new Schema({
  name            : { type: String, required: true, trim: true },
  normalizedName  : { type: String, required: true, trim: true, uppercase: true }
});

module.exports = mongoose.model('Role', RoleSchema, 'roles');
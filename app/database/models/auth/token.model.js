/** */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TokenSchema = new Schema({
  loginProvider: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  value: { type: String, required: true, trim: true },
  scope: { type: String, required: true, trim: true },
  type: { type: String, required: true, trim: true },
  expiresIn: { type: Number, required: true },
  dateExpire: { type: Date, required: false },
  dateCreated: { type: Date, required: false, default: Date.now }
});

//Compound index
//TokenSchema.index({ userId: 1, loginProvider: 1, name: 1 });

module.exports = mongoose.model('Token', TokenSchema, 'tokens');

/** */
//const mongoose = require('mongoose').set('debug', true);
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TokenSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  loginProvider: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  value: { type: String, required: true, trim: true },
  valueSecret: { type: String, required: false, trim: true },
  scope: { type: String, required: false, trim: true },
  type: { type: String, required: true, trim: true },
  protocol: { type: String, required: true, trim: true },
  expiresIn: { type: Number, required: false },
  origin: { type: String, required: false },
  forceRefresh: { type: Boolean, required: false },
  verifier: { type: String, required: false, trim: true },
  dateExpire: { type: Date, required: false },
  dateCreated: { type: Date, required: true, default: Date.now },
  dateModified: { type: Date, required: true, default: Date.now }
});

//Compound index
//TokenSchema.index({ userId: 1, loginProvider: 1, name: 1 });

//PRE-SAVE
TokenSchema.pre('save', function (next) {
  const token = this;
  const now = new Date();

  if (!token.dateCreated) {
    token.dateCreated = now;
    token.dateModified = now;
  } else {
    token.dateModified = now;
  }

  next();
});

module.exports = mongoose.model('Token', TokenSchema, 'tokens');

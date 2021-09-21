const mongoose = require('mongoose');

const { Schema } = mongoose;

const GoogleSchema = new Schema({
  clientID: { type: String, required: false, trim: true }
});

GoogleSchema.pre('save', (next) => {
  next();
});

module.exports = mongoose.model('Google', GoogleSchema, 'googles');

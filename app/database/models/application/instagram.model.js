const mongoose = require('mongoose');

const { Schema } = mongoose;

const InstagramSchema = new Schema({
  clientID: { type: String, required: false, trim: true }
});

InstagramSchema.pre('save', (next) => {
  next();
});

module.exports = mongoose.model('Instagram', InstagramSchema, 'instagrams');

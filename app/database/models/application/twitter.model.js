const mongoose = require('mongoose');

const { Schema } = mongoose;

const TwitterSchema = new Schema({
  appId: { type: String, required: false, trim: true }
});

TwitterSchema.pre('save', (next) => {
  next();
});

module.exports = mongoose.model('Twitter', TwitterSchema, 'twitters');

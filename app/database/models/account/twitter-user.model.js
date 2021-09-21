/**
 * TwitterUser Schema
 */
const mongoose = require('mongoose');

const { Schema } = mongoose;

// Parent Schema
const TwitterUserSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    twitterId: { type: String, required: true, trim: true },
    tokenId: { type: Schema.Types.ObjectId, ref: 'Token' },
    name: { type: String, required: true, trim: true },
    screenName: { type: String, required: true },
    location: { type: String, required: false },
    description: { type: String, required: false, trim: true },
    url: { type: String, required: false, trim: true },
    payload: { type: String, required: true, trim: true },
    dateCreated: { type: Date, required: true, default: Date.now },
    dateModified: { type: Date, required: true, default: Date.now }
  },
  {
    toJSON: {
      virtuals: true
    }
  }
);

TwitterUserSchema.pre('save', function (next) {
  if (this.dateModified) {
    this.dateModified = new Date();
  }
  next();
});

module.exports = mongoose.model(
  'TwitterUser',
  TwitterUserSchema,
  'twitterUsers'
);

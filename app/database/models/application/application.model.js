/**
 * Account Schema
 */
const mongoose = require('mongoose');
const Social = require('./social.model');
const Firebase = require('./firebase.model');

const { Schema } = mongoose;

// /////////////////////// Parent Schema
const ApplicationSchema = new Schema(
  {
    name: { type: String, required: true, index: { unique: true } },
    shortName: { type: String, required: false },
    url: { type: String },
    statusId: {
      type: String,
      enum: ['active', 'inactive', 'disabled', 'pending', 'archived'],
      required: true,
      trim: true
    },
    social: { type: Social.schema, required: false },
    firebase: { type: Firebase.schema, required: false },
    dateCreated: { type: Date, required: true, default: Date.now },
    dateModified: { type: Date, required: true, default: Date.now }
  },
  {
    toJSON: { virtuals: true }
  }
);

ApplicationSchema.pre('save', function (next) {
  if (this._id) {
    this.dateModified = new Date();
  }
  next();
});

ApplicationSchema.virtual('settings', {
  ref: 'ApplicationSetting', // The model to use
  localField: '_id', // Find items where `localField`
  foreignField: 'applicationId', // is equal to `foreignField`
  // If `justOne` is true, 'members' will be a single doc as opposed to
  // an array. `justOne` is false by default.
  justOne: true
  // options: {
  //     sort: {
  //         sortOrder: 1
  //     }
  // } // Query options, see http://bit.ly/mongoose-query-options
});

module.exports = mongoose.model(
  'Application',
  ApplicationSchema,
  'applications'
);

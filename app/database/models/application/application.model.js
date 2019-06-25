/**
 * Account Schema
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Social = require('./social.model');
const Firebase = require('./firebase.model');

///////////////////////// Parent Schema
const ApplicationSchema = new Schema({
    name: { type: String, required: true, index: { unique: true } },
    shortName: { type: String, required: false },
    url: { type: String },
    statusId: { type: String, enum: ['active', 'inactive', 'disabled', 'pending', 'archived'], required: true, trim: true },
    social: { type: Social.schema, required: false},
    firebase: { type: Firebase.schema, required: false},
    dateCreated: { type: Date, required: true, default: Date.now },
    dateModified: { type: Date, required: true, default: Date.now }
});


ApplicationSchema.pre('save', function (next) {
    if (this.dateModified) {
        this.dateModified = new Date();
    }
    next();
});

module.exports = mongoose.model('Application', ApplicationSchema, 'applications');

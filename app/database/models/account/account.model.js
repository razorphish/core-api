/**
 * Account Schema
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-type-email');

///////////////////////// Parent Schema
const AccountSchema = new Schema({
    statusId: { type: String, enum: ['active', 'inactive', 'disabled', 'pending', 'archived', 'suspended'], required: true, trim: true },
    email: {
        type: mongoose.SchemaTypes.Email, required: true, index: { unique: true }
    }, //allowBlank:true,
    dateCreated: { type: Date, required: true, default: Date.now },
    dateModified: { type: Date, required: true, default: Date.now }
});


AccountSchema.pre('save', function (next) {
    if (this.dateModified) {
        this.dateModified = new Date();
    }
    next();
});

module.exports = mongoose.model('Account', AccountSchema, 'accounts');

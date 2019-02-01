/**
 *
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Upload = require('../core/upload.model');
const Note = require('../core/note.model');
const Setting = require('../core/setting.model');
const Activity = require('../core/activity.model');
const Update = require('../core/update.model');
const Share = require('../core/share.model');

const ItemSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, required: true },
    typeId: { type: String, enum: ['Sale', 'Fundraiser', 'Video', 'Patreon', 'TeamPage', 'TeamMemberPage'], required: true },
    transactionTypeId: { type: String, enum: ['Donation', 'Item'] },
    categoryId: { type: String },
    statusId: { type: String, enum: ['active', 'deleted', 'expired', 'hidden', 'preliminary', 'private', 'suspended'] },
    title: { type: String, required: true, maxlength: 50 },
    shortSummary: { type: String, maxlength: 140 },
    description: { type: String, required: true },
    startDate: { type: Date },
    endDate: { type: Number },
    permalink: { type: String, maxlength: 100 },
    featured: { type: Boolean, required: true, default: false },
    goalAmount: { type: Number },
    enableSocialSharing: { type: Boolean, required: true },
    pageColor: { type: String, required: false, maxlength: 20 },
    pageSkin: { type: String, required: false, maxlength: 20 },
    pageLayout: { type: String, required: false, maxlength: 20 },
    uploads: { type: [Upload.schema] },
    notes: { type: [Note.schema] },
    settings: { type: Setting.schema },
    activity: { type: [Activity.schema] },
    shares: { type: [Share.schema] },
    update: { type: [Update.schema]},
    dateCreated: { type: Date, required: true, default: Date.now },
    dateModified: { type: Date, required: true, default: Date.now }
});

ItemSchema.pre('save', function (next) {
    if (this.dateModified) {
        this.dateModified = new Date();
    }
    next();
});

module.exports = mongoose.model('Item', ItemSchema, 'items');

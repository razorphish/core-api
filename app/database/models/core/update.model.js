const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UpdateSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, required: true },
    title: { type: String, required: true, maxlength: 128 },
    content: { type: String, required: true },
    statusId: { type: String, required: true, enum: ['active', 'deleted', 'hidden', 'private'] },
    postedToFacebook: { type: Boolean, required: true },
    postedToTwitter: { type: Boolean, required: true },
    postedToEmail: { type: Boolean, required: true },
    dateCreated: { type: Date, required: true, default: Date.now },
    dateModified: { type: Date, required: true, default: Date.now }
});

module.exports = mongoose.model('Update', UpdateSchema, 'updates');
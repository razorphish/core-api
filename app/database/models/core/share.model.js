const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ShareSchema = new Schema({
    userId: { type: Schema.Types.ObjectId },
    socialId: { type: String },
    firstName: { type: String, maxlength: 50 },
    lastName: { type: String, maxlength: 50 },
    email: { type: String },
    recipients: { type: String },
    typeId: { type: String, required: true, enum: ['email', 'text', 'email', 'mobile', 'social', 'other'] },
    dateCreated: { type: Date, required: true, default: Date.now },
    dateModified: { type: Date, required: true, default: Date.now }
})

module.exports = mongoose.model('Share', ShareSchema, 'shares');

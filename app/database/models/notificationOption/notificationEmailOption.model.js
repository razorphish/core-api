// Notification Option email
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationEmailOptionSchema = new Schema({
    name: { type: String, required: true },
    subject: { type: String, required: true },
    text: { type: String, required: false, trim: true },
    html: { type: String, required: false, trim: true },
    fromEmailAddress: { type: String, required: false, trim: true },
    fromName: { type: String, required: false, trim: true },
    dateCreated: { type: Date, required: true, default: Date.now }
});

NotificationEmailOptionSchema.pre('save', function (next) {
    //const notificationOption = this;

    next();
});

module.exports = mongoose.model('NotificationEmailOption', NotificationEmailOptionSchema, 'notificationEmailOptions');
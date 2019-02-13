// Mailchimp
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const NotificationOption = require('../notificationOption/notificationOption.model')

const WishlistAppSettingSchema = new Schema({
    notifications: { type: [NotificationOption.schema], required: true },
    dateCreated: { type: Date, required: true, default: Date.now }
});

module.exports = mongoose.model('WishlistAppSetting', WishlistAppSettingSchema, 'wishlistAppSettings');
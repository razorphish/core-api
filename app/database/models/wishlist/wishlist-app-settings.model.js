// Wishlist App Settings
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const NotificationOption = require('../notificationOption/notificationOption.model')
const NotificationEmailOption = require('../notificationOption/notificationEmailOption.model')

const WishlistAppSettingSchema = new Schema({
    notifications: { type: [NotificationOption.schema], required: true },
    emailNotifications: { type: [NotificationEmailOption.schema], required: true },
    dateCreated: { type: Date, required: true, default: Date.now }
});

WishlistAppSettingSchema.pre('save', function (next) {
    const settings = this;
    next();
});

module.exports = mongoose.model('WishlistAppSetting', WishlistAppSettingSchema, 'wishlistAppSettings');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WishlistNotificationSchema = new Schema({
    wishlistId: { type: Schema.Types.ObjectId, ref: 'Wishlist', required: true, trim: true },
    endpoint: { type: String, required: true, trim: true },
    expirationTime: { type: String, required: false },
    keys: {
        auth: {
            type: String
        },
        p256dh: {
            type: String
        }
    },
    dateCreated: { type: Date, required: true, default: Date.now },
    dateModified: { type: Date, required: true, default: Date.now }
});

WishlistNotificationSchema.pre('save', function (next) {
    if (this.dateModified) {
        this.dateModified = new Date();
    }
    next();
});

module.exports = mongoose.model('WishlistNotification', WishlistNotificationSchema, 'wishlistNotifications');

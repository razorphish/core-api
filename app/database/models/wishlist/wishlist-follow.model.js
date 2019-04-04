const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WishlistFollowSchema = new Schema({
    wishlistId: { type: Schema.Types.ObjectId, ref: 'Wishlist', required: true, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, trim: true },
    notifiedOnAddItem: { type: Boolean, required: true, default: true },
    notifiedOnRemoveItem: { type: Boolean, required: true, default: false },
    notifyOnCompletion: { type: Boolean, required: true, default: false },
    dateCreated: { type: Date, required: true, default: Date.now },
    dateModified: { type: Date, required: true, default: Date.now }
});

WishlistFollowSchema.pre('save', function (next) {
    if (this.dateModified) {
        this.dateModified = new Date();
    }
    next();
});

module.exports = mongoose.model('WishlistFollow', WishlistFollowSchema, 'wishlistFollows');

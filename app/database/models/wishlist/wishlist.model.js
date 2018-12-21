const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Preference = require('./wishlist-preference.model');

const WishlistSchema = new Schema({
    name: { type: String, required: true, trim: true },
    accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true, trim: true },
    preferences: { type: Preference.schema, required: true },
    dateCreated: { type: Date, required: true, default: Date.now },
    dateModified: { type: Date, required: true, default: Date.now }
});

WishlistSchema.pre('save', function (next) {
    if (this.dateModified) {
        this.dateModified = new Date();
    }
    next();
});

module.exports = mongoose.model('Wishlist', WishlistSchema, 'wishlist');

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Preference = require('./wishlist-preference.model');

const WishlistSchema = new Schema({
    name: { type: String, required: true, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, trim: true },
    preferences: { type: Preference.schema, required: true },
    statusId: {
        type: String,
        required: true,
        enum: ['active', 'inactive', 'disabled', 'pending', 'archived', 'suspended', 'deleted'],
        default: 'active'
    },
    Privacy: {
        type: String,
        required: true,
        enum: ['Private', 'Public'],
        default: 'Public'
    },
    items: { type: Schema.Types.ObjectId, ref: 'WishlistItem' },
    dateCreated: { type: Date, required: true, default: Date.now },
    dateModified: { type: Date, required: true, default: Date.now }
}, { toJSON: { virtuals: true } });

///PRE _SAVE
WishlistSchema.pre('save', function (next) {
    if (this.dateModified) {
        this.dateModified = new Date();
    }
    next();
});

WishlistSchema.virtual('shares', {
    ref: 'WishlistShare', // The model to use
    localField: '_id', // Find people where `localField`
    foreignField: 'wishlistId', // is equal to `foreignField`
    // If `justOne` is true, 'members' will be a single doc as opposed to
    // an array. `justOne` is false by default.
    justOne: false,
    options: {
        sort: {
            name: -1
        },
        limit: 5
    } // Query options, see http://bit.ly/mongoose-query-options
});

WishlistSchema.virtual('notifications', {
    ref: 'WishlistNotification', // The model to use
    localField: '_id', // Find people where `localField`
    foreignField: 'wishlistId', // is equal to `foreignField`
    // If `justOne` is true, 'members' will be a single doc as opposed to
    // an array. `justOne` is false by default.
    justOne: false
});

module.exports = mongoose.model('Wishlist', WishlistSchema, 'wishlists');

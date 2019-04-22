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
    privacy: {
        type: String,
        required: true,
        enum: ['private', 'public'],
        default: 'public'
    },
    //items: { type: [WishlistItem.schema], ref: 'WishlistItem' },
    dateExpire: { type: Date, required: false },
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

WishlistSchema.virtual('items', {
    ref: 'WishlistItem', // The model to use
    localField: '_id', // Find people where `localField`
    foreignField: 'wishlistId', // is equal to `foreignField`
    // If `justOne` is true, 'members' will be a single doc as opposed to
    // an array. `justOne` is false by default.
    justOne: false,
    options: {
        sort: {
            sortOrder: 1
        }
    } // Query options, see http://bit.ly/mongoose-query-options
});

WishlistSchema.virtual('follows', {
    ref: 'WishlistFollow', // The model to use
    localField: '_id', // Find people where `localField`
    foreignField: 'wishlistId', // is equal to `foreignField`
    // If `justOne` is true, 'members' will be a single doc as opposed to
    // an array. `justOne` is false by default.
    justOne: false,
    options: {

    } // Query options, see http://bit.ly/mongoose-query-options
});

module.exports = mongoose.model('Wishlist', WishlistSchema, 'wishlists');

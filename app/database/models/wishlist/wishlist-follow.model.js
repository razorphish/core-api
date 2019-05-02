const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WishlistFollowSchema = new Schema(
    {
        wishlistId: { type: Schema.Types.ObjectId, ref: 'Wishlist', required: true, trim: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, trim: true },
        notifiedOnAddItem: { type: Boolean, required: true, default: true },
        notifiedOnRemoveItem: { type: Boolean, required: true, default: false },
        notifiedOnCompletion: { type: Boolean, required: true, default: false },
        statusId: { type: String, required: true, enum: ['active', 'deleted'], default: 'active' },
        dateCreated: { type: Date, required: true, default: Date.now },
        dateModified: { type: Date, required: true, default: Date.now }
    }, {
        toJSON: { virtuals: true }
    });

WishlistFollowSchema.pre('save', function (next) {
    if (this.dateModified) {
        this.dateModified = new Date();
    }
    next();
});

// WishlistFollowSchema.virtual('wishlist', {
//     ref: 'Wishlist', // The model to use
//     localField: '_id', // Find people where `localField`
//     foreignField: 'wishlistId', // is equal to `foreignField`
//     // If `justOne` is true, 'members' will be a single doc as opposed to
//     // an array. `justOne` is false by default.
//     justOne: true,
//     //options: { sort: { 'dateExpire': -1 }//, limit: 5 
//     //} // Query options, see http://bit.ly/mongoose-query-options
// });

module.exports = mongoose.model('WishlistFollow', WishlistFollowSchema, 'wishlistFollows');

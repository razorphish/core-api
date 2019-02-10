const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WishlistShareSchema = new Schema({
    name: { type: String, required: true, trim: true },
    wishlistId: { type: Schema.Types.ObjectId, ref: 'Wishlist', required: true, trim: true },
    sharerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, trim: true },
    shareeId: { type: Schema.Types.ObjectId, ref: 'User', required: true, trim: true },
    shareType: { type: String, required: true, enum: ['text', 'email', 'mobile', 'social', 'other'] },
    statusId: {
        type: String,
        required: true,
        enum: ['active', 'inactive', 'disabled', 'pending', 'archived', 'suspended', 'deleted'],
        default: 'active'
    },
    dateCreated: { type: Date, required: true, default: Date.now },
    dateModified: { type: Date, required: true, default: Date.now }
});

WishlistShareSchema.pre('save', function (next) {
    if (this.dateModified) {
        this.dateModified = new Date();
    }
    next();
});

module.exports = mongoose.model('WishlistShare', WishlistShareSchema, 'wishlistShares');

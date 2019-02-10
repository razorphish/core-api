const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WishlistItemSchema = new Schema({
    wishListId: { type: Schema.Types.ObjectId, required: true, ref: 'Wishlist' },
    name: { type: String, required: true, trim: true },
    categoryId: { type: Schema.Types.ObjectId, required: false, trim: true, ref: 'WishlistItemCategory' },
    price: { type: Number, required: false },
    url: { type: String, required: false },
    notes: { type: String, required: false },
    purchased: { type: Boolean, required: true, default: false },
    images: { type: Schema.Types.ObjectId, ref: 'Image' },
    statusId: { type: String, required: true, enum: ['created', 'deleted'], default: 'created' },
    sortOrder: { type: Number, required: true },
    dateCreated: { type: Date, required: true, default: Date.now },
    dateModified: { type: Date, required: true, default: Date.now }
});

WishlistItemSchema.pre('save', function (next) {
    if (this.dateModified) {
        this.dateModified = new Date();
    }
    next();
});


module.exports = mongoose.model('WishlistItem', WishlistItemSchema, 'wishlistItems');


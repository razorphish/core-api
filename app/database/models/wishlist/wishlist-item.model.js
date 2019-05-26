const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WishlistItemSchema = new Schema({
    wishlistId: { type: Schema.Types.ObjectId, required: true, ref: 'Wishlist' },
    categoryId: { type: Schema.Types.ObjectId, required: false, trim: true, ref: 'WishlistItemCategory' },
    purchasedBy: { type: Schema.Types.ObjectId, required: false, ref: 'User' },
    userId: { type: Schema.Types.ObjectId, required: false, ref: 'User' },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: false },
    quantity: { type: Number, require: false },
    url: { type: String, required: false },
    notes: { type: String, required: false },
    purchased: { type: Boolean, required: true, default: false },
    //image: { type: Schema.Types.ObjectId, ref: 'Image' },
    image: { type: String, required: false },
    statusId: { type: String, required: true, enum: ['active', 'deleted'], default: 'active' },
    sortOrder: { type: Number, required: true, default: -1 },
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


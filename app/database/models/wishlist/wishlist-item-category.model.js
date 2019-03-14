const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WishlistItemCategorySchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, trim: true },
    name: { type: String, required: true, trim: true },
    dateCreated: { type: Date, required: true, default: Date.now },
    dateModified: { type: Date, required: true, default: Date.now }
});

WishlistItemCategorySchema.pre('save', function (next) {
    if (this.dateModified) {
        this.dateModified = new Date();
    }
    next();
});

module.exports = mongoose.model('WishlistItemCategory', WishlistItemCategorySchema, 'wishlistItemCategories');


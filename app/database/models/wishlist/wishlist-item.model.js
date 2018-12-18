const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Image = require('../core/image.model');
const Category = require('../account')

const WishlistItemSchema = new Schema({
    name: { type: String, required: true, trim: true },
    category: { type: String, required: false, trim: true },
    price: { type: Number, required: false },
    url: { type: String, required: false },
    notes: { type: String, required: false },
    purchased: { type: Boolean, required: true, default: false },
    images: { type: [Image.schema] },
    typeId: { type: String, required: true, enum: ['created', 'deleted'], default: 'created' },
    dateCreated: { type: Date, required: true, default: Date.now },
    dateModified: { type: Date, required: true, default: Date.now }
});

AccountSchema.pre('save', function (next) {
    if (this.dateModified) {
        this.dateModified = new Date();
    }
    next();
});


module.exports = mongoose.model('WishlistItem', WishlistItemSchema, 'wishlistItem');


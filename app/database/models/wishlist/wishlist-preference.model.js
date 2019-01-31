const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WishlistPreferenceSchema = new Schema({
    includePriceWhenSharing: { type: Boolean, required: true, default: false },
    markPurchasedItem: { type: Boolean, required: true, default: true },
    hideFromMe: { type: Boolean, required: true, default: true },
    currencyUnitSymbol: { type: String, required: true, default: '$' }
});

module.exports = mongoose.model('WishlistPreference', WishlistPreferenceSchema, 'wishlistPreference');


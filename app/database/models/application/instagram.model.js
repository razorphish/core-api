const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InstagramSchema = new Schema({
    clientID: { type: String, required: false, trim: true },
});

InstagramSchema.pre('save', function (next) {
    next();
});

module.exports = mongoose.model('Instagram', InstagramSchema, 'instagrams');
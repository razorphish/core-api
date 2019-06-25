const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GoogleSchema = new Schema({
    clientID: { type: String, required: false, trim: true },
});

GoogleSchema.pre('save', function (next) {
    next();
});

module.exports = mongoose.model('Google', GoogleSchema, 'googles');
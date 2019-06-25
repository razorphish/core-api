const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TwitterSchema = new Schema({
    appId: { type: String, required: false, trim: true },
});

TwitterSchema.pre('save', function (next) {
    next();
});

module.exports = mongoose.model('Twitter', TwitterSchema, 'twitters');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FacebookSchema = new Schema({
    appId: { type: String, required: false, trim: true },
    appSecret: { type: String, required: false, trim: true },
    clientToken: { type: String, required: false, trim: true },
    scope: { type: String, required: false, trim: true }
});

FacebookSchema.pre('save', function (next) {
    next();
});

module.exports = mongoose.model('Facebook', FacebookSchema, 'facebooks');
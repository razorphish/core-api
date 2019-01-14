const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SocialSchema = new Schema({
    twitter: { type: Schema.Types.Mixed, required: false, trim: true },
    facebook: { type: Schema.Types.Mixed, required: false, trim: true },
    instagram: { type: Schema.Types.Mixed, required: false, trim: true },
    linkedIn: { type: Schema.Types.Mixed, required: false, trim: true },
    google: { type: Schema.Types.Mixed, required: false, trim: true }
});

module.exports = mongoose.model('State', SocialSchema, 'states');

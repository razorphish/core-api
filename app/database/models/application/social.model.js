const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Facebook = require('./facebook.model');
const Twitter = require('./twitter.model');
const Instagram = require('./instagram.model');
const Google = require('./google.model');

const SocialSchema = new Schema({
    facebook: { type: [Facebook.schema], required: false },
    twitter: { type: [Twitter.schema], required: false },
    instagram: { type: [Instagram.schema], required: false },
    google: { type: [Google.schema], required: false }
});

SocialSchema.pre('save', function (next) {
    next();
});

module.exports = mongoose.model('Social', SocialSchema, 'socials');
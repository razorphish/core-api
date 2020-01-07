const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ApplicationSettingForgotPasswordEmail = require('./application-setting-forgot-password-email.model');

const ApplicationSettingSchema = new Schema(
    {
        forgotPasswordEmail: { type: ApplicationSettingForgotPasswordEmail.schema, required: true },
    }, {
    _id: false,
    toJSON: { virtuals: true }
});

ApplicationSettingSchema.pre('save', function (next) {
    next();
});

module.exports = mongoose.model('ApplicationSetting', ApplicationSettingSchema, 'applicationSettings');

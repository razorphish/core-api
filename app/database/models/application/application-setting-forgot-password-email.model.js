const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ApplicationSettingForgotPasswordEmailSchema = new Schema(
    {
        subject: { type: String, required: true, trim: true },
        bodyHtml: { type: String, required: true, trim: true },
        bodyText: { type: String, required: true, trim: true },
        fromName: { type: String, required: true, trim: true },
        fromEmail: { type: String, required: true, trim: true }
    }, {
    _id: false,
    toJSON: { virtuals: true }
});

ApplicationSettingForgotPasswordEmailSchema.pre('save', function (next) {
    next();
});

module.exports = mongoose.model(
    'ApplicationSettingForgotPasswordEmail',
    ApplicationSettingForgotPasswordEmailSchema,
    'applicationSettingForgotPasswordEmails');

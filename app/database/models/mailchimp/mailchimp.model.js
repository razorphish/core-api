// Mailchimp
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MailChimpSchema = new Schema({
  name        : { type : String, required: true, trim: true },
  email       : { type : String, required: true, trim: true },
  message     : { type : String, required: false, trim: true },
  dateCreated : { type: Date, required: true, default: Date.now }
});

module.exports = mongoose.model('MailChimp', MailChimpSchema, 'mailChimp');
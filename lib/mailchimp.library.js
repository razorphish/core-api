'use strict';
const Mailchimp = require('mailchimp-api-3');
const mailchimpConfig = require('../lib/config.loader').mailchimp;

class MailchimpLibrary {
    constructor() {
        const apiKeyRegex = /.+\-.+/;
        var api_key = `${mailchimpConfig.apiKey}`;

        if (!apiKeyRegex.test(api_key)) {
            throw new Error('You forgot to add the Mailchimp api key: ' + api_key)
        }

        this.__apiKey = api_key;
        this.__baseUrl = "https://" + this.__apiKey.split('-')[1] + ".api.mailchimp.com/3.0";

        this.mailchimp = new Mailchimp(api_key);
    }
}

module.exports = new MailchimpLibrary();
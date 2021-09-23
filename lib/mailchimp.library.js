const Mailchimp = require('mailchimp-api-3');
const mailchimpConfig = require('./config.loader').mailchimp;

class MailchimpLibrary {
  constructor() {
    const apiKeyRegex = /.+-.+/;
    const apiKey = `${mailchimpConfig.apiKey}`;

    if (!apiKeyRegex.test(apiKey)) {
      throw new Error(`You forgot to add the Mailchimp api key: ${apiKey}`);
    }

    this.__apiKey = apiKey;
    this.__baseUrl = `https://${
      this.__apiKey.split('-')[1]
    }.api.mailchimp.com/3.0`;

    this.mailchimp = new Mailchimp(apiKey);
  }
}

module.exports = new MailchimpLibrary();

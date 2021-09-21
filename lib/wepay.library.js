const WePay = require('wepay').WEPAY; // https://github.com/wepay/NodeJS-SDK
const config = require('./config.loader').wepay;

class WePayLibrary {
  constructor() {
    const key = `${config.access_token}`;

    if (!key) {
      throw new Error(`You forgot to add the Wepay Access token: ${key}`);
    }

    this.__client_id = config.client_id;
    this.__client_secret = config.client_secret;
    this.__access_token = config.access_token;

    const options = {
      client_id: config.client_id,
      client_secret: config.client_secret,
      access_token: config.access_token
    };

    this.wepay = new WePay(options);

    if (config.use_staging) {
      this.wepay.use_staging();
    } else {
      this.wepay.use_production();
    }
  }
}

module.exports = new WePayLibrary();

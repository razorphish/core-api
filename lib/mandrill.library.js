const mandrillApi = require('mandrill-api');
const mandrillConfig = require('./config.loader').mandrill;

class MandrillLibrary {
  constructor() {
    const apiKey = `${mandrillConfig.apiKey}`;

    if (!apiKey) {
      throw new Error(`You forgot to add the Mandrill api key: ${apiKey}`);
    }

    this.__apiKey = apiKey;

    this.mandrill = new mandrillApi.Mandrill(apiKey);
  }
}

module.exports = new MandrillLibrary();

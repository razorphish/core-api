'use strict';

const mandrillApi = require('mandrill-api');
const mandrillConfig = require('../lib/config.loader').mandrill;

class MandrillLibrary {
    constructor() {
        var api_key = `${mandrillConfig.apiKey}`;

        if (!api_key) {
            throw new Error('You forgot to add the Mandrill api key: ' + api_key)
        }

        this.__apiKey = api_key;

        this.mandrill = new mandrillApi.Mandrill(api_key);
    }
}

module.exports = new MandrillLibrary();
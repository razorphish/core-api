const apn = require('apn'); // https://github.com/node-apn/node-apn
const apnConfig = require('./config.loader').apnPush;

class ApnLibrary {
  constructor() {
    const key = `${apnConfig.key}`;

    if (!key) {
      throw new Error(
        `You forgot to add the Apple Push Notification [APN] key: ${key}`
      );
    }

    this.__key = key;
    this.__keyId = apnConfig.keyId;
    this.__teamId = apnConfig.teamId;
    this.__production = apnConfig.production;

    const options = {
      token: {
        key: apnConfig.key,
        keyId: apnConfig.keyId,
        teamId: apnConfig.teamId
      },
      production: apnConfig.production
    };

    this.apnProvider = new apn.Provider(options);
  }
}

module.exports = new ApnLibrary();

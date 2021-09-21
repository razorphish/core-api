const { Twitter } = require('twitter-node-client'); // https://github.com/BoyCook/TwitterJSClient
const config = require('./config.loader').twitter;

class TwitterLibrary {
  constructor() {
    const key = `${config.consumerKey}`;

    if (!key) {
      throw new Error(`You forgot to add the Twitter consumer key: ${key}`);
    }

    this.__consumerKey = config.consumerKey;
    this.__consumerSecret = config.consumerSecret;
    this.__accessToken = config.accessToken;
    this.__accessTokenSecret = config.accessTokenSecret;
    this.__callBackUrl = config.callBackUrl;

    const options = {
      twitterConsumerKey: config.consumerKey,
      twitterConsumerSecret: config.consumerSecret,
      twitterAccessToken: config.accessToken,
      twitterAccessTokenSecret: config.accessTokenSecret,
      twitterCallBackUrl: config.callBackUrl
    };

    this.twitter = new Twitter(options);
  }
}

module.exports = new TwitterLibrary();

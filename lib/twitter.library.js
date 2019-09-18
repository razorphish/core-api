'use strict';
const Twitter = require('twitter-node-client').Twitter; //https://github.com/BoyCook/TwitterJSClient
const config = require('./config.loader').twitter;

class TwitterLibrary {
    constructor() {
        var key = `${config.consumerKey}`;

        if (!key) {
            throw new Error('You forgot to add the Twitter consumer key: ' + key)
        }

        this.__consumerKey = config.consumerKey;
        this.__consumerSecret = config.consumerSecret;
        this.__accessToken = config.accessToken;
        this.__accessTokenSecret = config.accessTokenSecret;
        this.__callBackUrl = config.callBackUrl;

        var options = {
            twitterConsumerKey: config.consumerKey,
            twitterConsumerSecret: config.consumerSecret,
            twitterAccessToken: config.accessToken,
            twitterAccessTokenSecret: config.accessTokenSecret,
            twitterCallBackUrl: config.callBackUrl
        }

        this.twitter = new Twitter(options);
    }
}

module.exports = new TwitterLibrary();
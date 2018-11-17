'use strict';

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

const env = process.env.NODE_ENV;

module.exports = require(`../config/config.${env}.json`);

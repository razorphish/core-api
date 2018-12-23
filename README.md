[![Build Status](https://travis-ci.org/razorphish/core-api.svg?branch=master)](https://travis-ci.org/razorphish/core-api)

[![Coverage Status](https://coveralls.io/repos/github/razorphish/core-api/badge.svg)](https://coveralls.io/github/razorphish/core-api)

Passport Api
=========

A small library that manages passport authorization and authentication

## Installation

  `npm install @marasco/core-api`

## Usage

    var numFormatter = require('@marasco/core-api');

    var formattedNum = numFormatter(35666);
  
  
  Output should be `35,666`


## Tests

  `npm test`

## Contributing

In lieu of a formal style guide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality.  Lint and test your code.

## Articles

https://www.terlici.com/2014/09/15/node-testing.html

## Assets

update verion numbers

npm version patch|major|minor|premajor|preminor| -m "Version %s - add sweet badges"

git push && git push --tags

npm publish
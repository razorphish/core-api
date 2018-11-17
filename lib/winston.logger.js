'use strict';

var winston = require('winston');
var appRoot = require('app-root-path');
var options = require('../lib/config.loader').winstonConfig;

options.file.filename = `${appRoot}/logs/${options.file.filename}`;
options.exceptionHandlers.file.filename = `${appRoot}/logs/${options.exceptionHandlers.file.filename}`;

var logify = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(options.console),
    new winston.transports.File(options.file)
  ],
  exceptionHandlers: [
    new (winston.transports.Console)(options.exceptionHandlers.console),
    new winston.transports.File(options.exceptionHandlers.file)
  ],
  exitOnError: false,
});

logify.stream = {
  write: function(message, encoding) {
    // use the 'info' log level so the output will be picked up by both transports (file and console)
    logify.info(message);
  },
};

module.exports = logify;
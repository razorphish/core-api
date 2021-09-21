const winston = require('winston');
const appRoot = require('app-root-path');
const options = require('./config.loader').winstonConfig;

options.file.filename = `${appRoot}/logs/${options.file.filename}`;
options.exceptionHandlers.file.filename = `${appRoot}/logs/${options.exceptionHandlers.file.filename}`;

const logify = winston.createLogger({
  transports: [
    new winston.transports.Console(options.console),
    new winston.transports.File(options.file)
  ],
  exceptionHandlers: [
    new winston.transports.Console(options.exceptionHandlers.console),
    new winston.transports.File(options.exceptionHandlers.file)
  ],
  exitOnError: false
});

logify.stream = {
  write(message) {
    // use the 'info' log level so the output will be
    // picked up by both transports (file and console)
    logify.info(message);
  }
};

module.exports = logify;

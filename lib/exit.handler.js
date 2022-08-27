const logger = require('./winston.logger');

function terminate(server, options = { coredump: false, timeout: 500 }) {
  // Exit function
  const exit = (code) => {
    // eslint-disable-next-line no-unused-expressions
    options.coredump ? process.abort() : process.exit(code);
  };

  return (code, reason) => (err) => {
    if (err && err instanceof Error) {
      // Log error information, use a proper logging library here :)
      logger.debug(err.message, err.stack);
    }

    logger.info(`The code is ${code} and reason is ${reason}`);

    // Attempt a graceful shutdown
    server.close(exit);
    setTimeout(exit, options.timeout).unref();
    logger.debug('Maras.co Api Server Terminated...');
  };
}

module.exports = terminate;

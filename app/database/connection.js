const mongoose = require('mongoose');
const dbConfig = require('../../lib/config.loader').databaseConfig;
const connectionString = `mongodb://${dbConfig.host}:${dbConfig.port}/${dbConfig.database}?authSource=admin`;
const logger = require('../../lib/winston.logger');

let connection = null;

class Database {
    open(callback) {
        const options = {
            user: dbConfig.username,
            pass: dbConfig.password,
            useNewUrlParser: true
        };

        mongoose.connect(
            connectionString,
            options,
            (err) => {
                if (err) {
                    logger.error('mongoose.connect() failed: ', err);
                }
            }
        );

        mongoose.set('useCreateIndex', true);
        connection = mongoose.connection;
        mongoose.Promise = global.Promise;

        mongoose.connection.on('error', (err) => {
            logger.error('Error connecting to MongoDB: ', err);
            callback(err, false);
        });

        mongoose.connection.once('open', () => {
            logger.debug('We have connected to mongodb');
            callback(null, true);
        });
    }

    // disconnect from database
    close() {
        connection.close(() => {
            logger.debug(
                'Mongoose default connection disconnected through app termination'
            );
            process.exit(0);
        });
    }
}

module.exports = new Database();

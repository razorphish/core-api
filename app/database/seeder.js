// Module dependencies
const mongoose = require('mongoose');
const BookSeeder = require('./seeders/book.seeder');
const logger = require('../../lib/winston.logger');

(dbConfig = require('../../lib/config.loader').databaseConfig),
    (connectionString = `mongodb://${dbConfig.host}/${dbConfig.database}`),
    (connection = null);

class DBSeeder {
    init() {
        mongoose.connection.db
            .listCollections({
                name: 'customers'
            })
            .next((err, collinfo) => {
                if (!collinfo) {
                    logger.info('Starting dbSeeder...');
                    this.seed();
                }
            });
    }

    seed() {
        logger.info('Seeding data....')

        // Book
        //BookSeeder.seed();
    }
}

module.exports = new DBSeeder();

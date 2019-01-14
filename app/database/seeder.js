// Module dependencies
const mongoose = require('mongoose');
const ClientSeeder = require('./seeders/auth/client.seeder');
const UserSeeder = require('./seeders/account/user.seeder');
const WishlistCategorySeeder = require('./seeders/wishlist/wishlist-category.seeder');
const RoleSeeder = require('./seeders/auth/role.seeder');
const logger = require('../../lib/winston.logger');

(dbConfig = require('../../lib/config.loader').databaseConfig),
    (connectionString = `mongodb://${dbConfig.host}/${dbConfig.database}`),
    (connection = null);

class DBSeeder {
    init() {
        mongoose.connection.db
            .listCollections({
                name: 'clients'
            })
            .next((err, collinfo) => {
                if (!collinfo) {
                    logger.info('Starting dbSeeder...');
                    this.seed();
                }
            });
    }

    seed() {
        logger.info('Seeding data...')

        // Client
        ClientSeeder.seed();

        // Roles (for user authorization)
        RoleSeeder.seed();

        // User
        UserSeeder.seed();

        // Wishlist category seeder
        WishlistCategorySeeder.seed();
    }
}

module.exports = new DBSeeder();

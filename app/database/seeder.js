// Module dependencies
const mongoose = require('mongoose');
/////////////////SEEDERS/////////////////////////////
const ClientSeeder = require('./seeders/auth/client.seeder');
const UserSeeder = require('./seeders/account/user.seeder');
const WishlistCategorySeeder = require('./seeders/wishlist/wishlist-category.seeder');
const RoleSeeder = require('./seeders/auth/role.seeder');
const ApplicationSeeder = require('./seeders/application/application.seeder');
const WishlistAppSettingsSeeder = require('./seeders/wishlist/wishlist-app-settings.seeder');
/////////////////////////////////////////////////////

const logger = require('../../lib/winston.logger');

(dbConfig = require('../../lib/config.loader').databaseConfig),
    (connectionString = `mongodb://${dbConfig.host}/${dbConfig.database}`),
    (connection = null);

class DBSeeder {
    constructor() {
        //Logging Info
        this._classInfo = '*** [Database].seeder';
    }

    init() {
        mongoose.connection.db
            .listCollections({
                name: 'clients'
            })
            .next((err, collinfo) => {
                if (!collinfo) {
                    logger.info(`${this._classInfo}.seed() -- Initialize Seeder`);
                    this.seed();
                }
            });
    }

    seed() {
        logger.info(`${this._classInfo}.seed() -- Begin Seeding Tables`);

        // Client
        logger.info(`${this._classInfo}.seed() -- Client Seeder`);
        ClientSeeder.seed();

        // Roles (for user authorization)
        logger.info(`${this._classInfo}.seed() -- Role Seeder`);
        RoleSeeder.seed();

        // User
        logger.info(`${this._classInfo}.seed() -- User Seeder`);
        UserSeeder.seed();

        // Wishlist category seeder
        logger.info(`${this._classInfo}.seed() -- Wishlist Seeder`);
        WishlistCategorySeeder.seed();

        // Application Seeder
        logger.info(`${this._classInfo}.seed() -- Application Seeder`);
        ApplicationSeeder.seed();

        //Wishlist Settings application Seeder
        logger.info(`${this._classInfo}.seed() -- Wishlist Application Settings Seeder`);
        WishlistAppSettingsSeeder.seed();
    }
}

module.exports = new DBSeeder();

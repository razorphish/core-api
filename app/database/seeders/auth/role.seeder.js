// Role
const Role = require('../../models/auth/role.model');
const logger = require('../../../../lib/winston.logger');

class RoleSeeder {
  constructor() {
    this._classInfo = '*** [Role].seeder';
  }

  /**
   * Seeding for roles
   */
  seed() {
    logger.info(`${this._classInfo}.seed()`);

    const items = [
      {
        _id: '5c48caeffc13ae064600000a',
        name: 'SuperAdmin',
        normalizedName: 'SUPERADMIN'
      },
      {
        _id: '59af3138fc13ae21640000ca',
        name: 'Admin',
        normalizedName: 'ADMIN'
      },
      {
        _id: '59af3138fc13ae21640000c9',
        name: 'User',
        normalizedName: 'USER'
      },
      {
        _id: '59af3138fc13ae21640000c8',
        name: 'Guest',
        normalizedName: 'GUEST'
      },
      {
        _id: '59e8e689ea1ea07ca6e6ef96',
        name: 'Vendor',
        normalizedName: 'VENDOR'
      }
    ];

    Role.deleteMany({});

    // eslint-disable-next-line no-plusplus
    items.forEach((item) => {
      const model = new Role({
        _id: item._id,
        name: item.name,
        normalizedName: item.name
      });

      model.save((err, roleSaved) => {
        if (err) {
          logger.error(`${this._classInfo}.seed()`, err);
        } else {
          logger.debug(`${this._classInfo}.seed() OK Role: ${roleSaved.name}`);
        }
      });
    });
  }
}

module.exports = new RoleSeeder();

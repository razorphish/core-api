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

    const roles = [
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

    const l = roles.length;
    let i;

    Role.deleteMany({});

    // eslint-disable-next-line no-plusplus
    for (i = 0; i < l; i++) {
      const role = new Role({
        _id: roles[i]._id,
        name: roles[i].name,
        normalizedName: roles[i].name
      });

      role.save((err, roleSaved) => {
        if (err) {
          logger.error(`${this._classInfo}.seed()`, err);
        } else {
          logger.debug(`${this._classInfo}.seed() OK`, `Role: ${roleSaved.name}`);
        }
      });
    }
  }
}

module.exports = new RoleSeeder();

const User = require('../../models/account/user.model');
const logger = require('../../../../lib/winston.logger');

class UserFeeder {
  constructor() {
    this._classInfo = '*** [User].seeder';
  }

  /**
   * User Seeding
   */
  seed() {
    logger.info(`${this._classInfo}.seed()`);

    var users = [
      {
        _id: '597e782cfc13ae628f00000d',
        applicationId: '5c4b1303fc13ae60b4000003',
        firstName: 'Antonio',
        lastName: 'Marasco',
        email: 'david@maras.co',
        username: 'david@maras.co',
        password: 'Letme1n!',
        avatar:
          'data:image/png;base64,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',
        salt: '1NC7owXUlUj',
        roles: [
          {
            _id: '59af3138fc13ae21640000c8',
            name: 'Guest',
            normalizedName: 'GUEST'
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
            _id: '5c48caeffc13ae064600000a',
            name: 'SuperAdmin',
            normalizedName: 'SUPERADMIN'
          }
        ],
        accountId: {
          _id: '59af3138fc13ae21640000ca',
          statusId: 'active'
        }
      }
    ];

    var l = users.length,
      i;

    User.deleteMany({});

    for (i = 0; i < l; i++) {
      var user = new User({
        _id: users[i]._id,
        firstName: users[i].firstName,
        lastName: users[i].lastName,
        email: users[i].email,
        email_lower: users[i].email.toLocaleLowerCase,
        homePhone: users[i].homePhone,
        username: users[i].username,
        username_lower: users[i].username.toLocaleLowerCase,
        password: users[i].password,
        salt: users[i].salt,
        avatar: users[i].avatar,
        addresses: users[i].addresses,
        roles: users[i].roles,
        twitter: users[i].twitter,
        facebook: users[i].facebook,
        instagram: users[i].instagram,
        account: users[i].account,
        status: 'active',
        applicationId: users[i].applicationId
      });

      user.save((err, user) => {
        //logger.verbose(`${this._classInfo}.seed()`, user);

        if (err) {
          logger.error(`${this._classInfo}.seed()`, err);
        } else {
          logger.debug(
            `${this._classInfo}.seed() OK`,
            `${user.email} ${user.username}`
          );
        }
      });
    }
  }
}

module.exports = new UserFeeder();

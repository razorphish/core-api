// Client
const Client = require('../../models/auth/client.model');
const logger = require('../../../../lib/winston.logger');

class ClientSeeder {
  constructor() {
    this._classInfo = '*** [Client].seeder';
  }

  /**
   * Seeding for Clients
   */
  seed() {
    logger.info(`${this._classInfo}.seed()`);

    var items = [
      {
        name: '@marasco/core-web-ui',
        clientId: 'core-web-ui',
        clientSecret: '353b992ef5abd23cfc349228970b550616161458', //utils.getUid(256),
        isTrusted: true,
        applicationType: 'ClientConfidential',
        allowedOrigins: [
          'http://localhost:4200',
          'http://admin.biddler.com',
          'http://localhost:8100',
          'chrome-extension://aejoelaoggembcahagimdiliamlcdmfm',
          'https://admin.biddler.com',
          'https://app.biddler.com',
          'http://localhost:60000',
          'http://localhost:60001',
          'file://',
          'http://localhost:8080'
        ],
        tokenLifeTime: 30,
        refreshTokenLifeTime: 259200
      },
      {
        name: '@marasco/core-mobile-ui',
        clientId: 'core-mobile-ui',
        clientSecret: 'd7959353c23517ab2f760f1f5516a744768edf25',
        isTrusted: true,
        applicationType: 'Native',
        allowedOrigins: [
          'http://localhost:8100',
          'http://localhost:8080',
          'http://localhost:60000',
          'http://localhost:60001'
        ],
        tokenLifeTime: 30,
        refreshTokenLifeTime: 259200
      }
    ];

    var l = items.length,
      i;

    Client.remove({});

    for (i = 0; i < l; i++) {
      //var tokenHash = crypto.createHash('sha1').update(items[i].clientSecret).digest('hex');
      //console.log(`about to insert client: ${items[i].clientId} with secret: ${items[i].clientSecret}`);

      var item = new Client({
        name: items[i].name,
        clientId: items[i].clientId,
        clientSecret: items[i].clientSecret,
        isTrusted: items[i].isTrusted,
        applicationType: items[i].applicationType,
        allowedOrigins: items[i].allowedOrigins,
        tokenLifeTime: items[i].tokenLifeTime,
        refreshTokenLifeTime: items[i].refreshTokenLifeTime
      });

      item.save((err, item) => {
        //logger.verbose(`${this._classInfo}.seed()`, item);

        if (err) {
          logger.error(`${this._classInfo}.seed()`, err);
        } else {
          logger.debug(`${this._classInfo}.seed() OK`, item.name);
        }
      });
    }
  }
}

module.exports = new ClientSeeder();

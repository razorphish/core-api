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
        applicationId: '5c4b1303fc13ae60b4000003',
        name: '@marasco/admin-web-ui',
        clientId: 'admin-web-ui',
        clientSecret: '353b992ef5abd23cfc349228970b550616161458', 
        isTrusted: true,
        applicationType: 'ClientConfidential',
        allowedOrigins: [
          'http://localhost:4201',
          'chrome-extension://aejoelaoggembcahagimdiliamlcdmfm',
          'file://',
          'https://admin.maras.co'
        ],
        tokenLifeTime: 30,
        refreshTokenLifeTime: 259200,
        hash: 'E89fZK0oQnEuMWuqRhpNZG5ObexOw81RdnWHnSIuQVjaei3bag4kq' +
        'nSyPXIrAi5gpYQcPU98leY1J5eL1sQUrUCRjS3SdZlMK1vSSv1kORtDqaxdYslVMe8uCBxk4Np' +
        'PkwFkiWB8ywHnAjXBZpRdXHry8Aj19KS7XQUvi3DVW953MqCJgipQm76Lw8rNfAl1oQMyjPyBV' +
        'cGKGecaevaz5bKulZWKx6m0sFKbNs2eT6FDiOfTuF25IHgKymnnoaCF'
      },
      {
        applicationId: '5c4b1303fc13ae60b4000001',
        name: '@marasco/core-web-ui',
        clientId: 'core-web-ui',
        clientSecret: '25668153249222e55b5b524dfdd0ef901e8e6a04',
        isTrusted: true,
        applicationType: 'ClientConfidential',
        allowedOrigins: [
          'http://localhost:4200',
          'chrome-extension://aejoelaoggembcahagimdiliamlcdmfm',
          'file://',
          'https://www.maras.co'
        ],
        tokenLifeTime: 30,
        refreshTokenLifeTime: 259200,
        hash: 'HyANL23yJSxzk7rLRoJuIuHPtKn2zshmoWrkYIA7c4sHtFp0rliIGCKejVj13uAtBji4eTpFyqvMYvXnDdVekACnLGiLqPywvSGaLVpOYMDbfQdQnnD4uQD7I4dipe38k0OZfwBEB2HWLAjjL9V2GnljXCcKAYxJjJuROFT5aVj4rxs8XnJelE7TlXsSY8r4g52oakyEoHhAegzkQRCLOWgsnm5JoE9XKLRD1tLiD3e39lkbQQGBOumImTwwJYcZ'
      },
      {
        applicationId: '5c4b1303fc13ae60b4000000',
        name: '@marasco/twittles-mobile-ui',
        clientId: 'twittles-mobile-ui',
        clientSecret: 'a22c4eccf2c51ce4ae244779935b429c5bf81a8e',
        isTrusted: true,
        applicationType: 'Native',
        allowedOrigins: [
          'http://localhost:4200',
          'chrome-extension://aejoelaoggembcahagimdiliamlcdmfm',
          'file://',
          'https://twittles.maras.co'
        ],
        tokenLifeTime: 30,
        refreshTokenLifeTime: 259200,
        hash: 'tDhTFnaWOukzPKDta2S4E61D5ImiuqlzRUEELTBLSKTfvwjsPEurZRQHYwG0JfJMOtO8zAIYektkrZONeSrLJh8BiRdi3U2nok90WdTG3mQ7tHYneEIl6H6R0hdtVduDuctC3PXopVSqHScOiwjHFY0zPNEYQBWh8wsbdysC8XjMaiwFRgK7W3WiNC6g9ZZVZJjLNurHMnKCHhMoA0IieZ37QVSZDLDdThnXphapH6h1PpOPj4lK2v7IcTT6SgUX'
      },
      {
        applicationId: '5c4b1303fc13ae60b4000000',
        name: '@marasco/twittles-web-ui',
        clientId: 'twittles-web-ui',
        clientSecret: '53ae531db07bc5b8043d7dd6db9e330dc15f4d39',
        isTrusted: true,
        applicationType: 'ClientConfidential',
        allowedOrigins: [
          'http://localhost:4200',
          'chrome-extension://aejoelaoggembcahagimdiliamlcdmfm',
          'file://',
          'https://twittles.maras.co'
        ],
        tokenLifeTime: 30,
        refreshTokenLifeTime: 259200,
        hash: '6LdUjxNWWjwrg3nVlvCinlfpa3WdbChP8JjFOmbxJHoGRu7PVxkGxmvSNXrjmPxzEkPf8nmRppKbS2Fl6nmUBC7AiS8Ehs43cZoPnIwz24oTljoHHyCNyhMIynMlU4d1bps49Dz4Z4BwX7wcCiCBaLZP1zXPico3eQnrmuyeQmce8gOyG1EpLUWOTyUzTlcYGUOkBls5RrYpwESoejhmexUvGLmYyGkntzqwXC7N5UYyTvvPmXQHY0HrueF6d6Wj'
      },
      {
        applicationId: '5c4b1303fc13ae60b4000002',
        name: '@marasco/wishlist-web-ui',
        clientId: 'wishlist-web-ui',
        clientSecret: '74502a779c82ba1dedb3a64102360cc396603a01',
        isTrusted: true,
        applicationType: 'ClientConfidential',
        allowedOrigins: [
          'http://localhost:4200',
          'chrome-extension://aejoelaoggembcahagimdiliamlcdmfm',
          'file://',
          'https://wishlist.maras.co'
        ],
        tokenLifeTime: 30,
        refreshTokenLifeTime: 259200,
        hash: 'I0jCzMKLlYe8zLICZqSIklDwZrgDiEBwWV7ZsQ32j4js1JHJm9Pi43PYH5O1kqkDkcyYBpFA6PbsQcLygDcXYuoaTIBNuE6H7OR7UGPEvAS6XNb7p5mFZURIDa2ZygBmemA9lyMnSipnHn5fx3zN7LNca1ppcac2Ok9sTjXgzNHqkEbczRlGdGLoCQ1pwFcRKa3RI32gDu62wGrWwBtQzjlJZW7VVpDvh2DaQ9pxRn02Jk8L0jdl8StOgx0gtcxE'
      },
      {
        applicationId: '5c4b1303fc13ae60b4000002',
        name: '@marasco/wishlist-mobile-ui',
        clientId: 'wishlistPremiere-pwa',
        clientSecret: '4e99ef5c40909679542901fabc2f833e9064ad5a',
        isTrusted: true,
        applicationType: 'Native',
        allowedOrigins: [
          'http://localhost',
          'http://localhost:8080',
          'http://localhost:4203',
          'chrome-extension://aejoelaoggembcahagimdiliamlcdmfm',
          'file://',
          'https://wishlist.maras.co',
          'capacitor://localhost'
        ],
        tokenLifeTime: 30,
        refreshTokenLifeTime: 259200,
        hash: 'gbUJGCTin19mKfp24ZODrWJQWgCsRpz4ZPCSdI48r5vBMUBMdbtfOSK9uQI4Aljko911aerffIZg9Wruidt3M78J6qji598eoKo9xkiKSKto0eemRq2xiQacm9nL5qCGhfnFQZUCHQ597q1cI5MoCmMseBD49XPexoYfx5y0Oo2eBOgvZ6Ig8DHrv9LvzZYle6VEWIQrFBOFrPrezynlqGl632Sso3PLUu2kRRQWuOU52Ng6VhD7vqgnzgEawRj8'
      }
    ];

    var l = items.length,
      i;

    Client.deleteMany({});

    for (i = 0; i < l; i++) {
      //var tokenHash = crypto.createHash('sha1').update(items[i].clientSecret).digest('hex');
      //console.log(`about to insert client: ${items[i].clientId} with secret: ${items[i].clientSecret}`);

      var item = new Client({
        applicationId: items[i].applicationId,
        name: items[i].name,
        clientId: items[i].clientId,
        clientSecret: items[i].clientSecret,
        isTrusted: items[i].isTrusted,
        applicationType: items[i].applicationType,
        allowedOrigins: items[i].allowedOrigins,
        tokenLifeTime: items[i].tokenLifeTime,
        refreshTokenLifeTime: items[i].refreshTokenLifeTime,
        hash: items[i].hash
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

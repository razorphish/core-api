const Model = require('../../models/application/application.model');
const logger = require('../../../../lib/winston.logger');

class ApplicationFeeder {
  constructor() {
    this._classInfo = '*** [Application].seeder';
  }

  /**
   * Application Seeding
   */
  seed() {
    logger.info(`${this._classInfo}.seed()`);

    const items = [
      {
        _id: '5c4b1303fc13ae60b4000001',
        name: 'Maras.co',
        shortName: 'maras_co',
        statusId: 'active',
        url: 'https://www.maras.co'
      },
      {
        _id: '5c4b1303fc13ae60b4000000',
        name: 'Twittles',
        shortName: 'twittles',
        statusId: 'pending',
        url: 'https://twittles.maras.co'
      },
      {
        _id: '5c4b1303fc13ae60b4000003',
        name: 'Maras.co Admin',
        shortName: 'maras_co_admin',
        statusId: 'active',
        url: 'https://admin.maras.co'
      },
      {
        _id: '5c4b1303fc13ae60b4000002',
        name: 'Wishlist Premiere',
        shortName: 'wishlist',
        statusId: 'active',
        url: 'https://wishlist.maras.co',
        settings: {
          forgotPasswordEmail: {
            subject: 'Forgot Password Reset',
            bodyHtml: 'david@maras.co',
            bodyText: '',
            fromName: 'Twittles Support',
            fromEmail: 'david@maras.co'
          }
        }
      },
      {
        _id: '5c4b13dbfc13ae60b4000006',
        name: 'Instagrump',
        shortName: 'instagrump',
        statusId: 'pending',
        url: 'https://instagrump.maras.co'
      },
      {
        _id: '5c4b13dbfc13ae60b4000004',
        name: 'Biddler',
        shortName: 'biddler',
        statusId: 'pending',
        url: 'https://biddler.maras.co'
      },
      {
        _id: '5c4b13dbfc13ae60b4000007',
        name: 'Gungeon',
        shortName: 'gungeon',
        statusId: 'pending',
        url: 'https://gungeon.maras.co'
      },
      {
        _id: '5c4b13dbfc13ae60b4000008',
        name: 'Glidia',
        shortName: 'glidia',
        statusId: 'inactive',
        url: 'https://glidia.maras.co'
      }
    ];

    const l = items.length;
    let i;

    Model.deleteMany({});

    // eslint-disable-next-line no-plusplus
    for (i = 0; i < l; i++) {
      const item = new Model({
        _id: items[i]._id,
        name: items[i].name,
        statusId: items[i].statusId,
        url: items[i].url
      });

      item.save((err, user) => {
        // logger.verbose(`${this._classInfo}.seed()`, user);

        if (err) {
          logger.error(`${this._classInfo}.seed()`, err);
        } else {
          logger.debug(`${this._classInfo}.seed() OK`, `${user.name}`);
        }
      });
    }
  }
}

module.exports = new ApplicationFeeder();

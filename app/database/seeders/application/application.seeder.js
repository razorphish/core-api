const model = require('../../models/application/application.model');
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

        var items = [
            {
                _id: '5c4b1303fc13ae60b4000000',
                name: 'Twittles',
                statusId: 'pending',
                url: 'https://twittles.maras.co'
            },
            {
                _id: '5c4b1303fc13ae60b4000002',
                name: 'Wish List Premiere',
                statusId: 'active',
                url: 'https://wishlist.maras.co'
            },
            {
                _id: '5c4b13dbfc13ae60b4000006',
                name: 'Instagrump',
                statusId: 'pending',
                url: 'https://instagrump.maras.co'
            },
            {
                _id: '5c4b13dbfc13ae60b4000004',
                name: 'Biddler',
                statusId: 'pending',
                url: 'https://biddler.maras.co'
            },
            {
                _id: '5c4b13dbfc13ae60b4000007',
                name: 'Gungeon',
                statusId: 'pending',
                url: 'https://gungeon.maras.co'
            },
            {
                _id: '5c4b13dbfc13ae60b4000008',
                name: 'Glidia',
                statusId: 'inactive',
                url: 'https://glidia.maras.co'
            },
        ];

        var l = items.length,
            i;

        model.remove({});

        for (i = 0; i < l; i++) {
            var item = new model({
                _id: items[i]._id,
                name: items[i].name,
                statusId: items[i].statusId,
                url: items[i].url
            });

            item.save((err, user) => {
                //logger.verbose(`${this._classInfo}.seed()`, user);

                if (err) {
                    logger.error(`${this._classInfo}.seed()`, err);
                } else {
                    logger.debug(
                        `${this._classInfo}.seed() OK`,
                        `${user.name}`
                    );
                }
            });
        }
    }
}

module.exports = new ApplicationFeeder();

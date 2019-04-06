const WishlistAppSettings = require('../../models/wishlist/wishlist-app-settings.model');
const logger = require('../../../../lib/winston.logger');

class WishlistAppSettingsFeeder {
    constructor() {
        this._classInfo = '*** [Wishlist-app-settings].seeder';
    }

    /**
     * Wishlist App Settings Seeding
     */
    seed() {
        logger.info(`${this._classInfo}.seed()`);

        var wishlistAppSettings = [{
            _id: '5c62fe02fc13ae04c4000064',
            notifications: [{
                name: 'wishlist-item-purchased',
                title: 'Item purchased on $$WISHLISTNAME$$',
                dir: 'ltr',
                lang: 'en-us',
                body: '$$ITEM$$ was purchased by another user',
                tag: 'wishlist',
                image: '',
                icon: '',
                badge: '',
                vibrate: [100, 200, 100],
                actions: [
                    {
                        action: 'item-purchased',
                        title: 'See Wishlist',
                        icon: ''
                    }
                ]
            },
            {
                name: 'wishlist-item-added',
                title: 'Item added to $$WISHLISTNAME$$',
                dir: 'ltr',
                lang: 'en-us',
                body: '$$ITEMNAME$$ was added',
                tag: 'wishlist',
                image: '',
                icon: '',
                badge: '',
                vibrate: [100, 200, 100],
                actions: [
                    {
                        action: 'item-added',
                        title: 'See Wishlist',
                        icon: ''
                    }
                ]
            },
            {
                name: 'wishlist-item-removed',
                title: 'Item removed from $$WISHLISTNAME$$',
                dir: 'ltr',
                lang: 'en-us',
                body: '$$ITEMNAME$$ was removed',
                tag: 'wishlist',
                image: '',
                icon: '',
                badge: '',
                vibrate: [100, 200, 100],
                actions: [
                    {
                        action: 'item-removed',
                        title: 'See Wishlist',
                        icon: ''
                    }
                ]
            }]
        }];

        var l = wishlistAppSettings.length,
            i;

        WishlistAppSettings.deleteMany({});

        for (i = 0; i < l; i++) {
            var wishlistAppSetting = new WishlistAppSettings({
                notifications: wishlistAppSettings[i].notifications
            });

            wishlistAppSetting.save((err, user) => {
                //logger.verbose(`${this._classInfo}.seed()`, user);

                if (err) {
                    logger.error(`${this._classInfo}.seed()`, err);
                } else {
                    logger.debug(
                        `${this._classInfo}.seed() OK`,
                        `${wishlistAppSetting._id}`
                    );
                }
            });
        }
    }
}

module.exports = new WishlistAppSettingsFeeder();

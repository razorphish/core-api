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
            emailNotifications: [
                {
                    name: 'wishlist-item-purchased',
                    subject: 'Item purchased on ##WISHLISTNAME## wishlist',
                    text: '##ITEMNAME## was purchased by another user',
                    html: '<b>##ITEMNAME##</b> was purchased by another user',
                    fromEmailAddress: 'david@maras.co',
                    fromName: 'Wishlist Premiere Support'
                },
                {
                    name: 'wishlist-item-added',
                    subject: 'Item added to ##WISHLISTNAME## wishlist',
                    text: '##ITEMNAME## was added to this wishlist',
                    html: '<b>##ITEMNAME##</b> was added',
                    fromEmailAddress: 'david@maras.co',
                    fromName: 'Wishlist Premiere Support'
                },
                {
                    name: 'wishlist-item-removed',
                    subject: 'Item removed from ##WISHLISTNAME## wishlist',
                    text: '##ITEMNAME## was removed',
                    html: '<b>##ITEMNAME##</b> was removed',
                    fromEmailAddress: 'david@maras.co',
                    fromName: 'Wishlist Premiere Support'
                }
            ],
            notifications: [
                {
                    name: 'wishlist-item-purchased',
                    title: 'Item purchased on ##WISHLISTNAME##',
                    dir: 'ltr',
                    lang: 'en-us',
                    body: '##ITEMNAME## was purchased by another user',
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
                    title: 'Item added to ##WISHLISTNAME##',
                    dir: 'ltr',
                    lang: 'en-us',
                    body: '##ITEMNAME## was added',
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
                    title: 'Item removed from ##WISHLISTNAME##',
                    dir: 'ltr',
                    lang: 'en-us',
                    body: '##ITEMNAME## was removed',
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
                }
            ]
        }];

        var l = wishlistAppSettings.length,
            i;

        WishlistAppSettings.deleteMany({});

        for (i = 0; i < l; i++) {
            var wishlistAppSetting = new WishlistAppSettings({
                _id: wishlistAppSettings[i]._id,
                notifications: wishlistAppSettings[i].notifications,
                emailNotifications: wishlistAppSettings[i].emailNotifications
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

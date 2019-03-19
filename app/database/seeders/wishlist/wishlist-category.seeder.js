const WishlistCategory = require('../../models/wishlist/wishlist-item-category.model');
const logger = require('../../../../lib/winston.logger');

class WishlistCategoryFeeder {
    constructor() {
        this._classInfo = '*** [Wishlist-category].seeder';
    }

    /**
     * Wishlist Category Seeding
     */
    seed() {
        logger.info(`${this._classInfo}.seed()`);

        var wishlistCategories = [
            {
                userId: '597e782cfc13ae628f00000d',
                name: 'Miscellaneous'
            }
        ];

        var l = wishlistCategories.length,
            i;

        WishlistCategory.deleteMany({});

        for (i = 0; i < l; i++) {
            var wishlistCategory = new WishlistCategory({
                name: wishlistCategories[i].name,
                userId: wishlistCategories[i].userId
            });

            wishlistCategory.save((err, user) => {
                //logger.verbose(`${this._classInfo}.seed()`, user);

                if (err) {
                    logger.error(`${this._classInfo}.seed()`, err);
                } else {
                    logger.debug(
                        `${this._classInfo}.seed() OK`,
                        `${wishlistCategory.name}`
                    );
                }
            });
        }
    }
}

module.exports = new WishlistCategoryFeeder();

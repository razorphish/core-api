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

    const items = [
      {
        userId: '597e782cfc13ae628f00000d',
        name: 'Miscellaneous'
      }
    ];

    WishlistCategory.deleteMany({});

    // eslint-disable-next-line no-plusplus
    items.forEach((item) => {
      const model = new WishlistCategory({
        name: item.name,
        userId: item.userId
      });

      model.save((err) => {
        // logger.verbose(`${this._classInfo}.seed()`, user);

        if (err) {
          logger.error(`${this._classInfo}.seed()`, err);
        } else {
          logger.debug(`${this._classInfo}.seed() OK ${model.name}`);
        }
      });
    });
  }
}

module.exports = new WishlistCategoryFeeder();

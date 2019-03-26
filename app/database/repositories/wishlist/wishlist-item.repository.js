// WishlistItem Repository
const WishlistItemModel = require('../../models/wishlist/wishlist-item.model');
const logger = require('../../../../lib/winston.logger');
const async = require('async');

/**
 * This callback type is called `requestCallback` and is displayed as a global symbol.
 *
 * @callback requestCallback
 * @param {*} error
 * @param {*} data
 */

/**
 * WishlistItem Repository
 * @author Antonio Marasco
 * @class WishlistItem Repository
 */
class WishlistItemRepository {
    /**
     * Constructor for WishlistItem
     */
    constructor() {
        //Logging Info
        this._classInfo = '*** [WishlistItem].repository';
    }

    /**
     * Gets all WishlistItems
     * @param {requestCallback} callback Handles the response
     * @example all((error, data) => {})
     */
    all(callback) {
        logger.debug(`${this._classInfo}.all()`);

        WishlistItemModel.find({}, {
            accountId: 0
        })
            .then(data => {
                callback(null, data);
            })
            .catch(error => {
                logger.error(`${this._classInfo}.all::find`, error);
                callback(error);
            });
    }

    /**
     * Gets all WishlistItems paginated
     * @param {number} [skip=10] Page number
     * @param {number} [top=10] Per Page
     * @param {requestCallback} callback Handles the response
     * @example allPaged(2, 10, (error, data) => {} )
     */
    allPaged(skip, top, callback) {
        logger.debug(`${this._classInfo}.allPaged(${skip}, ${top})`);

        WishlistItemModel
            .find({},
                null,
                {
                    skip: skip,
                    //   select: {
                    //     password: 0
                    //   },
                    top: top,
                    sort: { lastName: 1 }
                }
            )
            .then((data) => {
                callback(null, data);
            })
            .catch(error => {
                logger.error(`${this._classInfo}.allPaged(${skip}, ${top})`, error);
                return callback(error, null);
            });
    }

    /**
     * Gets items by wishlist id
     * @param {string} wishlistId Wishlist Id
     * @param {requestCallback} callback Handles the response
     * @example byEmail('me@here.com', (error, data) => {})
     */
    byWishlistId(wishlistId, callback) {
        logger.debug(`${this._classInfo}.byWishlistId(${wishlistId})`);

        WishlistItemModel.find(
            {
                wishlistId: wishlistId,
                statusId: { $ne: 'deleted'}
            },
            null)
            .then((data) => {
                callback(null, data);
            })
            .catch(error => {
                logger.error(`${this._classInfo}.byWishlistId::findOne`, error);
                return callback(error);
            });
    }

    /**
     * Delete a WishlistItem by id
     * @param {string} id WishlistItem Id
     * @param {requestCallback} callback Handles the response
     * @example delete('123456789', (error, data) => {})
     */
    delete(id, callback) {
        logger.debug(`${this._classInfo}.delete(${id})`);

        WishlistItemModel.deleteOne({ _id: id })
            .then((data) => {
                callback(null, data);
            })
            .catch(error => {
                logger.error(`${this._classInfo}.delete(${id})::remove`, error);
                return callback(error);
            });
    }

    /**
     * Gets a single Wishlist
     * @param {string} id WishlistItem id
     * @param {requestCallback} callback Handles the response
     * @example get('123456789', (error, data) => {})
     */
    get(id, callback) {
        logger.debug(`${this._classInfo}.get(${id})`);

        WishlistItemModel.findById(
            id,
            null,
            {
                select: {
                    accountId: 1
                }
            })
            .then(data => {
                callback(null, data);
            })
            .catch(error => {
                logger.error(`${this._classInfo}.get(${id})`, error);
                return callback(error);
            })
    }

    /**
     * Inserts a Wishlist
     * @param {object} body WishlistItem data
     * @param {requestCallback} callback Handles the response
     * @example insert({property: value}, (error, data) => {})
     */
    insert(body, callback) {
        logger.debug(`${this._classInfo}.insert()`, body);

        WishlistItemModel.create(body)
            .then(data => {
                callback(null, data);
            })
            .catch(error => {
                logger.error(`${this._classInfo}.insert()::save`, error);
                callback(error);
            });
    }

    /**
     * sorts wishlist items
     * @param {array} items WishlistItem id
     * @param {requestCallback} callback Handles the response
     * @example update('1234', {body:data}, (error, data) => {})
     */
    sort(items, callback) {
        logger.debug(`${this._classInfo}.sort()`);

        async.eachSeries(items, (item, done) => {
            WishlistItemModel.findOneAndUpdate(
                { _id: item._id },
                {
                    $set: {
                        sortOrder: item.sortOrder
                    }
                },
                // { item },
                { new: true })
                .then(data => {
                    //returns WishlistItem data
                    done();
                });
        }, (error) => {
            if (error) {
                callback(error);
            } else {
                return callback();
            }
        })
    }

    /**
     * Updates an Wishlist
     * @param {string} id WishlistItem id
     * @param {object} body WishlistItem data
     * @param {requestCallback} callback Handles the response
     * @example update('1234', {body:data}, (error, data) => {})
     */
    update(id, body, callback) {
        logger.debug(`${this._classInfo}.update(${id})`);

        WishlistItemModel.findOneAndUpdate(
            { _id: id },
            { $set: body },
            { new: true })
            .then(data => {
                //returns WishlistItem data
                callback(null, data);
            })
            .catch(error => {
                logger.error(`${this._classInfo}.update(${id})::findOneAndUpdate`, error);
                return callback(error);
            });
    }
}

module.exports = new WishlistItemRepository();

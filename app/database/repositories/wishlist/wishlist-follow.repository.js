// WishlistFollow Repository
const WishlistFollowModel = require('../../models/wishlist/wishlist-follow.model');
const logger = require('../../../../lib/winston.logger');

/**
 * This callback type is called `requestCallback` and is displayed as a global symbol.
 *
 * @callback requestCallback
 * @param {*} error
 * @param {*} data
 */

/**
 * WishlistFollow Repository
 * @author Antonio Marasco
 * @class WishlistFollow Repository
 */
class WishlistFollowRepository {
    /**
     * Constructor for client
     */
    constructor() {
        //Logging Info
        this._classInfo = '*** [WishlistFollow].repository';
    }

    /**
     * Gets all Wishlists
     * @param {requestCallback} callback Handles the response
     * @example all((error, data) => {})
     */
    all(callback) {
        logger.debug(`${this._classInfo}.all()`);

        WishlistFollowModel.find({}, {
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
     * Gets all Wishlists paginated
     * @param {number} [skip=10] Page number
     * @param {number} [top=10] Per Page
     * @param {requestCallback} callback Handles the response
     * @example allPaged(2, 10, (error, data) => {} )
     */
    allPaged(skip, top, callback) {
        logger.debug(`${this._classInfo}.allPaged(${skip}, ${top})`);

        WishlistFollowModel
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
    byWishlistIdUserId(wishlistId, userId, callback) {
        logger.debug(`${this._classInfo}.byWishlistIdUserId(${wishlistId})`);

        WishlistFollowModel.find(
            {
                wishlistId: wishlistId,
                userId: userId,
                statusId: { $ne: 'deleted' }
            },
            null)
            .then((data) => {
                callback(null, data);
            })
            .catch(error => {
                logger.error(`${this._classInfo}.byWishlistIdUserId::findOne`, error);
                return callback(error);
            });
    }

    /**
     * Delete a WishlistFollow by id
     * @param {string} id WishlistFollow Id
     * @param {requestCallback} callback Handles the response
     * @example delete('123456789', (error, data) => {})
     */
    delete(id, callback) {
        logger.debug(`${this._classInfo}.delete(${id})`);

        WishlistFollowModel.deleteOne({ _id: id })
            .then((data) => {
                callback(null, data);
            })
            .catch(error => {
                logger.error(`${this._classInfo}.delete(${id})::remove`, error);
                return callback(error);
            });
    }

    /**
     * Gets a single WishlistFollow 
     * @param {string} id WishlistFollow id
     * @param {requestCallback} callback Handles the response
     * @example get('123456789', (error, data) => {})
     */
    get(id, callback) {
        logger.debug(`${this._classInfo}.get(${id})`);

        WishlistFollowModel.findById(
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
     * Inserts a WishlistFollow
     * @param {object} body WishlistFollow data
     * @param {requestCallback} callback Handles the response
     * @example insert({property: value}, (error, data) => {})
     */
    insert(body, callback) {
        logger.debug(`${this._classInfo}.insert()`, body);

        WishlistFollowModel.create(body)
            .then(data => {
                callback(null, data);
            })
            .catch(error => {
                logger.error(`${this._classInfo}.insert()::save`, error);
                callback(error);
            });
    }

    /**
     * Unfollows a Wishlist
     * @param {string} wishlistFollowId WishlistFollow id
     * @param {object} body WishlistFollow data
     * @param {requestCallback} callback Handles the response
     * @example update('1234', {body:data}, (error, data) => {})
     */
    unfollow(wishlistFollowId, body, callback) {
        logger.debug(`${this._classInfo}.unfollow(${wishlistFollowId})`);

        WishlistFollowModel.findOneAndUpdate(
            { _id: wishlistFollowId },
            body,
            { new: true })
            .then(data => {
                //returns WishlistFollow data
                callback(null, data);
            })
            .catch(error => {
                logger.error(`${this._classInfo}.unfollow(${wishlistFollowId})::findOneAndUpdate`, error);
                return callback(error);
            });
    }

    /**
     * Updates an WishlistFollow
     * @param {string} id WishlistFollow id
     * @param {object} body WishlistFollow data
     * @param {requestCallback} callback Handles the response
     * @example update('1234', {body:data}, (error, data) => {})
     */
    update(id, body, callback) {
        logger.debug(`${this._classInfo}.update(${id})`);

        WishlistFollowModel.findOneAndUpdate(
            { _id: id },
            body,
            { new: true })
            .then(data => {
                //returns WishlistFollow data
                callback(null, data);
            })
            .catch(error => {
                logger.error(`${this._classInfo}.update(${id})::findOneAndUpdate`, error);
                return callback(error);
            });
    }
}

module.exports = new WishlistFollowRepository();

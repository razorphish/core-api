// Wishlist Repository
const WishlistModel = require('../../models/wishlist/wishlist.model');
const logger = require('../../../../lib/winston.logger');

/**
 * This callback type is called `requestCallback` and is displayed as a global symbol.
 *
 * @callback requestCallback
 * @param {*} error
 * @param {*} data
 */

/**
 * Wishlist Repository
 * @author Antonio Marasco
 * @class Wishlist Repository
 */
class WishlistRepository {
    /**
     * Constructor for client
     */
    constructor() {
        //Logging Info
        this._classInfo = '*** [Wishlist].repository';
    }

    /**
     * Gets all Wishlists
     * @param {requestCallback} callback Handles the response
     * @example all((error, data) => {})
     */
    all(callback) {
        logger.debug(`${this._classInfo}.all()`);

        WishlistModel.find({}, {
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

        WishlistModel
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
     * Delete a Wishlist by id
     * @param {string} id Wishlist Id
     * @param {requestCallback} callback Handles the response
     * @example delete('123456789', (error, data) => {})
     */
    delete(id, callback) {
        logger.debug(`${this._classInfo}.delete(${id})`);

        WishlistModel.deleteOne({ _id: id })
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
     * @param {string} id Wishlist id
     * @param {requestCallback} callback Handles the response
     * @example get('123456789', (error, data) => {})
     */
    get(id, callback) {
        logger.debug(`${this._classInfo}.get(${id})`);

        WishlistModel.findById(
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
     * @param {object} body Wishlist data
     * @param {requestCallback} callback Handles the response
     * @example insert({property: value}, (error, data) => {})
     */
    insert(body, callback) {
        logger.debug(`${this._classInfo}.insert()`, body);

        //Created
        body.password = body.password || 'Letme1n!';

        WishlistModel.create(body)
            .then(data => {
                callback(null, data);
            })
            .catch(error => {
                logger.error(`${this._classInfo}.insert()::save`, error);
                callback(error);
            });
    }

    /**
     * Updates an Wishlist
     * @param {string} id Wishlist id
     * @param {object} body Wishlist data
     * @param {requestCallback} callback Handles the response
     * @example update('1234', {body:data}, (error, data) => {})
     */
    update(id, body, callback) {
        logger.debug(`${this._classInfo}.update(${id})`);

        WishlistModel.findOneAndUpdate(
            { _id: id },
            body,
            { new: true })
            .then(data => {
                //returns Wishlist data
                callback(null, data);
            })
            .catch(error => {
                logger.error(`${this._classInfo}.update(${id})::findOneAndUpdate`, error);
                return callback(error);
            });
    }
}

module.exports = new WishlistRepository();

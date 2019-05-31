// Wishlist Repository
const WishlistModel = require('../../models/wishlist/wishlist.model');
const WishlistNotificationModel = require('../../models/wishlist/wishlist-notification.model');
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
     * Gets all Wishlists with details
     * @param {requestCallback} callback Handles the response
     * @example all((error, data) => {})
     */
    allDetails(callback) {
        logger.debug(`${this._classInfo}.allDetails()`);

        WishlistModel.find({})
            .populate({
                path: 'userId',
                select: '_id firstName lastName email username'
            })
            .populate({
                path: 'notifications',
                select: 'endpoint keys expirationTime'
            })
            .then(data => {
                callback(null, data);
            })
            .catch(error => {
                logger.error(`${this._classInfo}.allDetails::find`, error);
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
     * Gets a user by a user Id
     * @param {string} userId UserId to get user by
     * @param {requestCallback} callback Handles the response
     * @example byRole('User', (error, data) => {})
     */
    byUserId(userId, callback) {
        logger.debug(`${this._classInfo}.byUserId(${userId})`);

        WishlistModel.find(
            {
                userId: userId
            })
            .populate({
                path: 'items',
                match: { statusId: { $ne: 'deleted' } },
                select: '_id userId name categoryId price quantity url notes purchased purchasedBy image statusId sortOrder dateCreated',
                populate: [
                    {
                        path: 'userId',
                        select: '_id email firstName lastName'
                    }
                ]
            })
            .populate({
                path: 'follows',
                select: '_id userId endpoint expirationTime keys notifiedOnAddItem notifiedOnRemoveItem notifiedOnCompletion statusId',
                match: { statusId: { $ne: 'deleted' } },
                populate: [
                    {
                        path: 'userId',
                        select: '_id email firstName lastName'
                    }
                ]
            })
            .then((data) => {
                callback(null, data);
            })
            .catch(error => {
                logger.error(`${this._classInfo}.byUserId::find`, error);
                callback(error);
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
                    _id: 1,
                    statusId: 1,
                    privacy: 1,
                    name: 1,
                    preferences: 1,
                    items: 1,
                    dateExpire: 1,
                    userId: 1
                }
            })
            .populate({
                path: 'items',
                match: { statusId: { $ne: 'deleted' } },
                select: '_id name categoryId price quantity url notes purchased purchasedBy image statusId sortOrder dateCreated'
            })
            .populate({
                path: 'follows',
                select: '_id userId endpoint expirationTime keys notifiedOnAddItem notifiedOnRemoveItem notifiedOnCompletion',
                match: { statusId: { $ne: 'deleted' } }
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
    * Gets a single wishlist details
    * @param {string} wishlistId wishlist id
    * @param {requestCallback} callback Handles the response
    * @example get('123456789', (error, data) => {})
    */
    getDetails(wishlistId, callback) {
        logger.debug(`${this._classInfo}.getDetails(${wishlistId})`);

        WishlistModel.findById(
            wishlistId,
            null,
            {
            })
            .populate({
                path: 'userId',
                select: '_id firstName lastName email username'
            })
            .populate({
                path: 'items',
                match: { statusId: { $ne: 'deleted' } },
                select: '_id userId name categoryId price quantity url notes purchased purchasedBy image statusId sortOrder dateCreated',
                populate: [
                    {
                        path: 'userId',
                        select: '_id email firstName lastName'
                    }
                ]
            })
            .populate({
                path: 'follows',
                select: '_id userId endpoint expirationTime keys notifiedOnAddItem notifiedOnRemoveItem notifiedOnCompletion statusId',
                match: { statusId: { $ne: 'deleted' } },
                populate: [
                    {
                        path: 'userId',
                        select: '_id email firstName lastName'
                    }
                ]
            })
            .then(data => {
                callback(null, data);
            })
            .catch(error => {
                logger.error(`${this._classInfo}.getDetails(${wishlistId})`, error);
                return callback(error);
            });
    }

    /**
    * Gets a single User details
    * @param {string} id user id
    * @param {requestCallback} callback Handles the response
    * @example get('123456789', (error, data) => {})
    */
    getNotifications(id, callback) {
        logger.debug(`${this._classInfo}.getNotifications(${id})`);

        WishlistModel.findById(
            id,
            null,
            {
            })
            .populate({
                path: 'userId',
                select: '_id firstName lastName email username'
            })
            .populate({
                path: 'notifications',
                select: 'endpoint keys expirationTime'
            })
            .then(data => {
                callback(null, data);
            })
            .catch(error => {
                logger.error(`${this._classInfo}.getNotifications(${id})`, error);
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
     * Inserts a Wishlist
     * @param {object} body Wishlist data
     * @param {requestCallback} callback Handles the response
     * @example insert({property: value}, (error, data) => {})
     */
    insertNotification(body, callback) {
        logger.debug(`${this._classInfo}.insertNotification()`, body);

        WishlistNotificationModel.create(body)
            .then(data => {
                callback(null, data);
            })
            .catch(error => {
                logger.error(`${this._classInfo}.insertNotification()::save`, error);
                callback(error);
            });
    }

    /**
     * Gets all Wishlists
     * @param {requestCallback} callback Handles the response
     * @example all((error, data) => {})
     */
    search(query, fieldSelect, callback) {
        logger.debug(`${this._classInfo}.all()`);

        WishlistModel.find(
            query,
            fieldSelect
        )
            .then(data => {
                callback(null, data);
            })
            .catch(error => {
                logger.error(`${this._classInfo}.all::find`, error);
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

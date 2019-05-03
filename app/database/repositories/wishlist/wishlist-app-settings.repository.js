// Wishlist Application Settings Repository
const WishlistAppSettingsModel = require('../../models/wishlist/wishlist-app-settings.model');
const logger = require('../../../../lib/winston.logger');

/**
 * This callback type is called `requestCallback` and is displayed as a global symbol.
 *
 * @callback requestCallback
 * @param {*} error
 * @param {*} data
 */

/**
 * Wishlist application settings Repository
 * @author Antonio Marasco
 * @class Wishlist application settings Repository
 */
class WishlistAppSettingsRepository {
    /**
     * Constructor for client
     */
    constructor() {
        //Logging Info
        this._classInfo = '*** [WishlistAppSettings].repository';
    }

    /**
     * Gets all Wishlists
     * @param {requestCallback} callback Handles the response
     * @example all((error, data) => {})
     */
    all(callback) {
        logger.debug(`${this._classInfo}.all()`);

        WishlistAppSettingsModel.find({}, {})
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

        WishlistAppSettingsModel
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

        WishlistAppSettingsModel.deleteOne({ _id: id })
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

        WishlistAppSettingsModel.findById(
            id,
            null,
            {
                select: {
                    _id: 1,
                    notifications: 1,
                    emailNotifications: 1
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
     * Inserts a Wishlist App Settings
     * @param {object} body Wishlist data
     * @param {requestCallback} callback Handles the response
     * @example insert({property: value}, (error, data) => {})
     */
    insert(body, callback) {
        logger.debug(`${this._classInfo}.insert()`, body);

        WishlistAppSettingsModel.create(body)
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

        WishlistAppSettingsModel.findOneAndUpdate(
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

    /**
    * Updates an email notification
    * @param {string} id Wishlist id
    * @param {string} emailNotificationId Email notification Id
    * @param {object} body Wishlist data
    * @param {requestCallback} callback Handles the response
    * @example update('1234', {body:data}, (error, data) => {})
    */
    updateEmailNotification(id, emailNotificationId, body, callback) {
        logger.debug(`${this._classInfo}.updateEmailNotification(${id},${emailNotificationId})`);

        WishlistAppSettingsModel.findOneAndUpdate(
            {
                _id: id,
                'emailNotifications._id': emailNotificationId,
            },
            {
                $set: {
                    'emailNotifications.$': body
                }
            },
            { new: true })
            .then(data => {
                //returns Wishlist data
                callback(null, data);
            })
            .catch(error => {
                logger.error(`${this._classInfo}.updateEmailNotification(${id},${emailNotificationId})::findOneAndUpdate`, error);
                return callback(error);
            });
    }

    /**
    * Updates a notification
    * @param {string} id Wishlist id
    * @param {string} notificationId Notificaiton Id
    * @param {object} body Wishlist data
    * @param {requestCallback} callback Handles the response
    * @example update('1234', {body:data}, (error, data) => {})
    */
    updateNotification(id, notificationId, body, callback) {
        logger.debug(`${this._classInfo}.updateNotification(${id},${notificationId})`);

        WishlistAppSettingsModel.findOneAndUpdate(
            {
                _id: id,
                'notifications._id': notificationId,
            },
            {
                $set: {
                    'notifications.$': body
                }
            },
            { new: true })
            .then(data => {
                //returns Wishlist data
                callback(null, data);
            })
            .catch(error => {
                logger.error(`${this._classInfo}.updateNotification(${id},${notificationId})::findOneAndUpdate`, error);
                return callback(error);
            });
    }

    /**
     * Updates a notification action
     * @param {string} id Wishlist id
     * @param {string} notificationId Notificaiton Id
     * @param {string} actionId Action Id
     * @param {object} body Wishlist data
     * @param {requestCallback} callback Handles the response
     * @example update('1234', {body:data}, (error, data) => {})
     */
    updateNotificationAction(id, notificationId, actionId, body, callback) {
        logger.debug(`${this._classInfo}.updateNotificationAction(${id},${notificationId},${actionId})`);

        WishlistAppSettingsModel.findOneAndUpdate(
            {
                _id: id,
                'notifications._id': notificationId,
                'notifications.actions._id': actionId
            },
            {
                $set: {
                    'notifications.$.actions': body
                }
            },
            { new: true })
            .then(data => {
                //returns Wishlist data
                callback(null, data);
            })
            .catch(error => {
                logger.error(`${this._classInfo}.updateNotificationAction(${id},${notificationId},${actionId})::findOneAndUpdate`, error);
                return callback(error);
            });
    }
}

module.exports = new WishlistAppSettingsRepository();

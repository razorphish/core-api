// Notification Repository
const NotificationModel = require('../../models/core/notification.model');
const logger = require('../../../../lib/winston.logger');

/**
 * This callback type is called `requestCallback` a
 * nd is displayed as a global symbol.
 *
 * @callback requestCallback
 * @param {*} error
 * @param {*} data
 */

/**
 * Notification Repository
 * @author Antonio Marasco
 * @class Notification Repository
 */
class NotificationRepository {
    /**
     * Constructor for client
     */
    constructor() {
        //Logging Info
        this._classInfo = '*** [Item].repository';
    }

    /**
     * Gets all Items
     * @param {requestCallback} callback Handles the response
     * @example all((error, data) => {})
     */
    all(callback) {
        logger.debug(`${this._classInfo}.all()`);

        NotificationModel.find({}, {
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
     * Gets all Items with details
     * @param {requestCallback} callback Handles the response
     * @example all((error, data) => {})
     */
    allDetails(callback) {
        logger.debug(`${this._classInfo}.allDetails()`);

        NotificationModel.find({},
            {
                accountId: 0
            })
            .populate({
                path: 'userId',
                select: '_id firstName lastName email username'
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
     * Gets all Items paginated
     * @param {number} [skip=10] Page number
     * @param {number} [top=10] Per Page
     * @param {requestCallback} callback Handles the response
     * @example allPaged(2, 10, (error, data) => {} )
     */
    allPaged(skip, top, callback) {
        logger.debug(`${this._classInfo}.allPaged(${skip}, ${top})`);

        NotificationModel
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
     * Delete a Notification by id
     * @param {string} id Notification Id
     * @param {requestCallback} callback Handles the response
     * @example delete('123456789', (error, data) => {})
     */
    delete(id, callback) {
        logger.debug(`${this._classInfo}.delete(${id})`);

        NotificationModel.deleteOne({ _id: id })
            .then((data) => {
                callback(null, data);
            })
            .catch(error => {
                logger.error(`${this._classInfo}.delete(${id})::remove`, error);
                return callback(error);
            });
    }

    /**
     * Gets a single Item
     * @param {string} id Notification id
     * @param {requestCallback} callback Handles the response
     * @example get('123456789', (error, data) => {})
     */
    get(id, callback) {
        logger.debug(`${this._classInfo}.get(${id})`);

        NotificationModel.findById(
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
    * Gets a single Notification details
    * @param {string} id Notification id
    * @param {requestCallback} callback Handles the response
    * @example get('123456789', (error, data) => {})
    */
    getDetails(id, callback) {
        logger.debug(`${this._classInfo}.getDetails(${id})`);

        NotificationModel.findById(
            id,
            null,
            {
            })
            .populate({
                path: 'userId',
                select: '_id firstName lastName email username'
            })
            .then(data => {
                callback(null, data);
            })
            .catch(error => {
                logger.error(`${this._classInfo}.getDetails(${id})`, error);
                return callback(error);
            })
    }

    /**
     * Inserts a Item
     * @param {object} body Notification data
     * @param {requestCallback} callback Handles the response
     * @example insert({property: value}, (error, data) => {})
     */
    insert(body, callback) {
        logger.debug(`${this._classInfo}.insert()`, body);

        NotificationModel.create(body)
            .then(data => {
                callback(null, data);
            })
            .catch(error => {
                logger.error(`${this._classInfo}.insert()::save`, error);
                callback(error);
            });
    }

    /**
     * Updates an Item
     * @param {string} id Notification id
     * @param {object} body Notification data
     * @param {requestCallback} callback Handles the response
     * @example update('1234', {body:data}, (error, data) => {})
     */
    update(id, body, callback) {
        logger.debug(`${this._classInfo}.update(${id})`);

        NotificationModel.findOneAndUpdate(
            { _id: id },
            body,
            { new: true })
            .then(data => {
                //returns Notification data
                callback(null, data);
            })
            .catch(error => {
                logger.error(`${this._classInfo}.update(${id})::findOneAndUpdate`, error);
                return callback(error);
            });
    }
}

module.exports = new NotificationRepository();

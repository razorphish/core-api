// Item Repository
const ItemModel = require('../../models/Item/Item.model');
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
 * Item Repository
 * @author Antonio Marasco
 * @class Item Repository
 */
class ItemRepository {
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

        ItemModel.find({}, {
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

        ItemModel.find({},
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

        ItemModel
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
     * Delete a Item by id
     * @param {string} id Item Id
     * @param {requestCallback} callback Handles the response
     * @example delete('123456789', (error, data) => {})
     */
    delete(id, callback) {
        logger.debug(`${this._classInfo}.delete(${id})`);

        ItemModel.deleteOne({ _id: id })
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
     * @param {string} id Item id
     * @param {requestCallback} callback Handles the response
     * @example get('123456789', (error, data) => {})
     */
    get(id, callback) {
        logger.debug(`${this._classInfo}.get(${id})`);

        ItemModel.findById(
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
    * Gets a single item details
    * @param {string} id item id
    * @param {requestCallback} callback Handles the response
    * @example get('123456789', (error, data) => {})
    */
    getDetails(id, callback) {
        logger.debug(`${this._classInfo}.getDetails(${id})`);

        ItemModel.findById(
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
     * @param {object} body Item data
     * @param {requestCallback} callback Handles the response
     * @example insert({property: value}, (error, data) => {})
     */
    insert(body, callback) {
        logger.debug(`${this._classInfo}.insert()`, body);

        ItemModel.create(body)
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
     * @param {string} id Item id
     * @param {object} body Item data
     * @param {requestCallback} callback Handles the response
     * @example update('1234', {body:data}, (error, data) => {})
     */
    update(id, body, callback) {
        logger.debug(`${this._classInfo}.update(${id})`);

        ItemModel.findOneAndUpdate(
            { _id: id },
            body,
            { new: true })
            .then(data => {
                //returns Item data
                callback(null, data);
            })
            .catch(error => {
                logger.error(`${this._classInfo}.update(${id})::findOneAndUpdate`, error);
                return callback(error);
            });
    }
}

module.exports = new ItemRepository();

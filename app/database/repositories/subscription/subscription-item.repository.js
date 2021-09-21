// [SubscriptionItem] Repository
const model = require('../../models/subscription/subscription-item.model');
const logger = require('../../../../lib/winston.logger');

/**
 * [SubscriptionItem] Repository
 * @author Antonio Marasco
 * @class [SubscriptionItem] Repository
 */
class SubscriptionItemRepository {
  /**
   * Constructor for {subscriptionItem}
   */
  constructor() {
    // Logging Info
    this._classInfo = '*** [SubscriptionItem].repository';
  }

  /**
   * Gets all {subscriptionItem}
   * @param {requestCallback} callback Handles the response
   * @example all((error, data) => {})
   */
  all(callback) {
    logger.debug(`${this._classInfo}.all()`);

    model
      .find(
        {},
        {
          accountId: 0
        }
      )
      .then((data) => {
        callback(null, data);
      })
      .catch((error) => {
        logger.error(`${this._classInfo}.all::find`, error);
        callback(error);
      });
  }

  /**
   * Gets all {subscriptionItem} paginated
   * @param {number} [skip=10] Page number
   * @param {number} [top=10] Per Page
   * @param {requestCallback} callback Handles the response
   * @example allPaged(2, 10, (error, data) => {} )
   */
  allPaged(skip, top, callback) {
    logger.debug(`${this._classInfo}.allPaged(${skip}, ${top})`);

    model
      .find({}, null, {
        skip,
        //   select: {
        //     password: 0
        //   },
        top,
        sort: { lastName: 1 }
      })
      .then((data) => {
        callback(null, data);
      })
      .catch((error) => {
        logger.error(`${this._classInfo}.allPaged(${skip}, ${top})`, error);
        return callback(error, null);
      });
  }

  /**
   * Delete a {subscriptionItem} by id
   * @param {string} id Id of entity
   * @param {requestCallback} callback Handles the response
   * @example delete('123456789', (error, data) => {})
   */
  delete(id, callback) {
    logger.debug(`${this._classInfo}.delete(${id})`);

    model
      .deleteOne({ _id: id })
      .then((data) => {
        callback(null, data);
      })
      .catch((error) => {
        logger.error(`${this._classInfo}.delete(${id})::remove`, error);
        return callback(error);
      });
  }

  /**
   * Gets a single {subscriptionItem}
   * @param {string} id Entity id
   * @param {requestCallback} callback Handles the response
   * @example get('123456789', (error, data) => {})
   */
  get(id, callback) {
    logger.debug(`${this._classInfo}.get(${id})`);

    model
      .findById(id, null, {
        select: {
          accountId: 1
        }
      })
      .then((data) => {
        callback(null, data);
      })
      .catch((error) => {
        logger.error(`${this._classInfo}.get(${id})`, error);
        return callback(error);
      });
  }

  /**
   * Inserts a {subscriptionItem}
   * @param {object} body Entity data
   * @param {requestCallback} callback Handles the response
   * @example insert({property: value}, (error, data) => {})
   */
  insert(body, callback) {
    logger.debug(`${this._classInfo}.insert()`, body);

    model
      .create(body)
      .then((data) => {
        callback(null, data);
      })
      .catch((error) => {
        logger.error(`${this._classInfo}.insert()::save`, error);
        callback(error);
      });
  }

  /**
   * Updates an {subscriptionItem}
   * @param {string} id Entity Id
   * @param {object} body Entity data
   * @param {requestCallback} callback Handles the response
   * @example update('1234', {body:data}, (error, data) => {})
   */
  update(id, body, callback) {
    logger.debug(`${this._classInfo}.update(${id})`);

    model
      .findOneAndUpdate({ _id: id }, body, { new: true })
      .then((data) => {
        // returns {subscriptionItem} data
        callback(null, data);
      })
      .catch((error) => {
        logger.error(
          `${this._classInfo}.update(${id})::findOneAndUpdate`,
          error
        );
        return callback(error);
      });
  }
}

module.exports = new SubscriptionItemRepository();

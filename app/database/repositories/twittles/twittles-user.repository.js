// [Twittles] User Repository
const model = require('../../models/account/user.model');
const logger = require('../../../../lib/winston.logger');

/**
 * This callback type is called `requestCallback` and is displayed as a global symbol.
 *
 * @callback requestCallback
 * @param {*} error
 * @param {*} data
 */

/**
 * [Twittles] users Repository
 * @author Antonio Marasco
 * @class TwittlesUserRepository
 */
class TwittlesUserRepository {
  /**
   * Constructor for client
   */
  constructor() {
    // Logging Info
    this._classInfo = '*** [TwittlesUserRepository].repository';
  }

  /**
   * Gets all {Twittles} Users
   * @param {requestCallback} callback Handles the response
   * @example all((error, data) => {})
   */
  all(callback) {
    logger.debug(`${this._classInfo}.all()`);

    model
      .find({}, {})
      .then((data) => {
        callback(null, data);
      })
      .catch((error) => {
        logger.error(`${this._classInfo}.all::find`, error);
        callback(error);
      });
  }

  /**
   * Gets all {Twittles} users with details
   * @param {requestCallback} callback Handles the response
   * @example all((error, data) => {})
   */
  allDetails(callback) {
    logger.debug(`${this._classInfo}.all()`);

    model
      .find(
        {
          applicationId: '5c4b1303fc13ae60b4000000'
        },
        {
          password: 0
        }
      )
      .populate({
        path: 'applicationId',
        select: '_id name'
      })
      .then((data) => {
        callback(null, data);
      })
      .catch((error) => {
        logger.error(`${this._classInfo}.all::find`, error);
        callback(error);
      });
  }

  /**
   * Gets all {Twittles} paginated
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
   * Gets a single {Twittles} user details
   * @param {string} id user id
   * @param {requestCallback} callback Handles the response
   * @example get('123456789', (error, data) => {})
   */
  details(id, callback) {
    logger.debug(`${this._classInfo}.get(${id})`);

    model
      .findById(id, null, {
        select: {
          password: 0
        }
      })
      .populate({
        path: 'wishlists',
        select:
          '_id name preferences statusId privacy items dateExpire dateCreated items',
        populate: [
          {
            path: 'items',
            match: { statusId: { $ne: 'deleted' } },
            select:
              '_id name categoryId price quantity url notes purchased image statusId sortOrder userId dateCreated'
          },
          {
            path: 'follows',
            select:
              '_id userId notifiedOnAddItem notifiedOnRemoveItem notifiedOnCompletion',
            match: { statusId: { $ne: 'deleted' } }
          }
        ]
      })
      .populate({
        path: 'wishlistItemCategories',
        select: '_id name dateCreated'
      })
      .populate({
        path: 'wishlistFollows',
        select:
          '_id dateCreated notifiedOnAddItem notifiedOnRemoveItem notifiedOnCompletion statusId',
        match: { statusId: { $ne: 'deleted' } },
        populate: [
          {
            path: 'wishlistId',
            select: '_id name'
          }
        ]
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
   * Gets a single {Twittles} user
   * @param {string} id User id
   * @param {requestCallback} callback Handles the response
   * @example get('123456789', (error, data) => {})
   */
  get(id, callback) {
    logger.debug(`${this._classInfo}.get(${id})`);

    model
      .findById(id, null, {
        select: {
          _id: 1,
          notifications: 1,
          emailNotifications: 1
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
   * Updates a {Twittles} User
   * @param {string} id User id
   * @param {object} body User data
   * @param {requestCallback} callback Handles the response
   * @example update('1234', {body:data}, (error, data) => {})
   */
  update(id, body, callback) {
    logger.debug(`${this._classInfo}.update(${id})`);

    model
      .findOneAndUpdate({ _id: id }, body, { new: true })
      .then((data) => {
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

module.exports = new TwittlesUserRepository();

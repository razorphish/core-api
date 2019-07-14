// Token Repository
const logger = require('../../../../lib/winston.logger');
const TokenModel = require('../../models/auth/token.model');
const ObjectId = require('mongoose').Types.ObjectId;

/**
 * This callback type is called `repositoryCallback` and is displayed as a global symbol.
 *
 * @callback repositoryCallback
 * @param {*} error
 * @param {*} data
 */

/**
 * Token repository
 */
class TokenRepository {
  /**
   * Constructor for token
   */
  constructor() {
    //Logging Info
    this._classInfo = '*** [Token].repository';
  }

  /**
 * Gets all tokens
 * @param {function} callback Callback function for all
 */
  all(callback) {
    logger.debug(`${this._classInfo}.all()`);

    TokenModel.find()
      .then(data => {
        callback(null, data);
      })
      .catch(error => {
        logger.error(`${this._classInfo}.all::find`, error);
        callback(error);
      });
  }

  /**
   * Gets a single token by its token value
   * @param {object} accessToken Token value
   * @param {function} callback Callback function for success/fail
   */
  byToken(accessToken, callback) {
    logger.debug(`${this._classInfo}.byToken(${accessToken})`);

    TokenModel.findOne({ value: accessToken })
      .then((docs) => {
        callback(null, docs);
      })
      .catch(error => {
        logger.error(`${this._classInfo}.byToken(${accessToken})::findOne`, error);
        return callback(error);
      });
  }

  byTokenWithUser(accessToken, callback) {
    logger.debug(`${this._classInfo}.byTokenWithUser(${accessToken})`);

    TokenModel
      .findOne({ value: accessToken })
      .populate({
        path: 'userId',
        select: 'firstName lastName email homePhone avatar'
      })
      .then((docs) => {
        callback(null, docs);
      })
      .catch(error => {
        logger.error(`${this._classInfo}.byTokenWithUser(${accessToken})::findOne`, error);
        return callback(error);
      });
  }

  /**
   * Gets token(s) by user id
   * @param {object} id Id of entity
   * @param {function} callback Callback function for success/fail
   */
  byUserId(userId, callback) {
    logger.debug(`${this._classInfo}.byUserId(${userId})`);

    TokenModel
      .find(
        {
          userId: userId
        }
      )
      .then((docs) => {
        callback(null, docs);
      })
      .catch(error => {
        logger.error(`${this._classInfo}.byUserId(${userId})::find`, error);
        return callback(error);
      });
  }

  /**
   * Delete an tokens by id
   * @param {string} id Id of item to delete
   * @param {function} callback function on success/fail
   */
  delete(id, callback) {
    logger.debug(`${this._classInfo}.delete(${id})`);

    TokenModel
      .deleteOne(
        {
          _id: id
        }
      )
      .then((data) => {
        callback(null, data);
      })
      .catch(error => {
        logger.error(`${this._classInfo}.delete(${id})::remove`, error);
        return callback(error, null);
      });
  }

  /**
   * Delete a tokens by it's hash value
   * @param {string} tokenHash Hash of item to delete
   * @param {function} callback function on success/fail
   */
  deleteByTokenHash(tokenHash, callback) {
    logger.debug(`${this._classInfo}.deleteByTokenHash(${tokenHash})`);

    TokenModel
      .deleteOne(
        {
          value: { $in: tokenHash }
        }
      )
      .then((data) => {
        callback(null, data);
      })
      .catch(error => {
        logger.error(`${this._classInfo}.deleteByTokenHash(${tokenHash})::remove`, error);
        return callback(error, null);
      });
  }

  /**
   * Delete all tokens by user id
   * @param {string} userId userId of token(s) to delete
   * @param {function} callback function on success/fail
   */
  deleteByUserId(userId, callback) {
    logger.debug(`${this._classInfo}.deleteByUserId(${userId})`);

    TokenModel
      .deleteMany(
        {
          userId: userId
        }
      )
      .then((data) => {
        callback(null, data);
      })
      .catch(error => {
        logger.error(`${this._classInfo}.deleteByUserId(${userId})::remove`, error);
        return callback(error, null);
      });
  }

  /**
   * Gets a token with User Info
   * @param {function} callback Callback function for success/fail
   */
  details(callback) {
    logger.debug(`${this._classInfo}.details()`);

    TokenModel
      .find(
        {}
      )
      .populate({
        path: 'userId',
        select: 'firstName lastName email username status'
      })
      .then((docs) => {
        callback(null, docs);
      })
      .catch(error => {
        logger.error(`${this._classInfo}.details(${id})::find`, error);
        return callback(error);
      });
  }

  /**
   * Gets a token with User Info
   * @param {object} id Id of entity
   * @param {function} callback Callback function for success/fail
   */
  detailsById(id, callback) {
    logger.debug(`${this._classInfo}.detailsById(${id})`);

    TokenModel
      .findById(
        id
      )
      .populate({
        path: 'userId',
        select: 'firstName lastName email username status'
      })
      .then((docs) => {
        callback(null, docs);
      })
      .catch(error => {
        logger.error(`${this._classInfo}.detailsById(${id})::findById`, error);
        return callback(error);
      })
  }

  /**
   * Gets a single token with User Info by its token value
   * @param {object} accessToken Token value
   * @param {function} callback Callback function for success/fail
   */
  detailsByToken(accessToken, callback) {
    logger.debug(`${this._classInfo}.detailsByToken(${accessToken})`);

    TokenModel
      .findOne(
        {
          value: accessToken
        }
      )
      .populate({
        path: 'userId',
        select: 'firstName lastName email username status'
      })
      .then((docs) => {
        callback(null, docs);
      }).catch(error => {
        logger.error(`${this._classInfo}.detailsByToken(${id})::findOne`, error);
        return callback(error);
      })
  }

  /**
   * Gets all tokens with User Info by a user's id
   * @param {object} userId User Id 
   * @param {function} callback Callback function for success/fail
   */
  detailsByUserId(userId, callback) {
    logger.debug(`${this._classInfo}.detailsByUserId(${userId})`);

    TokenModel
      .find(
        {
          userId: userId
        }
      )
      .populate({
        path: 'userId',
        select: 'firstName lastName email username status'
      })
      .then((docs) => {
        callback(null, docs);
      })
      .catch(error => {
        logger.error(`${this._classInfo}.detailsByUserId(${userId})::find`, error);
        return callback(error);
      });
  }

  /**
   * Gets a single token
   * @param {object} id Id of entity
   * @param {function} callback Callback function for success/fail
   */
  get(id, callback) {
    logger.debug(`${this._classInfo}.get(${id})`);

    TokenModel
      .findById(
        id
      )
      .then((data) => {
        callback(null, data);
      })
      .catch(error => {
        logger.error(`${this._classInfo}.get(${id})::findById`, error);
        return callback(error);
      });
  }

  /**
   * Inserts a token into db
   * @param {object} token Object that contain Users info
   * @param {function} callback Callback function success/fail
   */
  insert(token, callback) {
    logger.debug(`${this._classInfo}.insert()`, token);

    var model = new TokenModel(token);

    model.save((err, data) => {
      if (err) {
        logger.error(`${this._classInfo}.insert()::save`, err);
        return callback(err);
      }

      callback(null, data);
    });
  }

  /**
   * Search tokens by search query
   * @param {any} query Query containting fields to obtain
   * @param {Function} callback(err: Error, document)
   *  Called after find
   *  err {Error}: the output of the computation
   *  data {any}: whether a change has occurred
   */
  search(query, callback) {
    logger.debug(`${this._classInfo}.search(${query})`);

    TokenModel
      .findOne(
        query,
      )
      .then((data) => {
        callback(null, data);
      })
      .catch(error => {
        logger.error(`${this._classInfo}.search(${query})::findOne`, error);
        return callback(error);
      });
  }

  /**
   * Updates a token
   * @param {string} id token id
   * @param {object} token Wishlist data
   * @param {requestCallback} callback Handles the response
   * @example update('1234', {body:data}, (error, data) => {})
   */
  update(id, token, callback) {
    logger.debug(`${this._classInfo}.update(${id})`);

    TokenModel.findOneAndUpdate(
      { _id: id },
      token,
      { new: true })
      .then(data => {
        callback(null, data);
      })
      .catch(error => {
        logger.error(`${this._classInfo}.update(${id})::findOneAndUpdate`, error);
        return callback(error);
      });
  }
}

module.exports = new TokenRepository();

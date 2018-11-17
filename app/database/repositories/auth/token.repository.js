// Token Repository
const mongoose = require('mongoose'),
  logger = require('../../../../lib/winston.logger'),
  TokenModel = require('../../models/auth/token.model');

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
   * Delete an item by id
   * @param {string} id Id of item to delete
   * @param {function} callback function on success/fail
   */
  delete(id, callback) {
    logger.debug(`${this._classInfo}.delete(${id})`);

    TokenModel.remove(
      {
        _id: id
      },
      (err, data) => {
        if (err) {
          logger.error(`${this._classInfo}.delete(${id})::remove`, err);
          return callback(err, null);
        }
        callback(null, data);
      }
    );
  }

  /**
   * Delete an item by id
   * @param {string} tokenHash Hash of item to delete
   * @param {function} callback function on success/fail
   */
  deleteByTokenHash(tokenHash, callback) {
    logger.debug(`${this._classInfo}.deleteByTokenHash(${tokenHash})`);

    TokenModel.remove(
      {
        value: tokenHash
      },
      (err, data) => {
        if (err) {
          logger.error(
            `${this._classInfo}.deleteByTokenHash(${tokenHash}):;remove`,
            err
          );
          return callback(err, null);
        }
        callback(null, data);
      }
    );
  }

  /**
   * Delete an item by id
   * @param {string} userId userId of token(s) to delete
   * @param {function} callback function on success/fail
   */
  deleteByUserId(userId, callback) {
    logger.debug(`${this._classInfo}.deleteByUserId(${userId})`);

    TokenModel.remove(
      {
        userId: userId
      },
      (err, data) => {
        if (err) {
          logger.error(
            `${this._classInfo}.deleteByUserId(${userId})::remove`,
            err
          );
          return callback(err, null);
        }
        callback(null, data);
      }
    );
  }

  /**
   * Gets a single User
   * @param {object} id Id of entity
   * @param {function} callback Callback function for success/fail
   */
  get(id, callback) {
    logger.debug(`${this._classInfo}.get(${id})`);

    TokenModel.findById(id, (err, data) => {
      if (err) {
        logger.error(`${this._classInfo}.get(${id})::findById`, err);
        return callback(err);
      }

      callback(null, data);
    });
  }

  /**
   * Gets a single User
   * @param {object} id Id of entity
   * @param {function} callback Callback function for success/fail
   */
  getByUserId(userId, callback) {
    logger.debug(`${this._classInfo}.getByUserId(${userId})`);

    TokenModel.findOne({ userId: userId }, (err, data) => {
      if (err) {
        logger.error(`${this._classInfo}.all(${userId})::findOne`, err);
        return callback(err);
      }

      callback(null, data);
    });
  }

  /**
   * Gets a single User
   * @param {object} accessToken Token value
   * @param {function} callback Callback function for success/fail
   */
  getByToken(accessToken, callback) {
    logger.debug(`${this._classInfo}.getByToken(${accessToken})`);

    TokenModel.findOne({ value: accessToken }, (err, data) => {
      if (err) {
        logger.error(
          `${this._classInfo}.getByToken(${accessToken})::findOne`,
          err
        );
        return callback(err);
      }

      callback(null, data);
    });
  }

  /**
   * Inserts a User into db
   * @param {object} body Object that contain Users info
   * @param {function} callback Callback function success/fail
   */
  insert(body, callback) {
    logger.debug(`${this._classInfo}.insert()`, body);

    var model = new TokenModel();

    model.userId = body.userId;
    model.loginProvider = body.loginProvider;
    model.name = body.name;
    model.value = body.value;
    model.dateExpire = body.dateExpire;
    model.expiresIn = body.expiresIn;
    model.scope = body.scope;
    model.type = body.type;

    model.save((err, data) => {
      if (err) {
        logger.error(`${this._classInfo}.insert()::save`, err);
        return callback(err);
      }

      callback(null, data);
    });
  }
}

module.exports = new TokenRepository();

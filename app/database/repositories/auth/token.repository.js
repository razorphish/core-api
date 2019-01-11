// Token Repository
const logger = require('../../../../lib/winston.logger');
const TokenModel = require('../../models/auth/token.model');
const ObjectId = require('mongoose').Types.ObjectId;

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
 * Gets all Users
 * @param {function} callback Callback function for all
 */
  all(callback) {
    logger.debug(`${this._classInfo}.all()`);

    TokenModel.countDocuments((err, count) => {
      logger.debug(`${this._classInfo}.all()::count`, count);

      TokenModel.find({}, {}, (err, data) => {
        if (err) {
          logger.error(`${this._classInfo}.all()::find`, err);
          return callback(err, null);
        }

        callback(null, {
          count: count,
          data: data
        });
      });
    });
  }

  /**
   * Gets a single User
   * @param {object} accessToken Token value
   * @param {function} callback Callback function for success/fail
   */
  byToken(accessToken, callback) {
    logger.debug(`${this._classInfo}.byToken(${accessToken})`);

    TokenModel.findOne({ value: accessToken }, (err, docs) => {
      if (err) {
        logger.error(
          `${this._classInfo}.byToken(${accessToken})::findOne`,
          err
        );
        return callback(err);
      }

      callback(null, docs);
    });
  }

  /**
   * Gets a single User
   * @param {object} id Id of entity
   * @param {function} callback Callback function for success/fail
   */
  byUserId(userId, callback) {
    logger.debug(`${this._classInfo}.getByUserId(${userId})`);

    //TokenModel.find({ userId: new ObjectId(userId) }, (err, data) => {
    let query = { userId: userId };
    TokenModel.find(query, (err, docs) => {
      if (err) {
        logger.error(`${this._classInfo}.all(${userId})::findOne`, err);
        return callback(err);
      }
      callback(null, docs);
    });
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
    model.protocol = body.protocol;

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

// Client Repository
const mongoose = require('mongoose');
const ClientModel = require('../../models/auth/client.model');
const crypto = require('crypto');
const logger = require('../../../../lib/winston.logger');
const utils = require('../../../../lib/utils');

/**
 * Client Repo class
 */
class ClientRepository {
  /**
   * Constructor for client
   */
  constructor() {
    //Logging Info
    this._classInfo = '*** [Client].repository';
  }

  /**
   * Gets all Users
   * @param {function} callback Callback function for all
   */
  all(callback) {
    logger.debug(`${this._classInfo}.all()`);

    ClientModel.countDocuments((err, count) => {
      logger.debug(`${this._classInfo}.all()::count`, count);

      ClientModel.find({}, { password: 0, salt: 0 }, (err, data) => {
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
   * Gets all clients paged
   * @param {number} skip Page number
   * @param {number} top Number of items per page
   * @param {function} callback Callback function
   */
  allPaged(skip, top, callback) {
    logger.debug(`${this._classInfo}.allPaged(${skip}, ${top})`);

    ClientModel.countDocuments((err, itemCount) => {
      var count = itemCount;
      logger.verbose(
        `${this._classInfo}.allPaged()`,
        `Skip ${skip} Top: ${top} Count: ${count}`
      );

      ClientModel.find({}, { password: 0, salt: 0 })
        .sort({
          name: 1
        })
        .skip(skip)
        .limit(top)
        .exec((err, data) => {
          if (err) {
            logger.error(`${this._classInfo}.allPaged()`, err);
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
 * @param {object} clientId Id of entity
 * @param {function} callback Callback function for success/fail
 */
  byClientId(clientId, callback) {
    logger.debug(`${this._classInfo}.getByClientId(${clientId})`);

    ClientModel.findOne({ clientId: clientId }, (err, data) => {
      if (err) {
        logger.error(
          `${this._classInfo}.getByClientId(${clientId})::findOne`,
          err
        );
        return callback(err);
      }

      callback(null, data);
    });
  }

  /**
   * Delete item by id
   * @param {string} id Id of item to delete
   * @param {function} callback function on success/fail
   */
  delete(id, callback) {
    logger.debug(`${this._classInfo}.delete(${id})`);

    ClientModel.deleteOne(
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
   * Gets a single item
   * @param {object} id Id of entity
   * @param {function} callback Callback function for success/fail
   */
  get(id, callback) {
    logger.debug(`${this._classInfo}.get(${id})`);

    ClientModel.findById(id, (err, data) => {
      if (err) {
        logger.error(`${this._classInfo}.get(${id})::findById`, err);
        return callback(err);
      }
      // get client Id
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

    var model = new ClientModel(body);
    model.clientSecret = utils.getUid(256);

    model.save((err, data) => {
      if (err) {
        logger.error(`${this._classInfo}.insert()::save`, err);
        return callback(err);
      }

      callback(null, data);
    });
  }

  /**
   * Refreshes the user token
   * @param {string} id Id of client
   * @param {function} callback Callback function
   */
  refreshToken(id, callback) {
    logger.debug(`${this._classInfo}.refreshToken(${id})`);

    let clientSecret = utils.getUid(256);

    let tokenHash = crypto
      .createHash('sha1')
      .update(clientSecret)
      .digest('hex');

    let body = {
      clientSecret: tokenHash
    }

    ClientModel.findOneAndUpdate(
      { _id: id },
      body,
      { new: true },
      (err, item) => {
        if (err) {
          logger.error(`${this._classInfo}.refreshToken(${id})::findById`, err);
          return callback(error);
        }

        //returns User data
        callback(null, {
          tokenHash: clientSecret,
          clientSecret: item.clientSecret
        });
      });
  }

  /**
   * Updates an User
   * @param {any} id Id of User
   * @param {object} body Object containing User information
   * @param {function} callback Callback function fail/success
   */
  update(id, body, callback) {
    logger.debug(`${this._classInfo}.update(${id})`);

    ClientModel.findOneAndUpdate(
      { _id: id },
      body,
      { new: true },
      (err, result) => {
        if (err) {
          logger.error(`${this._classInfo}.update(${id})::findOneAndUpdate`, err);
          return callback(error);
        }

        //returns data
        callback(null, result);
      });
  }

  /**
   * Verify a consuming client
   * @param {string} clientId Api client id
   * @param {string} clientSecret Api client secret
   * @param {string} origin Origin from which call is being made
   * @param {function} callback callback function
   */
  verify(clientId, clientSecret, origin, callback) {
    logger.debug(
      `${this._classInfo}.verify(${clientId}, ${clientSecret}, ${origin})`
    );

    ClientModel.getVerified(
      clientId,
      clientSecret,
      origin,
      (err, client, reason) => {
        if (err) {
          logger.error(
            `${this._classInfo}
            .verify(${clientId}, ${clientSecret}, ${origin})`,
            err
          );
          return callback(err, null);
        }

        if (client) {
          logger.debug(
            `${this._classInfo}.verify(${clientId}, ${clientSecret}, ${origin}) OK`
          );
          callback(null, client);
          return;
        } else {
          logger.debug(
            `${this._classInfo}.verify(${clientId}, ${clientSecret}, ${origin}) FAIL. Add ${origin} to db`
          );

          callback(null, null, reason);
          return;
        }

        //If desired, analyze reason
        //var reasons = client.failedVerification;
      }
    );
  }
}

module.exports = new ClientRepository();

// Client Repository
const mongoose = require('mongoose');
const ClientModel = require('../../models/auth/client.model');
const logger = require('../../../../lib/winston.logger');
const httpSign = require('../../../security/signers/http-sign');

/**
 * This callback type is called `requestCallback` and is displayed as a global symbol.
 *
 * @callback requestCallback
 * @param {*} error
 * @param {*} data
 */

/**
 * Client Repository
 * @author Antonio Marasco
 * @class ClientRepository
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
   * Gets all Clients
   * @param {requestCallback} callback Handles the response
   * @example all((error, data) => {})
   */
  all(callback) {
    logger.debug(`${this._classInfo}.all()`);

    ClientModel.find(
      {},
      {
        hash: 0
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
   * Gets all Clients paginated
   * @param {number} [skip=10] Page number
   * @param {number} [top=10] Per Page
   * @param {requestCallback} callback Handles the response
   * @example allPaged(2, 10, (error, data) => {} )
   */
  allPaged(skip, top, callback) {
    logger.debug(`${this._classInfo}.allPaged(${skip}, ${top})`);

    ClientModel
      .find({},
        null,
        {
          skip: skip,
          select: {
            password: 0,
            salt: 0,
            refreshToken: 0,
            loginAttempts: 0,
            lockUntil: 0,
            hash: 0
          },
          top: top,
          sort: { name: 1 }
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
   * Gets client by ClintId
   * @param {string} token User token
   * @param {requestCallback} callback Handles the response
   * @example byRefreshToken('123456789asdfghjkl', (error, data) => {})
   */
  byClientId(clientId, callback) {
    logger.debug(`${this._classInfo}.getByClientId(${clientId})`);

    ClientModel.findOne(
      {
        clientId: clientId
      },
      {
        hash: 0
      })
      .then(data => {

        callback(null, data);
      })
      .catch(error => {
        logger.error(
          `${this._classInfo}.getByClientId(${clientId})::findOne`,
          error
        );
        return callback(error);
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
      }, {
        hash: 0
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
   * Gets a single item with details
   * @param {object} id Id of entity
   * @param {function} callback Callback function for success/fail
   */
  detail(id, callback) {
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
   * Gets a single item
   * @param {object} id Id of entity
   * @param {function} callback Callback function for success/fail
   */
  get(id, callback) {
    logger.debug(`${this._classInfo}.get(${id})`);

    ClientModel.findById(id, {
      hash: 0
    }, (err, data) => {
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
    //encode hash
    model.clientSecret = httpSign.decode(model.hash);

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

    let hash = httpSign.getUid(256);

    let clientSecret = httpSign.decode(hash);

    let body = {
      clientSecret: clientSecret,
      hash: hash
    }

    ClientModel.findOneAndUpdate(
      { _id: id },
      body,
      {
        new: true
      },
      (err, item) => {
        if (err) {
          logger.error(`${this._classInfo}.refreshToken(${id})::findById`, err);
          return callback(error);
        }

        //returns User data
        callback(null, {
          hash: item.hash,
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

// State Repository
const StateModel = require('../../models/core/state.model');
const logger = require('../../../../lib/winston.logger');

/**
 * State Repo class
 */
class StateRepository {
  /**
   * Constructor for state
   */
  constructor() {
    //Logging Info
    this._classInfo = '*** [State].repository';
  }

  /**
   * Gets all Users
   * @param {function} callback Callback function for all
   */
  all(callback) {
    logger.debug(`${this._classInfo}.all()`);

    StateModel.find()
      .then(data => {
        callback(null, data);
      })
      .catch(error => {
        logger.error(`${this._classInfo}.all()::find`, error);
        return callback(error, null);
      })
  }

  /**
   * Delete item by id
   * @param {string} id Id of item to delete
   * @param {function} callback function on success/fail
   */
  delete(id, callback) {
    logger.debug(`${this._classInfo}.delete(${id})`);

    StateModel.deleteOne(
      {
        _id: id
      })
      .then(data => {
        callback(null, data);
      })
      .catch(error => {
        logger.error(`${this._classInfo}.delete(${id})::remove`, error);
        return callback(error, null);
      });
  }

  /**
 * Gets a single item
 * @param {object} id Id of entity
 * @param {function} callback Callback function for success/fail
 */
  get(id, callback) {
    logger.debug(`${this._classInfo}.get(${id})`);
    StateModel.findById(id)
      .then(data => {
        callback(null, data);
      })
      .catch(error => {
        logger.error(`${this._classInfo}.get(${id})::findById`, error);
        return callback(error);
      });
  }

  /**
   * Inserts a User into db
   * @param {object} body Object that contain Users info
   * @param {function} callback Callback function success/fail
   */
  insert(body, callback) {
    logger.debug(`${this._classInfo}.insert()`, body);

    var model = new StateModel(body);

    logger.verbose(`${this._classInfo}.insert()::model`, model);

    model.save((err, data) => {
      if (err) {
        logger.error(`${this._classInfo}.insert()::save`, err);
        return callback(err);
      }

      callback(null, data);
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

    StateModel.findById(id, (err, item) => {
      if (err) {
        logger.error(`${this._classInfo}.update(${id})::findById`, err);
        return callback(error);
      }

      Object.assign(item, body).save((err, data) => {
        if (err) {
          logger.error(`${this._classInfo}.update(${id})::save`, err);
          return callback(err);
        }

        //returns User data
        callback(null, data);
      });
    });
  }

}

module.exports = new StateRepository();

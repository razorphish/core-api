// [Job] Repository
const model = require('../../models/job/job.model');
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
 * [Job] Repository
 * @author Antonio Marasco
 * @class [Job] Repository
 */
class JobRepository {
  /**
   * Constructor for client
   */
  constructor() {
    //Logging Info
    this._classInfo = '*** [Job].repository';
  }

  /**
   * Gets all Items
   * @param {requestCallback} callback Handles the response
   * @example all((error, data) => {})
   */
  all(callback) {
    logger.debug(`${this._classInfo}.all()`);

    model
      .find(
        {},
        {
          accountId: 0,
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
   * Gets all Items with details
   * @param {requestCallback} callback Handles the response
   * @example all((error, data) => {})
   */
  allDetails(callback) {
    logger.debug(`${this._classInfo}.allDetails()`);

    model
      .find(
        {},
        {
          accountId: 0,
        }
      )
      .populate({
        path: 'userId',
        select: '_id firstName lastName email username',
      })
      .then((data) => {
        callback(null, data);
      })
      .catch((error) => {
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

    model
      .find({}, null, {
        skip: skip,
        //   select: {
        //     password: 0
        //   },
        top: top,
        sort: { lastName: 1 },
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
   * Delete a job by id
   * @param {string} id Id
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
   * Find entity by search query
   * @param {any} query Query containting fields to obtain
   * @param {Function} callback(err: Error, document)
   *  Called after find
   *  err {Error}: the output of the computation
   *  data {any}: whether a change has occurred
   */
  find(query, callback) {
    logger.debug(`${this._classInfo}.search(${JSON.stringify(query)})`);

    model
      .find(query)
      .then((data) => {
        callback(null, data);
      })
      .catch((error) => {
        logger.error(`${this._classInfo}.search::findOne`, error);
        return callback(error);
      });
  }

  /**
   * Gets a single entity
   * @param {string} id Id
   * @param {requestCallback} callback Handles the response
   * @example get('123456789', (error, data) => {})
   */
  get(id, callback) {
    logger.debug(`${this._classInfo}.get(${id})`);

    model
      .findById(id, null, {
        select: {
          accountId: 1,
        },
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
   * Gets a single entity details
   * @param {string} id Entity id
   * @param {requestCallback} callback Handles the response
   * @example get('123456789', (error, data) => {})
   */
  getDetails(id, callback) {
    logger.debug(`${this._classInfo}.getDetails(${id})`);

    model
      .findById(id, null, {})
      .populate({
        path: 'userId',
        select: '_id firstName lastName email username',
      })
      .then((data) => {
        callback(null, data);
      })
      .catch((error) => {
        logger.error(`${this._classInfo}.getDetails(${id})`, error);
        return callback(error);
      });
  }

  /**
   * Inserts a Item
   * @param {object} job Entity data
   * @param {requestCallback} callback Handles the response
   * @example insert({property: value}, (error, data) => {})
   */
  insert(job, callback) {
    logger.debug(`${this._classInfo}.insert()`, job);

    model
      .create(job)
      .then((data) => {
        callback(null, data);
      })
      .catch((error) => {
        logger.error(`${this._classInfo}.insert()::save`, error);
        callback(error);
      });
  }

  /**
   * Updates an Item
   * @param {string} id Entity id
   * @param {object} job Entity data
   * @param {requestCallback} callback Handles the response
   * @example update('1234', {job:data}, (error, data) => {})
   */
  update(id, job, callback) {
    logger.debug(`${this._classInfo}.update(${id})`);

    model
      .findOneAndUpdate({ _id: id }, job, { new: true })
      .then((data) => {
        //returns entity data
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

  /**
   * Updates many jobs at once
   * @param {any} filter query or search object
   * @param {any} update values to update to
   * @param {function} callback done
   */
  updateMany(filter, update, callback) {
    logger.debug(`${this._classInfo}.update(${JSON.stringify(filter)})`);

    model
      .updateMany(filter, update)
      .then((data) => {
        //returns entity data
        callback(null, data);
      })
      .catch((error) => {
        logger.error(
          `${this._classInfo}.updateMany(${JSON.stringify(filter)})`,
          error
        );
        return callback(error);
      });
  }
}

module.exports = new JobRepository();

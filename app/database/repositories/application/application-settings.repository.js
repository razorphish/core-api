// Application Settings Repository
const model = require('../../models/application/application-setting.model');
const logger = require('../../../../lib/winston.logger');

/**
 * This callback type is called `requestCallback` and is displayed as a global symbol.
 *
 * @callback requestCallback
 * @param {*} error
 * @param {*} data
 */

/**
 * Application settings Repository
 * @author Antonio Marasco
 * @class Application settings Repository
 */
class ApplicationSettingsRepository {
  /**
   * Constructor for client
   */
  constructor() {
    // Logging Info
    this._classInfo = '*** [ApplicationSettings].repository';
  }

  /**
   * Gets all {applicationSettings} settings
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
   * Gets all {applicationSettings} paginated
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
        //     emails: 0,
        //     notifications: 1
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
   * Delete an {applicationSettings} by id
   * @param {string} id {applicationSettings} Id
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
   * Gets a single {applicationSettings}
   * @param {string} id {applicationSettings} id
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
   * Inserts a {applicationSettings}
   * @param {object} body {applicationSettings} data
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
   * Inserts {applicationSettings} email notification setting
   * @param {string} id {applicationSettings} id
   * @param {object} body {applicationSettings} email notification data
   * @param {requestCallback} callback Handles the response
   * @example insertEmailNotification('1234', {body:data}, (error, data) => {})
   */
  insertEmailNotification(id, body, callback) {
    logger.debug(`${this._classInfo}.insertEmailNotification(${id})`);

    model
      .update(
        {
          _id: id
        },
        {
          $push: {
            emailNotifications: body
          }
        },
        { new: true, upsert: true }
      )
      .then((data) => {
        // returns {applicationSettings} data
        callback(null, data);
      })
      .catch((error) => {
        logger.error(
          `${this._classInfo}.insertEmailNotification(${id})::update`,
          error
        );
        return callback(error);
      });
  }

  /**
   * Inserts a {applicationSettings} notification
   * @param {string} id {applicationSettings} id
   * @param {object} body {applicationSettings} notification data
   * @param {requestCallback} callback Handles the response
   * @example insertNotification('1234', '4567', {body:data}, (error, data) => {})
   */
  insertNotification(id, body, callback) {
    logger.debug(`${this._classInfo}.insertNotification(${id})`);

    /** We use the findOneAndUpdate with upsert = true as this will
     * combine the filter and data together to insert dat
     */
    const conditions = {
      _id: id
    };

    const update = {
      $push: {
        notifications: body
      }
    };

    const options = { new: true, upsert: true };

    const arr = body.vibrate.split(',');
    body.vibrate = arr;

    model
      .update(conditions, update, options)
      .then((data) => {
        // returns {applicationSettings} notification data
        callback(null, data);
      })
      .catch((error) => {
        logger.error(
          `${this._classInfo}.insertNotification(${id})::update`,
          error
        );
        return callback(error);
      });
  }

  /**
   * Inserts a {applicationSettings} notification action
   * @param {string} id {applicationSettings} id
   * @param {string} notificationId {string} notification Id
   * @param {object} body {applicationSettings} notification action data
   * @param {requestCallback} callback Handles the response
   * @example insertNotificationAction('1234', '4567', {body:data}, (error, data) => {})
   */
  insertNotificationAction(id, notificationId, body, callback) {
    logger.debug(
      `${this._classInfo}.insertNotificationAction(${id},${notificationId})`
    );

    const conditions = {
      _id: id,
      'notifications._id': notificationId
    };

    const update = {
      $push: {
        'notifications.$.actions': body
      }
    };

    const options = { new: true, upsert: true };

    model
      .update(conditions, update, options)
      .then((data) => {
        // returns {applicationSettings} notification data
        callback(null, data);
      })
      .catch((error) => {
        logger.error(
          `${this._classInfo}.insertNotificationAction(${id})::update`,
          error
        );
        return callback(error);
      });
  }

  /**
   * Updates an {applicationSettings}
   * @param {string} id {applicationSettings} id
   * @param {object} body Wis{applicationSettings}hlist data
   * @param {requestCallback} callback Handles the response
   * @example update('1234', {body:data}, (error, data) => {})
   */
  update(id, body, callback) {
    logger.debug(`${this._classInfo}.update(${id})`);

    model
      .findOneAndUpdate({ _id: id }, body, { new: true })
      .then((data) => {
        // returns {applicationSettings} data
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
   * Updates {applicationSettings} email notification setting
   * @param {string} id {applicationSettings} id
   * @param {string} emailNotificationId Email notification Id
   * @param {object} body {applicationSettings} email notification data
   * @param {requestCallback} callback Handles the response
   * @example update('1234', {body:data}, (error, data) => {})
   */
  updateEmailNotification(id, emailNotificationId, body, callback) {
    logger.debug(
      `${this._classInfo}.updateEmailNotification(${id},${emailNotificationId})`
    );

    model
      .findOneAndUpdate(
        {
          _id: id,
          'emailNotifications._id': emailNotificationId
        },
        {
          $set: {
            'emailNotifications.$': body
          }
        },
        { new: true }
      )
      .then((data) => {
        // returns {applicationSettings} data
        callback(null, data);
      })
      .catch((error) => {
        logger.error(
          `${this._classInfo}.updateEmailNotification(${id},${emailNotificationId})::findOneAndUpdate`,
          error
        );
        return callback(error);
      });
  }

  /**
   * Updates a {applicationSettings} notification
   * @param {string} id {applicationSettings} id
   * @param {string} notificationId Notification Id
   * @param {object} body {applicationSettings} notification data
   * @param {requestCallback} callback Handles the response
   * @example update('1234', '4567', {body:data}, (error, data) => {})
   */
  updateNotification(id, notificationId, body, callback) {
    logger.debug(
      `${this._classInfo}.updateNotification(${id},${notificationId})`
    );

    model
      .findOneAndUpdate(
        {
          _id: id,
          'notifications._id': notificationId
        },
        {
          $set: {
            'notifications.$': body
          }
        },
        { new: true }
      )
      .then((data) => {
        // returns {applicationSettings} notification data
        callback(null, data);
      })
      .catch((error) => {
        logger.error(
          `${this._classInfo}.updateNotification(${id},${notificationId})::findOneAndUpdate`,
          error
        );
        return callback(error);
      });
  }

  /**
   * Updates a {applicationSettings} notification action
   * @param {string} id {applicationSettings} id
   * @param {string} notificationId Notificaiton Id
   * @param {string} actionId Action Id
   * @param {object} body {applicationSettings} action data
   * @param {requestCallback} callback Handles the response
   * @example update('1234', '4567', '789', {body:data}, (error, data) => {})
   */
  updateNotificationAction(id, notificationId, actionId, body, callback) {
    logger.debug(
      `${this._classInfo}.updateNotificationAction(${id},${notificationId},${actionId})`
    );

    model
      .findOneAndUpdate(
        {
          _id: id,
          'notifications._id': notificationId,
          'notifications.actions._id': actionId
        },
        {
          $set: {
            'notifications.$.actions': body
          }
        },
        { new: true }
      )
      .then((data) => {
        // returns {applicationSettings} notification action data
        callback(null, data);
      })
      .catch((error) => {
        logger.error(
          `${this._classInfo}.updateNotificationAction(${id},${notificationId},${actionId})::findOneAndUpdate`,
          error
        );
        return callback(error);
      });
  }
}

module.exports = new ApplicationSettingsRepository();

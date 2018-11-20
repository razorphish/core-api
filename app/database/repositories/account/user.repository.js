// User Repository
const UserModel = require('../../models/account/user.model');
const logger = require('../../../../lib/winston.logger');

/**
 * Users
 */
class UserRepository {
  /**
   * Constructor for client
   */
  constructor() {
    //Logging Info
    this._classInfo = '*** [User].repository';
  }

  /**
   * Adds a device to User
   * @param {any} id Id of User
   * @param {object} body Object containing User information
   * @param {function} callback Callback function fail/success
   */
  addDevice(id, body, callback) {
    logger.debug(`${this._classInfo}.addDevice(${id})`, body);

    UserModel.findById(id, (err, item) => {
      if (err) {
        logger.error(`${this._classInfo}.addDevice(${id})::findById`, err);
        return callback(err);
      }

      item.devices.push({
        pushRegistrationId: body.pushRegistrationId,
        cordova: body.cordova,
        model: body.model,
        platform: body.platform,
        uuid: body.uuid,
        version: body.version,
        manufacturer: body.manufacturer,
        isVirtual: body.isVirtual,
        serial: body.serial
      });

      item.save((err, data) => {
        if (err) {
          logger.error(`${this._classInfo}.addDevice(${id})::save`, err);
          return callback(err);
        }

        //returns User data
        callback(null, data);
      });
    });
  }

  /**
   * Gets all Users
   * @param {function} callback Callback function for all
   */
  all(callback) {
    logger.debug(`${this._classInfo}.all()`);

    UserModel.countDocuments((err, count) => {
      if (err) {
        logger.error(`${this._classInfo}.all()::count`, err);
        return callback(err);
      }

      logger.debug(`${this._classInfo}.all()::count`, count);

      UserModel.find(
        {},
        {
          password: 0,
          salt: 0,
          refreshToken: 0,
          loginAttempts: 0,
          lockUntil: 0
        },
        (err, data) => {
          if (err) {
            logger.error(`${this._classInfo}.all()::find`, err);
            return callback(err, null);
          }

          callback(null, {
            count: count,
            data: data
          });
        }
      );
    });
  }

  authenticate(username, password, callback) {
    logger.debug(`${this._classInfo}.authenticate(${username}, ${password})`);

    UserModel.getAuthenticated(username, password, (err, user, reason) => {
      if (err) {
        logger.error(
          `${this._classInfo}.authenticate(${username}, ${password})`,
          err
        );
        return callback(err, null);
      }

      if (user) {
        callback(null, user);
        return;
      }

      // otherwise we can determine why we failed
      //var reasons = user.failedLogin;
      // switch (reason) {
      //   case reasons.NOT_FOUND:
      //   case reasons.PASSWORD_INCORRECT:
      //     // note: these cases are usually treated the same - don't tell
      //     // the user *why* the login failed, only that it did
      //     break;
      //   case reasons.MAX_ATTEMPTS:
      //     // send email or otherwise notify user that account is
      //     // temporarily locked
      //     break;
      //}

      //tell client password fail
      callback(null, null, reason);
    });
  }

  /**
   * Gets all Users paged
   * @param {number} skip Page number
   * @param {number} top Number of items per page
   * @param {function} callback Callback function
   */
  allPaged(skip, top, callback) {
    logger.debug(`${this._classInfo}.allPaged(${skip}, ${top})`);

    UserModel.countDocuments((err, count) => {
      if (err) {
        logger.error(
          `${this._classInfo}.allPaged(${skip}, ${top})::count`,
          err
        );
        return callback(err);
      }

      logger.debug(
        `${this._classInfo}.allPaged(${skip}, ${top})::count`,
        count
      );

      UserModel.find(
        {},
        {
          password: 0,
          salt: 0,
          refreshToken: 0,
          loginAttempts: 0,
          lockUntil: 0
        }
      )
        .sort({
          name: 1
        })
        .skip(skip)
        .limit(top)
        .exec((err, data) => {
          if (err) {
            logger.error(`${this._classInfo}.allPaged(${skip}, ${top})`, err);
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
   * @param {object} id Id of entity
   * @param {function} callback Callback function for success/fail
   */
  byRefreshToken(token, callback) {
    logger.debug(`${this._classInfo}.byRefreshToken(${token})`);

    UserModel.findOne({ 'refreshToken.value': token }, (err, data) => {
      if (err) {
        logger.error(
          `${this._classInfo}.byRefreshToken(${token})::findOne`,
          err
        );
        return callback(err);
      }

      callback(null, data);
    });
  }

  byRole(role, callback) {
    logger.debug(`${this._classInfo}.byRole(${JSON.stringify(role)})`);

    UserModel.countDocuments(
      { roles: { $elemMatch: { name: role } } },
      (err, count) => {
        if (err) {
          logger.error(
            `${this._classInfo}.byRole(${JSON.stringify(role)})::count`,
            err
          );
          return callback(err);
        }

        logger.debug(
          `${this._classInfo}.byRole(${JSON.stringify(role)})::count`,
          count
        );

        UserModel.find(
          { roles: { $elemMatch: { name: role } } },
          {
            password: 0,
            salt: 0,
            refreshToken: 0,
            loginAttempts: 0,
            lockUntil: 0
          },
          (err, data) => {
            if (err) {
              logger.error(
                `${this._classInfo}.byRole(${JSON.stringify(role)})::find`,
                err
              );
              return callback(err, null);
            }

            callback(null, {
              count: count,
              data: data
            });
          }
        );
      });
  }

  /**
   * Gets a single User
   * @param {object} id Id of entity
   * @param {function} callback Callback function for success/fail
   */
  byUsername(username, callback) {
    logger.debug(`${this._classInfo}.byUsername(${username})`);

    UserModel.findOne({ username: username }, (err, data) => {
      if (err) {
        logger.error(
          `${this._classInfo}.byUsername(${username})::findOne`,
          err
        );
        return callback(err);
      }

      callback(null, data);
    });
  }

  /**
   * Delete a User ry id
   * @param {string} id Id of User to delete
   * @param {function} callback function on success/fail
   */
  delete(id, callback) {
    logger.debug(`${this._classInfo}.delete(${id})`);

    UserModel.deleteOne(
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
   * Gets a single User
   * @param {object} id Id of entity
   * @param {function} callback Callback function for success/fail
   */
  get(id, callback) {
    logger.debug(`${this._classInfo}.get(${id})`);

    UserModel.findById(
      id,
      {
        password: 0,
        salt: 0,
        refreshToken: 0,
        loginAttempts: 0,
        lockUntil: 0
      },
      (err, data) => {
        if (err) {
          logger.error(`${this._classInfo}.get(${id})`, err);
          return callback(err);
        }

        callback(null, data);
      }
    );
  }

  /**
   * Inserts a User into db
   * @param {object} body Object that contain Users info
   * @param {function} callback Callback function success/fail
   */
  insert(body, callback) {
    logger.debug(`${this._classInfo}.insert()`, body);

    var model = new UserModel(body);

    //Created
    if (!body.password) {
      model.password = 'Letme1n!';
    } else {
      model.password = body.password;
    }

    model.save((err, data) => {
      if (err) {
        logger.error(`${this._classInfo}.insert()::save`, err);
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
  passwordMatch(username, password, callback) {
    logger.debug(`${this._classInfo}.passwordMatch(${username}, ${password})`);

    UserModel.findOne({ username: username }, (err, result) => {
      if (err) {
        logger.error(
          `${this._classInfo}.passwordMatch(${username}, ${password})::findOne`,
          err
        );
        return callback(err);
      }

      //make sure password matches
      result.comparePassword(password, (err, isMatch) => {
        if (err) {
          logger.error(
            `${
            this._classInfo
            }.passwordMatch(${username}, ${password})::comparePassword`,
            err
          );
          callback(err);
        }

        logger.debug(
          `${this._classInfo}.passwordMatch(${username}, ${password})::isMatch`,
          isMatch
        );

        if (isMatch) {
          callback(null, result);
        } else {
          callback(null, null);
        }
      });
    });
  }

  /**
   * Get basic User information
   * @param {number} skip Page number
   * @param {number} top Number of items per page
   * @param {function} callback Callback function on success/fail
   */
  summary(skip, top, callback) {
    logger.debug(`${this._classInfo}.summary(${skip}, ${top})`);

    UserModel.countDocuments((err, count) => {
      if (err) {
        logger.error(
          `${this._classInfo}.summarry(${skip}, ${top})::count`,
          err
        );
        return callback(err);
      }

      logger.debug(`${this._classInfo}.summary(${skip}, ${top})::count`, count);

      UserModel.find(
        {},
        {
          password: 0,
          salt: 0,
          refreshToken: 0,
          loginAttempts: 0,
          lockUntil: 0
        }
      )
        .skip(skip)
        .limit(top)
        .exec((err, data) => {
          if (err) {
            logger.error(
              `${this._classInfo}.summary(${skip}, ${top})::find`,
              err
            );
            return callback(err, null);
          }

          return callback(null, {
            count: count,
            data: data
          });
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

    UserModel.findOneAndUpdate(
      { _id: id },
      body,
      { new: true },
      (err, item) => {
        if (err) {
          logger.error(`${this._classInfo}.update(${id})::findById`, err);
          return callback(err);
        }

        //returns User data
        callback(null, item);
      });
  }

  /**
   * Updates an User
   * @param {any} id Id of User
   * @param {object} body Object containing User information
   * @param {function} callback Callback function fail/success
   */
  updateSummary(id, body, callback) {
    logger.debug(`${this._classInfo}.updateSummary(${id})`, body);

    UserModel.findById(id, (err, item) => {
      if (err) {
        logger.error(`${this._classInfo}.updateSummary(${id})::findById`, err);
        return callback(err);
      }

      if (body.password) {
        item.password = body.password;
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

  /**
   * Updates an User
   * @param {any} id Id of User
   * @param {object} body Object containing User information
   * @param {function} callback Callback function fail/success
   */
  updateToken(id, token, callback) {
    logger.debug(`${this._classInfo}.updateToken(${id}, ${token})`);

    UserModel.findOneAndUpdate(
      { _id: id },
      { refreshToken: token },
      { new: true },
      (err, result) => {
        if (err) {
          logger.error(
            `${this._classInfo}.updateToken(${id}, ${token})::findByIdAndUpdate`,
            err
          );
          return callback(error);
        }

        callback(null, result);

      });
  }
}

module.exports = new UserRepository();

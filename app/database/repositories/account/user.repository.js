// User Repository
const UserModel = require('../../models/account/user.model');
const logger = require('../../../../lib/winston.logger');

/**
 * This callback type is called `requestCallback` and is displayed as a global symbol.
 *
 * @callback requestCallback
 * @param {*} error
 * @param {*} data
 */

/**
 * User Repository
 * @author Antonio Marasco
 * @class User Repository
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
   * @param {string} userId Id of User
   * @param {*} body Object containing User information
   * @param {requestCallback} callback Handles the response
   * @example addDevice('123456789, {property:value}, (err, data) => {})
   */
  addDevice(userId, body, callback) {

    logger.debug(`${this._classInfo}.addDevice(${userId})`, body);

    UserModel.findById(userId, (err, item) => {
      if (err) {
        logger.error(`${this._classInfo}.addDevice(${userId})::findById`, err);
        return callback(err);
      }

      item.devices.push(body);

      item.save((err, data) => {
        if (err) {
          logger.error(`${this._classInfo}.addDevice(${userId})::save`, err);
          return callback(err);
        }

        //returns User data
        callback(null, data);
      });
    });
  }

  /**
   * Gets all Users
   * @param {requestCallback} callback Handles the response
   * @example all((error, data) => {})
   */
  all(callback) {
    logger.debug(`${this._classInfo}.all()`);

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

        callback(null, data);
      }
    );
  }

  /**
   * Gets all Users paginated
   * @param {number} [skip=10] Page number
   * @param {number} [top=10] Per Page
   * @param {requestCallback} callback Handles the response
   * @example allPaged(2, 10, (error, data) => {} )
   */
  allPaged(skip, top, callback) {
    logger.debug(`${this._classInfo}.allPaged(${skip}, ${top})`);

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

        callback(null, data);
      });
  }

  /**
 * Authenticate user
 * @param {string} username username to authenticate
 * @param {string} password password to validate
 * @param {requestCallback} callback Handles the response
 * @example authenticate('myusername', 'password', (error, data)=>{})
 */
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
   * Gets users by refresh token
   * @param {string} token User token
   * @param {requestCallback} callback Handles the response
   * @example byRefreshToken('123456789asdfghjkl', (error, data) => {})
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

  /**
   * Gets a user by a role
   * @param {string} role role to get user by
   * @param {requestCallback} callback Handles the response
   * @example byRole('User', (error, data) => {})
   */
  byRole(role, callback) {
    logger.debug(`${this._classInfo}.byRole(${JSON.stringify(role)})`);

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

        callback(null, data);
      }
    );
  }

  /**
   * Gets a single User by their username
   * @param {string} username username of user
   * @param {requestCallback} callback Handles the response
   * @example byUsername('username', (error, data) => {})
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
   * Delete a User by id
   * @param {string} id user Id
   * @param {requestCallback} callback Handles the response
   * @example delete('123456789', (error, data) => {})
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
   * @param {string} id user id
   * @param {requestCallback} callback Handles the response
   * @example get('123456789', (error, data) => {})
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
   * Inserts a User
   * @param {object} body User data
   * @param {requestCallback} callback Handles the response
   * @example insert({property: value}, (error, data) => {})
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
   * Determines if input password matches correct password
   * @param {string} username username 
   * @param {string} password password
   * @param {requestCallback} callback Handles the response
   * @example passwordMatch('username', 'password123', (error, data) => {})
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
          logger.error(`${this._classInfo}.passwordMatch(${username}, ${password})::comparePassword`,
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
   * Get a list of users exposing limited properties
   * @param {number} skip Page number
   * @param {number} top Per Page
   * @param {requestCallback} callback Handles the response
   * @example summary(3, 10, (error, data) => {})
   */
  summary(skip, top, callback) {
    logger.debug(`${this._classInfo}.summary(${skip}, ${top})`);

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

        return callback(null, data);
      });
  }

  /**
   * Updates an User
   * @param {string} id user id
   * @param {object} body user data
   * @param {requestCallback} callback Handles the response
   * @example update('1234', {body:data}, (error, data) => {})
   */
  update(id, body, callback) {
    logger.debug(`${this._classInfo}.update(${id})`);

    UserModel.findOneAndUpdate(
      { _id: id },
      body,
      { new: true },
      (err, item) => {
        if (err) {
          logger.error(`${this._classInfo}.update(${id})::findOneAndUpdate`, err);
          return callback(err);
        }

        //returns User data
        callback(null, item);
      }
    );
  }

  /**
   * Updates an User
   * @param {string} id User id
   * @param {object} body User data
   * @param {requestCallback} callback Handles the response
   * @example updateSummary('123456789', {property:value}, (error, data) => {})
   */
  updateSummary(id, body, callback) {
    logger.debug(`${this._classInfo}.updateSummary(${id})`, body);

    UserModel.findOneAndUpdate(
      { _id: id },
      body,
      { new: true },
      (err, item) => {
        if (err) {
          logger.error(`${this._classInfo}.updateSummary(${id})::findById`, err);
          return callback(err);
        }

        //returns User data
        callback(null, item);
      });
  }

  /**
   * Updates an User
   * @param {string} id User id
   * @param {object} body User data
   * @param {requestCallback} callback Handles the response
   * @example updateToken('123456789, '123456789asdfghjkl', (error, data) => {})
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
      }
    );
  }
}

module.exports = new UserRepository();

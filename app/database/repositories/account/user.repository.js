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

    UserModel.findByIdAndUpdate(
      userId,
      { devices: body },
      {
        new: true,
        runValidators: true
      })
      .then(data => {
        //returns User data
        callback(null, data);
      })
      .catch(error => {
        logger.error(`${this._classInfo}.addDevice(${userId})::findByIdAndUpdate`, error);
        return callback(error);
      });
  }

  /**
   * Gets all Users
   * @param {requestCallback} callback Handles the response
   * @example all((error, data) => {})
   */
  all(callback) {
    logger.debug(`${this._classInfo}.all()`);

    UserModel.find({}, {
      password: 0,
      salt: 0,
      refreshToken: 0,
      loginAttempts: 0,
      lockUntil: 0
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
   * Gets all Users paginated
   * @param {number} [skip=10] Page number
   * @param {number} [top=10] Per Page
   * @param {requestCallback} callback Handles the response
   * @example allPaged(2, 10, (error, data) => {} )
   */
  allPaged(skip, top, callback) {
    logger.debug(`${this._classInfo}.allPaged(${skip}, ${top})`);

    UserModel
      .find({},
        null,
        {
          skip: skip,
          select: {
            password: 0,
            salt: 0,
            refreshToken: 0,
            loginAttempts: 0,
            lockUntil: 0
          },
          top: top,
          sort: { lastName: 1 }
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
 * Authenticate user
 * @param {string} username username to authenticate
 * @param {string} password password to validate
 * @param {string} socialUser user authenticated through a social provider (facebook, twitter)
 * @param {requestCallback} callback Handles the response
 * @example authenticate('myusername', 'password', (error, data)=>{})
 */
  authenticate(username, password, socialUser, callback) {
    logger.debug(`${this._classInfo}.authenticate(${username}, ${password})`);

    if (socialUser) {
      logger.debug(`${this._classInfo}.authenticate(${socialUser})`);
      UserModel.getSociallyAuthenticated(socialUser, (err, user) => {
        if (err) {
          logger.error(
            `${this._classInfo}.getSociallyAuthenticated(${socialUser})`,
            err
          );
          return callback(err, null);
        }

        if (user) {
          callback(null, user);
          return;
        }
      });
      return;
    }

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

      callback(null, null, reason);
      // otherwise we can determine why we failed
      // var reasons = user.failedLogin;
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

    });
  }

  /**
   * Gets users by email
   * @param {string} email User email
   * @param {requestCallback} callback Handles the response
   * @example byEmail('me@here.com', (error, data) => {})
   */
  byEmail(email, callback) {
    logger.debug(`${this._classInfo}.byEmail(${email})`);

    UserModel.findOne(
      { email: email },
      null,
      {
        select: {
          password: 0,
          salt: 0,
          refreshToken: 0,
          loginAttempts: 0,
          lockUntil: 0
        }
      })
      .then((data) => {
        callback(null, data);
      })
      .catch(error => {
        logger.error(`${this._classInfo}.byEmail::findOne`, error);
        return callback(error);
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

    UserModel.findOne(
      { 'refreshToken.value': token },
      null,
      {
        select: {
          password: 0,
          salt: 0,
          refreshToken: 0,
          loginAttempts: 0,
          lockUntil: 0
        }
      })
      .then((data) => {
        callback(null, data);
      })
      .catch(error => {
        logger.error(`${this._classInfo}.byRefreshToken::findOne`, error);
        return callback(error);
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
      null,
      {
        select: {
          password: 0,
          salt: 0,
          refreshToken: 0,
          loginAttempts: 0,
          lockUntil: 0
        }
      })
      .then((data) => {
        callback(null, data);
      })
      .catch(error => {
        logger.error(`${this._classInfo}.byRole::find`, error);
        callback(error);
      });
  }

  /**
   * Gets a single User by their username
   * @param {string} username username of user
   * @param {requestCallback} callback Handles the response
   * @example byUsername('username', (error, data) => {})
   */
  byUsername(username, callback) {
    logger.debug(`${this._classInfo}.byUsername(${username})`);

    UserModel.findOne(
      { username: username },
      null,
      {
        select: {
          password: 0,
          salt: 0,
          refreshToken: 0,
          loginAttempts: 0,
          lockUntil: 0
        }
      })
      .then((data) => {
        callback(null, data);
      })
      .catch(error => {
        logger.error(`${this._classInfo}.byUsername::find`, error);
        callback(error);
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

    UserModel.deleteOne({ _id: id })
      .then((data) => {
        callback(null, data);
      })
      .catch(error => {
        logger.error(`${this._classInfo}.delete(${id})::remove`, error);
        return callback(error);
      });
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
      null,
      {
        select: {
          password: 0,
          salt: 0,
          refreshToken: 0,
          loginAttempts: 0,
          lockUntil: 0
        }
      })
      .then(data => {
        callback(null, data);
      })
      .catch(error => {
        logger.error(`${this._classInfo}.get(${id})`, error);
        return callback(error);
      })
  }

  /**
   * Inserts a User
   * @param {object} body User data
   * @param {requestCallback} callback Handles the response
   * @example insert({property: value}, (error, data) => {})
   */
  insert(body, callback) {
    logger.debug(`${this._classInfo}.insert()`, body);

    //Created
    body.status = !!body.password ? 'active' : 'awaitingPassword';
    body.email_lower = body.email.toLowerCase();
    body.username_lower = body.username.toLowerCase();

    UserModel.create(body)
      .then(data => {
        callback(null, data);
      })
      .catch(error => {
        logger.error(`${this._classInfo}.insert()::save`, error);
        callback(error);
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

    UserModel.findOne(
      { username: username })
      .then((data) => {
        data.comparePassword(password, (error, isMatch) => {
          if (error) {
            logger.error(`${this._classInfo}.passwordMatch(${username}, ${password})::comparePassword`,
              error
            );
            return callback(error);
          }

          logger.debug(
            `${this._classInfo}.passwordMatch(${username}, ${password})::isMatch`,
            isMatch
          );

          if (isMatch) {
            callback(null, data);
          } else {
            callback(null, null);
          }
        });
      })
      .catch(error => {
        logger.error(`${this._classInfo}.passwordMatch::findOne`, error);
        callback(error);
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

    UserModel
      .find({},
        null,
        {
          skip: skip,
          select: {
            password: 0,
            salt: 0,
            refreshToken: 0,
            loginAttempts: 0,
            lockUntil: 0
          },
          top: top,
          sort: { name: 1 }
        }
      )
      .then((data) => {
        callback(null, data);
      })
      .catch(error => {
        logger.error(`${this._classInfo}.summary(${skip}, ${top})::find`, error);
        return callback(error, null);
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
      { new: true })
      .then(data => {
        //returns User data
        callback(null, data);
      })
      .catch(error => {
        logger.error(`${this._classInfo}.update(${id})::findOneAndUpdate`, error);
        return callback(error);
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
      {
        refreshToken: token,
        dateModified: new Date()
      },
      { new: true })
      .then(result => {
        callback(null, result);
      })
      .catch(error => {
        logger.error(
          `${this._classInfo}.updateToken(${id}, ${token})::findByIdAndUpdate`,
          error
        );
        return callback(error);
      })
  }
}

module.exports = new UserRepository();

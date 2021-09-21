/* eslint-disable consistent-return */
/**
 * Users Api
 */

const passport = require('passport');
const async = require('async');
const bcrypt = require('bcrypt');
const repo = require('../../../app/database/repositories/account/user.repository');
const tokenRepo = require('../../../app/database/repositories/auth/token.repository');
const utils = require('../../../lib/utils');
const logger = require('../../../lib/winston.logger');

const SALT_WORK_FACTOR = 10;

/**
 * User Api Controller
 * http://.../api/user
 * @author Antonio Marasco
 */
class UserController {
  /**
   * Constructor for User
   * @param {router} router Node router framework
   * @example let controller = new UserController(router);
   */
  constructor(router) {
    router.get(
      '/details',
      passport.authenticate('user-bearer', { session: false }),
      utils.isInRole('superadmin'),
      this.allDetails.bind(this)
    );

    router.get(
      '/',
      passport.authenticate('user-bearer', { session: false }),
      utils.isInRole('superadmin'),
      this.all.bind(this)
    );

    router.get('/roles/:roleId', this.byRole.bind(this));

    router.get(
      '/page/:skip/:top',
      passport.authenticate('user-bearer', { session: false }),
      utils.isInRole('superadmin'),
      this.allPaged.bind(this)
    );

    // Details
    router.get(
      '/:id/details',
      passport.authenticate('user-bearer', { session: false }),
      utils.isInRole(['superadmin']),
      this.details.bind(this)
    );

    router.post(
      '/',
      passport.authenticate('user-bearer', { session: false }),
      utils.isInRole('superadmin'),
      this.insert.bind(this)
    );

    router.put(
      '/:id',
      passport.authenticate('user-bearer', { session: false }),
      utils.isInRole('superadmin'),
      this.update.bind(this)
    );

    router.put(
      '/:id/profile',
      passport.authenticate('user-bearer', { session: false }),
      // utils.isInRole('superadmin'),
      this.updateProfile.bind(this)
    );

    router.post(
      '/:id/devices',
      passport.authenticate('user-bearer', { session: false }),
      // utils.isInRole('superadmin'),
      this.addDevice.bind(this)
    );

    router.post(
      '/:id/notifications',
      passport.authenticate('user-bearer', { session: false }),
      // utils.isInRole('superadmin'),
      this.addNotification.bind(this)
    );

    router.get(
      '/:id/tokens',
      passport.authenticate('user-bearer', { session: false }),
      utils.isInRole('superadmin'),
      this.tokens.bind(this)
    );

    router.delete(
      '/:id/tokens',
      passport.authenticate('user-bearer', { session: false }),
      utils.isInRole('superadmin'),
      this.deleteTokens.bind(this)
    );

    router.delete(
      '/:id',
      passport.authenticate('user-bearer', { session: false }),
      utils.isInRole('superadmin'),
      utils.isInRole('admin'),
      this.delete.bind(this)
    );

    // Basic
    router.get(
      '/:id',
      passport.authenticate('user-bearer', { session: false }),
      utils.isInRole('superadmin'),
      this.get.bind(this)
    );

    // Logging Info
    this._classInfo = '*** [User].controller';
    this._routeName = '/api/user';
  }

  /**
   * Adds a device to user
   * @param {Request} request - Request object
   * @param {Response} response - Response object
   * @example POST /api/user/:id/devices
   */
  addDevice(request, response) {
    logger.info(`${this._classInfo}.addDevice() [${this._routeName}]`);

    repo.addDevice(request.params.id, request.body, (error, result) => {
      if (error) {
        logger.error(
          `${this._classInfo}.addDevice() [${this._routeName}]`,
          error
        );
        response.status(500).send(error);
      } else {
        logger.debug(`${this._classInfo}.addDevice() [${this._routeName}] OK`);
        response.json(result);
      }
    });
  }

  /**
   * Adds a notification to user
   * @param {Request} request - Request object
   * @param {Response} response - Response object
   * @example POST /api/user/:id/notifications
   */
  addNotification(request, response) {
    logger.info(`${this._classInfo}.addNotification() [${this._routeName}]`);

    repo.addNotification(
      request.params.userId,
      request.body,
      (error, result) => {
        if (error) {
          logger.error(
            `${this._classInfo}.addNotification() [${this._routeName}]`,
            error
          );
          response.status(500).send(error);
        } else {
          logger.debug(
            `${this._classInfo}.addNotification() [${this._routeName}] OK`
          );
          response.json(result);
        }
      }
    );
  }

  /**
   * Gets all users
   * @param {Request} [request] Request object
   * @param {Response} response Response
   * @example GET /api/user
   * @returns {pointer} res.json
   */
  all(request, response) {
    logger.info(`${this._classInfo}.all() [${this._routeName}]`);

    repo.all((error, result) => {
      if (error) {
        logger.error(`${this._classInfo}.all() [${this._routeName}]`, error);
        response.status(500).send(error);
        // next(error);
      } else {
        logger.debug(`${this._classInfo}.all() [${this._routeName}] OK`);
        response.json(result);
      }
    });
  }

  /**
   * Gets all users and details
   * @param {Request} [request] Request object
   * @param {Response} response Response
   * @example GET /api/user
   * @returns {pointer} res.json
   */
  allDetails(request, response) {
    logger.info(`${this._classInfo}.allDetails() [${this._routeName}]`);

    repo.allDetails((error, result) => {
      if (error) {
        logger.error(
          `${this._classInfo}.allDetails() [${this._routeName}]`,
          error
        );
        response.status(500).send(error);
        // next(error);
      } else {
        logger.debug(`${this._classInfo}.allDetails() [${this._routeName}] OK`);
        response.json(result);
      }
    });
  }

  /**
   * Gets all users paginated
   * @param {Request} request Request object {Default:10}
   * @param {Request} [request.params.top=10]
   * @param {Response} response Response
   * @example /api/user/page/2/10
   * @description /api/user/page/{page number}/{# per page}
   */
  allPaged(request, response) {
    logger.info(`${this._classInfo}.allPaged() [${this._routeName}]`);

    const topVal = request.params.top;
    const skipVal = request.params.skip;
    const top = Number.isNan(topVal) ? 10 : +topVal;
    const skip = Number.isNan(skipVal) ? 0 : +skipVal;

    repo.allPaged(skip, top, (error, result) => {
      // response.setHeader('X-InlineCount', result.count);
      if (error) {
        logger.error(
          `${this._classInfo}.allPaged() [${this._routeName}]`,
          error
        );
        response.status(500).send(error);
      } else {
        logger.debug(`${this._classInfo}.allPaged() [${this._routeName}] OK`);
        response.json(result);
      }
    });
  }

  /**
   * Gets all users by role
   * @param {any} request Request object
   * @param {Response} response Response
   * @example GET /api/user/roles/:roleId
   * @returns pointer to .json via 'res' param
   */
  byRole(request, response) {
    const id = request.params.roleId;
    logger.info(`${this._classInfo}.byRole(${id}) [${this._routeName}]`);

    repo.byRole(id, (error, result) => {
      if (error) {
        logger.error(`${this._classInfo}.byRole() [${this._routeName}]`, error);
        response.status(500).send(error);
      } else {
        logger.debug(`${this._classInfo}.byRole() [${this._routeName}] OK`);
        response.json(result);
      }
    });
  }

  /**
   * Deletes a user
   * @param {Request} request Request object
   * @param {Response} response Response object
   * @example DELETE /api/user/:id
   * @returns {status: true|false} via res pointer
   */
  delete(request, response) {
    const { id } = request.params;
    logger.info(`${this._classInfo}.delete(${id}) [${this._routeName}]`);

    repo.delete(id, (error, result) => {
      if (error) {
        logger.error(`${this._classInfo}.delete() [${this._routeName}]`, error);
        response.status(500).send(error);
      } else {
        logger.debug(`${this._classInfo}.delete() [${this._routeName}] OK`);
        response.json(result);
      }
    });
  }

  /**
   * Deletes a user's tokens
   * @param {Request} request Request object
   * @param {Response} response Response object
   * @example DELETE /api/user/:id/tokens
   * @returns {status: true|false} via res pointer
   */
  deleteTokens(request, response) {
    const { id } = request.params;
    logger.info(`${this._classInfo}.deleteTokens(${id}) [${this._routeName}]`);

    tokenRepo.deleteByUserId(id, (error, result) => {
      if (error) {
        logger.error(
          `${this._classInfo}.deleteTokens() [${this._routeName}]`,
          error
        );
        response.status(500).send(error);
      } else {
        logger.debug(
          `${this._classInfo}.deleteTokens() [${this._routeName}] OK`
        );
        response.json(result);
      }
    });
  }

  /**
   * Gets a user by its id with Details
   * @param {Request} request Request object
   * @param {Response} response Response
   * @example GET /api/user/:id/tokens
   */
  details(request, response) {
    const { id } = request.params;
    logger.info(`${this._classInfo}.details(${id}) [${this._routeName}]`);

    repo.details(id, (error, result) => {
      if (error) {
        logger.error(
          `${this._classInfo}.details() [${this._routeName}]`,
          error
        );
        response.status(500).send(error);
      } else {
        logger.debug(`${this._classInfo}.details() [${this._routeName}] OK`);
        response.json(result);
      }
    });
  }

  /**
   * Gets a user by its id
   * @param {Request} request Request object
   * @param {Response} response Response
   * @example GET /api/user/:id
   */
  get(request, response) {
    const { id } = request.params;
    logger.info(`${this._classInfo}.get(${id}) [${this._routeName}]`);

    repo.get(id, (error, result) => {
      if (error) {
        logger.error(`${this._classInfo}.get() [${this._routeName}]`, error);
        response.status(500).send(error);
      } else {
        logger.debug(`${this._classInfo}.get() [${this._routeName}] OK`);
        response.json(result);
      }
    });
  }

  /**
   * Inserts a user
   * @param {Request} request Request object
   * @param {Response} response Response
   * @example POST /api/user
   */
  insert(request, response) {
    logger.info(`${this._classInfo}.insert() [${this._routeName}]`);

    repo.insert(request.body, (error, result) => {
      if (error) {
        logger.error(`${this._classInfo}.insert() [${this._routeName}]`, error);
        response.status(500).send(error);
      } else {
        logger.debug(`${this._classInfo}.insert() [${this._routeName}] OK`);
        response.json(result);
      }
    });
  }

  /**
   * Gets a user's tokens
   * @param {Request} request Request object
   * @param {Response} response Response
   * @example GET /api/user/:id
   */
  tokens(request, response) {
    const { id } = request.params;
    logger.info(`${this._classInfo}.tokens(${id}) [${this._routeName}]`);

    tokenRepo.byUserId(id, (error, result) => {
      if (error) {
        logger.error(`${this._classInfo}.tokens() [${this._routeName}]`, error);
        response.status(500).send(error);
      } else {
        logger.debug(`${this._classInfo}.tokens() [${this._routeName}] OK`);
        response.json(result);
      }
    });
  }

  /**
   * Updates a user
   * @param {Request} request Request object
   * @param {Response} response Response object
   * @example PUT /api/user/:id
   */
  update(request, response) {
    const { id } = request.params;
    logger.info(`${this._classInfo}.update(${id}) [${this._routeName}]`);

    repo.update(id, request.body, (error, result) => {
      if (error) {
        logger.error(
          `${this._classInfo}.update() [${this._routeName}]`,
          error,
          request.body
        );
        response.status(500).send(error);
      } else {
        logger.debug(`${this._classInfo}.update() [${this._routeName}] OK`);
        response.json(result);
      }
    });
  }

  /**
   * Updates a user
   * @param {Request} request Request object
   * @param {Response} response Response object
   * @example PUT /api/user/:id
   */
  updateProfile(request, response, next) {
    const { id } = request.params;
    logger.info(`${this._classInfo}.updateProfile(${id}) [${this._routeName}]`);

    async.waterfall(
      [
        (done) => {
          const entity = {
            firstName: request.body.firstName,
            lastName: request.body.lastName,
            status: 'active'
          };

          if (request.body.password) {
            entity.password = request.body.password;
            bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
              logger.info(
                `${this._classInfo}.updateProfile(${id})::salt [${salt}]`
              );
              entity.salt = salt;

              // eslint-disable-next-line no-shadow
              bcrypt.hash(entity.password, salt, (err, hash) => {
                logger.info(
                  `${this._classInfo}.updateProfile(${id})::hash [${hash}]`
                );
                entity.password = hash;
                return done(null, entity);
              });
            });
          } else {
            done(null, entity);
          }
        },
        (profile, done) => {
          repo.updateProfile(id, profile, (error, result) => {
            if (error) {
              logger.error(
                `${this._classInfo}.updateProfile() [${this._routeName}]`,
                error,
                request.body
              );
              response.status(500).send(error);
            } else {
              logger.debug(
                `${this._classInfo}.updateProfile() [${this._routeName}] OK`
              );
              return done(null, result);
            }
          });
        }
      ],
      (error, result) => {
        if (error) {
          logger.error(
            `${this._classInfo}.updateProfile() [${this._routeName}]`,
            error
          );
          return next(error);
        }
        logger.debug(
          `${this._classInfo}.updateProfile() [${this._routeName}] OK`
        );
        response.json(result);
      }
    );
  }
}

module.exports = UserController;

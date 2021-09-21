/* eslint-disable consistent-return */
/**
 * Wishlist Follow Api
 */

const passport = require('passport');
const async = require('async');
const repo = require('../../../app/database/repositories/wishlist/wishlist-follow.repository');
const userRepo = require('../../../app/database/repositories/account/user.repository');
const utils = require('../../../lib/utils');
const logger = require('../../../lib/winston.logger');

/**
 * Wishlist Follow for items Api Controller
 * http://.../api/wishlist/:id/follow
 * @author Antonio Marasco
 */
class WishlistFollowController {
  /**
   * Constructor for Wishlist Follows
   * @param {router} router Node router framework
   * @example let controller = new WishlistFollowController(router);
   */
  constructor(router) {
    router.get(
      '/:id/follow',
      // passport.authenticate('user-bearer', { session: false }),
      // utils.isInRole('admin'),
      this.all.bind(this)
    );

    router.get(
      '/:id/follow/page/:skip/:top',
      passport.authenticate('user-bearer', { session: false }),
      utils.isInRole('admin'),
      this.allPaged.bind(this)
    );

    router.get(
      ':id/follow/:followId',
      passport.authenticate('user-bearer', { session: false }),
      utils.isInRole(['admin', 'user']),
      this.get.bind(this)
    );

    router.post(
      '/:id/follow',
      passport.authenticate('user-bearer', { session: false }),
      // utils.isInRole('admin'),
      this.insert.bind(this)
    );

    router.put(
      '/:id/follow/:followId',
      passport.authenticate('user-bearer', { session: false }),
      // utils.isInRole(['admin', 'user']),
      this.update.bind(this)
    );

    router.delete(
      '/:id/follow/:followId',
      passport.authenticate('user-bearer', { session: false }),
      utils.isInRole('admin'),
      this.delete.bind(this)
    );

    router.delete(
      '/:id/follow/:followId/unfollow',
      passport.authenticate('user-bearer', { session: false }),
      this.unfollow.bind(this)
    );

    // Logging Info
    this._classInfo = '*** [wishlist-follow].controller';
    this._routeName = '/api/wishlist/follow';
  }

  /**
   * Gets all Wishlist item follows
   * @param {Request} [request] Request object
   * @param {Response} response Response
   * @example GET /api/wishlist/follow
   * @returns {pointer} res.json
   */
  all(request, response) {
    logger.info(`${this._classInfo}.all() [${this._routeName}]`);

    repo.all((error, result) => {
      if (error) {
        logger.error(`${this._classInfo}.all() [${this._routeName}]`, error);
        response.status(500).json(error);
        // next(error);
      } else {
        logger.debug(`${this._classInfo}.all() [${this._routeName}] OK`);
        response.json(result);
      }
    });
  }

  /**
   * Gets all wishlist follows paginated
   * @param {Request} request Request object {Default:10}
   * @param {Request} [request.params.top=10]
   * @param {Response} response Response
   * @example /api/wishlist/follow/page/2/10
   * @description /api/wishlist/follow/page/{page number}/{# per page}
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
        response.status(500).json(error);
      } else {
        logger.debug(`${this._classInfo}.allPaged() [${this._routeName}] OK`);
        response.json(result);
      }
    });
  }

  /**
   * Deletes a wishlist
   * @param {Request} request Request object
   * @param {Response} response Response object
   * @example DELETE /api/wishlist/follow/:id
   * @returns {status: true|false} via res pointer
   */
  delete(request, response) {
    const { id } = request.params;
    logger.info(`${this._classInfo}.delete(${id}) [${this._routeName}]`);

    repo.delete(id, (error, result) => {
      if (error) {
        logger.error(`${this._classInfo}.delete() [${this._routeName}]`, error);
        response.json(result);
      } else {
        logger.debug(`${this._classInfo}.delete() [${this._routeName}] OK`);
        response.json(result);
      }
    });
  }

  /**
   * Gets a Wishlist by its id
   * @param {Request} request Request object
   * @param {Response} response Response
   * @example GET /api/wishlist/follow/:id
   */
  get(request, response) {
    const { id } = request.params;
    logger.info(`${this._classInfo}.get(${id}) [${this._routeName}]`);

    repo.get(id, (error, result) => {
      if (error) {
        logger.error(`${this._classInfo}.get() [${this._routeName}]`, error);
        response.status(500).json(error);
      } else {
        logger.debug(`${this._classInfo}.get() [${this._routeName}] OK`);
        response.json(result);
      }
    });
  }

  /**
   * Inserts a wishlist
   * @param {Request} request Request object
   * @param {Response} response Response
   * @example POST /api/wishlist/follow
   */
  insert(request, response, next) {
    logger.info(`${this._classInfo}.insert() [${this._routeName}]`);
    const { wishlistId } = request.body;
    const { userId } = request.body;
    const inputDevice = request.body.device;
    const inputNotification = {
      userId,
      // uuid: inputDevice.uuid,
      endpoint: request.body.endpoint || '',
      expirationTime: request.body.expirationTime || '',
      keys: request.body.keys || '',
      schemaType: request.body.schemaType || 'unknown',
      token: request.body.pushToken || ''
    };

    // Let's make sure notification doesn't already exist
    async.waterfall(
      [
        (done) => {
          repo.byWishlistIdUserId(wishlistId, userId, (error, data) => {
            let itemCount = 0;
            if (error) {
              logger.error(
                `${this._classInfo}.insert() [${this._routeName}]`,
                error
              );
              response.status(500).send(error);
            } else {
              if (data) {
                itemCount = data.length;
              }

              done(null, itemCount);
            }
          });
        },
        (itemCount, done) => {
          if (itemCount === 0) {
            repo.insert(request.body, (error, result) => {
              if (error) {
                logger.error(
                  `${this._classInfo}.insert() [${this._routeName}]`,
                  error
                );
                response.status(500).json(error);
              } else {
                logger.debug(
                  `${this._classInfo}.insert() [${this._routeName}] OK`
                );
                return done(null, result);
              }
            });
          } else {
            return done(null, request.body);
          }
        },
        (wishlistFollow, done) => {
          userRepo.get(userId, (error, result) => {
            if (error) {
              logger.error(
                `${this._classInfo}.insert()::Add Notification [${this._routeName}]`,
                error
              );
              response.status(500).json(error);
            } else {
              logger.debug(
                `${this._classInfo}.insert()::Get User [${this._routeName}] OK`
              );
              return done(null, wishlistFollow, result);
            }
          });
        },
        (wishlistFollow, user, done) => {
          // Check if device was sent with call
          if (!inputDevice) {
            return done(null, wishlistFollow, user);
          }

          // Determine if device is already recorded
          const device = user.devices.filter((result) => result.uuid === inputDevice.uuid);

          if (!!device && device.length === 0) {
            // eslint-disable-next-line no-unused-vars
            userRepo.addDevice(userId, inputDevice, (error, result) => {
              if (error) {
                logger.error(
                  `${this._classInfo}.insert()::Add Device [${this._routeName}]`,
                  error
                );
                response.status(500).json(error);
              } else {
                logger.debug(
                  `${this._classInfo}.insert()::Get User [${this._routeName}] OK`
                );
                return done(null, wishlistFollow, user);
              }
            });
          } else {
            return done(null, wishlistFollow, user);
          }
        },
        (wishlistFollow, user, done) => {
          // Check for endpoint, If not available then no notification exists
          if (!inputNotification.endpoint) {
            return done(null, wishlistFollow);
          }
          const notification =
            user.notifications.filter((notify) => notify.uuid === inputNotification.uuid);

          if (!!notification && notification.length === 0) {
            userRepo.addNotification(
              userId,
              inputNotification,
              // eslint-disable-next-line no-unused-vars
              (error, result) => {
                if (error) {
                  logger.error(
                    `${this._classInfo}.insert()::Add Notification [${this._routeName}]`,
                    error
                  );
                  response.status(500).json(error);
                } else {
                  logger.debug(
                    `${this._classInfo}.insert()::Get User [${this._routeName}] OK`
                  );
                  return done(null, wishlistFollow);
                }
              }
            );
          } else {
            return done(null, wishlistFollow);
          }
        }
      ],
      (error, result) => {
        if (error) {
          logger.error(
            `${this._classInfo}.insert() [${this._routeName}]`,
            error
          );
          return next(error);
        }
        logger.debug(`${this._classInfo}.insert() [${this._routeName}] OK`);
        response.json(result);
      }
    );
  }

  /**
   * Unfollows a wishlist
   * @param {Request} request Request object
   * @param {Response} response Response object
   * @example DELETE /api/wishlist/follow/:id/unfollow
   * @returns {status: true|false} via res pointer
   */
  unfollow(request, response) {
    request.body.statusId = 'deleted';
    const { id } = request.params;
    const { followId } = request.params;

    logger.info(`${this._classInfo}.unfollow(${id}) [${this._routeName}]`);

    repo.unfollow(followId, request.body, (error, result) => {
      if (error) {
        logger.error(
          `${this._classInfo}.unfollow() [${this._routeName}]`,
          error
        );
        response.json(result);
      } else {
        logger.debug(`${this._classInfo}.unfollow() [${this._routeName}] OK`);
        response.json(result);
      }
    });
  }

  /**
   * Updates a wishlist
   * @param {Request} request Request object
   * @param {Response} response Response object
   * @example PUT /api/wishlist/follow/:id
   */
  update(request, response) {
    const wishlistId = request.params.id;
    const { followId } = request.params;

    logger.info(
      `${this._classInfo}.update(${wishlistId}) [${this._routeName}]`
    );

    repo.update(followId, request.body, (error, result) => {
      if (error) {
        logger.error(
          `${this._classInfo}.update() [${this._routeName}]`,
          error,
          request.body
        );
        response.status(500).json(error);
      } else {
        logger.debug(`${this._classInfo}.update() [${this._routeName}] OK`);
        response.json(result);
      }
    });
  }
}

module.exports = WishlistFollowController;

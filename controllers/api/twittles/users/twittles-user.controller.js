/**
 * Twittles Users Api
 */

const passport = require('passport');
const repo = require('../../../../app/database/repositories/twittles/twittles-user.repository');
const utils = require('../../../../lib/utils');
const logger = require('../../../../lib/winston.logger');

/**
 * Twittles users Api Controller
 * http://.../api/twittles/users
 * @author Antonio Marasco
 */
class TwittlesUsersController {
  /**
   * Constructor for Wishlist Application Settings
   * @param {router} router Node router framework
   * @example let controller = new WishlistAppSettingsController(router);
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
      utils.isInRole('admin'),
      this.all.bind(this)
    );

    router.get(
      '/page/:skip/:top',
      passport.authenticate('user-bearer', { session: false }),
      utils.isInRole('admin'),
      this.allPaged.bind(this)
    );

    // Details
    router.get(
      '/:id/details',
      passport.authenticate('user-bearer', { session: false }),
      utils.isInRole(['superadmin']),
      this.details.bind(this)
    );

    router.get(
      '/:id',
      passport.authenticate('user-bearer', { session: false }),
      utils.isInRole(['admin', 'user']),
      this.get.bind(this)
    );

    router.put(
      '/:id',
      passport.authenticate('user-bearer', { session: false }),
      utils.isInRole(['admin', 'user']),
      this.update.bind(this)
    );

    // Logging Info
    this._classInfo = '*** [wishlist-user].controller';
    this._routeName = '/api/wishlist/user';
  }

  /**
   * Gets all Wishlist item categories
   * @param {Request} [request] Request object
   * @param {Response} response Response
   * @example GET /api/wishlist/users
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
   * Gets all Wishlist paginated
   * @param {Request} request Request object {Default:10}
   * @param {Request} [request.params.top=10]
   * @param {Response} response Response
   * @example /api/wishlist/page/2/10
   * @description /api/wishlist/users/page/{page number}/{# per page}
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
   * Gets a Wishlist by its id
   * @param {Request} request Request object
   * @param {Response} response Response
   * @example GET /api/wishlist/users/:id
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
   * Updates a wishlist
   * @param {Request} request Request object
   * @param {Response} response Response object
   * @example PUT /api/wishlist/users/:id
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
        response.status(500).json(error);
      } else {
        logger.debug(`${this._classInfo}.update() [${this._routeName}] OK`);
        response.json(result);
      }
    });
  }
}

module.exports = TwittlesUsersController;

// Application Api
const passport = require('passport');
const repo = require('../../../app/database/repositories/application/application.repository');
const utils = require('../../../lib/utils');
const logger = require('../../../lib/winston.logger');

/**
 * Application Api Controller
 * http://.../api/application
 * @author Antonio Marasco
 */
class AccountController {
  /**
   * Constructor for applications
   * @param {router} router Node router framework
   */
  constructor(router) {
    router.get(
      '/',
      passport.authenticate('user-bearer', { session: false }),
      utils.isInRole('superadmin'),
      this.all.bind(this)
    );

    router.get(
      '/details',
      passport.authenticate('user-bearer', { session: false }),
      utils.isInRole('admin'),
      this.allDetails.bind(this)
    );

    router.get(
      '/page/:skip/:top',
      passport.authenticate('user-bearer', { session: false }),
      utils.isInRole('superadmin'),
      this.allPaged.bind(this)
    );
    router.get(
      '/:id',
      passport.authenticate('user-bearer', { session: false }),
      utils.isInRole('superadmin'),
      this.get.bind(this)
    );

    router.get(
      '/:id/details',
      passport.authenticate('user-bearer', { session: false }),
      utils.isInRole(['admin', 'user']),
      this.getDetails.bind(this)
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
    router.delete(
      '/:id',
      passport.authenticate('user-bearer', { session: false }),
      utils.isInRole('superadmin'),
      this.delete.bind(this)
    );

    // Logging Info
    this._classInfo = '*** [Application].controller';
    this._routeName = '/api/application';
  }

  /**
   * Gets all applications
   * @param {Request} [request] Request object
   * @param {Response} response Response
   * @example GET /api/application
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
   * Gets all Applications
   * @param {Request} [request] Request object
   * @param {Response} response Response
   * @example GET /api/application
   * @returns {pointer} res.json
   */
  allDetails(request, response) {
    logger.info(`${this._classInfo}.all() [${this._routeName}]`);

    repo.allDetails((error, result) => {
      if (error) {
        logger.error(`${this._classInfo}.all() [${this._routeName}]`, error);
        response.status(500).json(error);
      } else {
        logger.debug(`${this._classInfo}.all() [${this._routeName}] OK`);
        response.json(result);
      }
    });
  }

  /**
   * Gets all applications paginated
   * @param {Request} request Request object {Default:10}
   * @param {Request} [request.params.top=10]
   * @param {Response} response Response
   * @example /api/application/page/2/10
   * @description /api/application/page/{page number}/{# per page}
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
   * Deletes a application
   * @param {Request} request Request object
   * @param {Response} response Response object
   * @example DELETE /api/application/:id
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
   * Gets a application by its id
   * @param {Request} request Request object
   * @param {Response} response Response
   * @example GET /api/application/:id
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
   * Gets a single application details
   * @param {string} id application id
   * @param {requestCallback} callback Handles the response
   * @example getDetails('123456789', (error, data) => {})
   */
  getDetails(request, response) {
    const { id } = request.params;
    logger.info(`${this._classInfo}.getDetails(${id}) [${this._routeName}]`);

    repo.getDetails(id, (error, result) => {
      if (error) {
        logger.error(
          `${this._classInfo}.getDetails() [${this._routeName}]`,
          error
        );
        response.status(500).json(error);
      } else {
        logger.debug(`${this._classInfo}.getDetails() [${this._routeName}] OK`);
        response.json(result);
      }
    });
  }

  /**
   * Inserts a application
   * @param {Request} request Request object
   * @param {Response} response Response
   * @example POST /api/application
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
   * Updates a application
   * @param {Request} request Request object
   * @param {Response} response Response object
   * @examle PUT /api/user/:id
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
}

module.exports = AccountController;

'use strict';
/**
 * Users Api
 */

const repo = require('../../../app/database/repositories/account/user.repository');
const passport = require('passport');
const utils = require('../../../lib/utils');
const logger = require('../../../lib/winston.logger');
//const UserModel = require('../../../app/database/models/account/user.model');

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
      '/',
      passport.authenticate('user-bearer', { session: false }),
      utils.isInRole('admin'),
      this.all.bind(this)
    );

    router.get('/roles/:roleId', this.byRole.bind(this));

    router.get(
      '/page/:skip/:top',
      passport.authenticate('user-bearer', { session: false }),
      utils.isInRole('admin'),
      this.allPaged.bind(this)
    );

    router.get(
      '/:id',
      passport.authenticate('user-bearer', { session: false }),
      utils.isInRole(['admin', 'user']),
      this.get.bind(this)
    );

    router.post(
      '/',
      passport.authenticate('user-bearer', { session: false }),
      utils.isInRole('admin'),
      this.insert.bind(this)
    );

    router.put(
      '/:id',
      passport.authenticate('user-bearer', { session: false }),
      utils.isInRole(['admin', 'user']),
      this.update.bind(this)
    );

    router.post(
      '/:id/devices',
      passport.authenticate('user-bearer', { session: false }),
      this.addDevice.bind(this)
    );

    router.delete(
      '/:id',
      passport.authenticate('user-bearer', { session: false }),
      utils.isInRole('admin'),
      this.delete.bind(this)
    );

    //Logging Info
    this._classInfo = '*** [User].controller';
    this._routeName = '/api/user';

  }

  /**
   * Adds a device to user
   * @param {Request} request - Request object
   * @param {Response} response - Response object
   * @example POST /api/user/{user id}/devices
   */
  addDevice(request, response) {
    logger.info(`${this._classInfo}.addDevice() [${this._routeName}]`);

    repo.addDevice(request.params.id, request.body, (error, result) => {
      if (error) {
        logger.error(`${this._classInfo}.addDevice() [${this._routeName}]`, error);
        response.json({
          status: false,
          msg: 'Update Failed',
          error: {
            code: error.code,
            errmsg: error.errmsg,
            index: error.index
          },
          data: null
        });
      } else {
        logger.debug(`${this._classInfo}.addDevice() [${this._routeName}] OK`, result);
        response.json({ status: true, msg: null, error: null, data: result });
      }
    });
  }

  /**
   * Gets all users
   * @param {Request} [request] Request object
   * @param {Response} response Response
   * @example GET /api/user
   * @returns {pointer} res.json
   */
  all(request, response, next) {
    logger.info(`${this._classInfo}.all() [${this._routeName}]`);

    repo.all((error, result) => {
      if (error) {
        logger.error(`${this._classInfo}.all() [${this._routeName}]`, error);
        response.status(500).json({ message: 'Internal server error' });
        //next(error);
      } else {
        logger.debug(`${this._classInfo}.all() [${this._routeName}] OK`, result);
        response.json(result);
      }
    });

    // UserModel.find()
    //   .then(data => {
    //     response.json(data);
    //   })
    //   .catch(error => {
    //     console.log('yay')
    //     //response.status(500).json({ message: 'Internal server error' });
    //     next(error)
    //     console.error(error);
    //   });
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

    const topVal = request.params.top,
      skipVal = request.params.skip,
      top = isNaN(topVal) ? 10 : +topVal,
      skip = isNaN(skipVal) ? 0 : +skipVal;

    repo.allPaged(skip, top, (error, result) => {
      //response.setHeader('X-InlineCount', result.count);
      if (error) {
        logger.error(`${this._classInfo}.allPaged() [${this._routeName}]`, error);
        response.json(null);
      } else {
        logger.debug(`${this._classInfo}.allPaged() [${this._routeName}] OK`, result);
        response.json(result);
      }
    });
  }

  /**
   * Gets all users by role
   * @param {any} request Request object
   * @param {Response} response Response
   * @example GET /api/user/roles/Guest
   * @returns pointer to .json via 'res' param
   */
  byRole(request, response) {
    const id = request.params.roleId;
    logger.info(`${this._classInfo}.byRole(${id}) [${this._routeName}]`);

    repo.byRole(id, (error, result) => {
      if (error) {
        logger.error(`${this._classInfo}.byRole() [${this._routeName}]`, error);
        response.json(null);
      } else {
        logger.debug(`${this._classInfo}.byRole() [${this._routeName}] OK`, result);
        response.json(result);
      }
    });
  }

  /**
   * Deletes a user
   * @param {Request} request Request object
   * @param {Response} response Response object
   * @example DELETE /api/user/123456789
   * @returns {status: true|false} via res pointer
   */
  delete(request, response) {
    const id = request.params.id;
    logger.info(`${this._classInfo}.delete(${id}) [${this._routeName}]`);

    repo.delete(id, (error, result) => {
      if (error) {
        logger.error(`${this._classInfo}.delete() [${this._routeName}]`, error);
        response.json({ status: false });
      } else {
        logger.debug(`${this._classInfo}.delete() [${this._routeName}] OK`, result);
        response.json({ status: true });
      }
    });
  }

  /**
   * Gets a user by its id
   * @param {Request} request Request object
   * @param {Response} response Response
   * @example GET /api/user/123456789
   */
  get(request, response) {
    const id = request.params.id;
    logger.info(`${this._classInfo}.get(${id}) [${this._routeName}]`);

    repo.get(id, (error, result) => {
      if (error) {
        logger.error(`${this._classInfo}.get() [${this._routeName}]`, error);
        response.json(null);
      } else {
        logger.debug(`${this._classInfo}.get() [${this._routeName}] OK`, result);
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
        response.json({
          status: false,
          msg:
            'Insert failed' + error.code === 11000
              ? ': Username or Email already exist'
              : '',
          error: error,
          data: null
        });
      } else {
        logger.debug(`${this._classInfo}.insert() [${this._routeName}] OK`, result);
        response.json({ status: true, error: null, data: result });
      }
    });
  }

  /**
   * Updates a user
   * @param {Request} request Request object
   * @param {Response} response Response object
   * @examle PUT /api/user/123456789
   */
  update(request, response) {
    const id = request.params.id;
    logger.info(`${this._classInfo}.update(${id}) [${this._routeName}]`);

    repo.update(id, request.body, (error, result) => {
      if (error) {
        logger.error(`${this._classInfo}.update() [${this._routeName}]`, error, request.body);
        response.json({
          status: false,
          msg: 'Update Failed',
          error: {
            code: error.code,
            errmsg: error.errmsg,
            index: error.index
          },
          data: null
        });
      } else {
        logger.debug(`${this._classInfo}.update() [${this._routeName}] OK`, result);
        response.json(result);
      }
    });
  }
}

module.exports = UserController;

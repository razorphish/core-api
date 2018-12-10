'use strict';
/**
 * Users Api
 */

const repo = require('../../../app/database/repositories/account/user.repository');
const passport = require('passport');
const utils = require('../../../lib/utils');
const logger = require('../../../lib/winston.logger');

/**
 * User Api Controller
 * http://.../api/user
 */
class UserController {
  /**
   * Constructor for User
   * @param {router} router Node router framework
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
   * Adds a [Device]
   * endpoint [POST] : /:id
   * @param {any} req Request object
   * @param {any} res Response object
   */
  addDevice(req, res) {
    logger.info(`${this._classInfo}.addDevice() [${this._routeName}]`);

    if (!req.body) {
      throw new Error('Device required');
    }

    repo.addDevice(req.params.id, req.body, (err, resp) => {
      if (err) {
        logger.error(`${this._classInfo}.addDevice() [${this._routeName}]`, err);
        res.json({
          status: false,
          msg: 'Update Failed',
          error: {
            code: err.code,
            errmsg: err.errmsg,
            index: err.index
          },
          data: null
        });
      } else {
        logger.debug(`${this._classInfo}.addDevice() [${this._routeName}] OK`, resp);
        res.json({ status: true, msg: null, error: null, data: resp });
      }
    });
  }

  /**
   * Gets all [User]s
   * endpoint [GET]: /
   * @param {any} req Request object
   * @param {any} res Response
   */
  all(req, res) {
    logger.info(`${this._classInfo}.all() [${this._routeName}]`);

    repo.all((err, resp) => {
      if (err) {
        logger.error(`${this._classInfo}.all() [${this._routeName}]`, err);
        res.json(null);
      } else {
        logger.debug(`${this._classInfo}.all() [${this._routeName}] OK`, resp);
        res.json(resp.data);
      }
    });
  }

  /**
   * Gets all [User]s paged
   * endpoint [GET]: /page/:skip/:top
   * @param {any} req Request object
   * @param {any} res Response
   */
  allPaged(req, res) {
  logger.info(`${this._classInfo}.allPaged() [${this._routeName}]`);

    const topVal = req.params.top,
      skipVal = req.params.skip,
      top = isNaN(topVal) ? 10 : +topVal,
      skip = isNaN(skipVal) ? 0 : +skipVal;

    repo.allPaged(skip, top, (err, resp) => {
      res.setHeader('X-InlineCount', resp.count);
      if (err) {
        logger.error(`${this._classInfo}.allPaged() [${this._routeName}]`, err);
        res.json(null);
      } else {
        logger.debug(`${this._classInfo}.allPaged() [${this._routeName}] OK`, resp);
        res.json(resp.data);
      }
    });
  }

  /**
   * Gets all [User]s by role
   * endpoint [GET]: /roles/{roleId}
   * @param {any} req Request object
   * @param {any} res Response
   */
  byRole(req, res) {
    const id = req.params.id;
    logger.info(`${this._classInfo}.byRole(${id}) [${this._routeName}]`);

    repo.byRole(id, (err, resp) => {
      if (err) {
        logger.error(`${this._classInfo}.byRole() [${this._routeName}]`, err);
        res.json(null);
      } else {
        logger.debug(`${this._classInfo}.byRole() [${this._routeName}] OK`, resp);
        res.json(resp.data);
      }
    });
  }

  /**
   * Deletes a [User]
   * endpoint [DELETE]: /:id
   * @param {any} req Request object
   * @param {any} res Response object
   */
  delete(req, res) {
    const id = req.params.id;
    logger.info(`${this._classInfo}.delete(${id}) [${this._routeName}]`);

    repo.delete(id, (err) => {
      if (err) {
        logger.error(`${this._classInfo}.delete() [${this._routeName}]`, err);
        res.json({ status: false });
      } else {
        logger.debug(`${this._classInfo}.delete() [${this._routeName}] OK`, resp);
        res.json({ status: true });
      }
    });
  }

  /**
   * Gets a [User] by its id
   * endpoint [GET]: /:id'
   * @param {any} req Request object
   * @param {any} res Response
   */
  get(req, res) {
    const id = req.params.id;
    logger.info(`${this._classInfo}.get(${id}) [${this._routeName}]`);

    repo.get(id, (err, resp) => {
      if (err) {
        logger.error(`${this._classInfo}.get() [${this._routeName}]`, err);
        res.json(null);
      } else {
        logger.debug(`${this._classInfo}.get() [${this._routeName}] OK`, resp);
        res.json(resp);
      }
    });
  }

  /**
   * Inserts a [User]
   * endpoint [POST]: /
   * @param {any} req Request object
   * @param {any} res Response
   */
  insert(req, res) {
    logger.info(`${this._classInfo}.insert() [${this._routeName}]`);

    repo.insert(req.body, (err, resp) => {
      if (err) {
        logger.error(`${this._classInfo}.insert() [${this._routeName}]`, err);
        res.json({
          status: false,
          msg:
            'Insert failed' + err.code === 11000
              ? ': Username or Email already exist'
              : '',
          error: err,
          data: null
        });
      } else {
        logger.debug(`${this._classInfo}.insert() [${this._routeName}] OK`, resp);
        res.json({ status: true, error: null, data: resp });
      }
    });
  }

  /**
   * Updates a [User]
   * endpoint [PUT] : /:id
   * @param {any} req Request object
   * @param {any} res Response object
   */
  update(req, res) {
    const id = req.params.id;
    logger.info(`${this._classInfo}.update(${id}) [${this._routeName}]`);

    if (!req.body) {
      throw new Error('User required');
    }

    repo.update(id, req.body, (err, resp) => {
      if (err) {
        logger.error(`${this._classInfo}.update() [${this._routeName}]`, err, req.body);
        res.json({
          status: false,
          msg: 'Update Failed',
          error: {
            code: err.code,
            errmsg: err.errmsg,
            index: err.index
          },
          data: null
        });
      } else {
        logger.debug(`${this._classInfo}.update() [${this._routeName}] OK`, resp);
        res.json({ status: true, msg: null, error: null, data: resp });
      }
    });
  }
}

module.exports = UserController;

'use strict';
/**
 * Wishlist Category Api
 */

const repo = require('../../../../app/database/repositories/wishlist/wishlist-item-category.repository');
const passport = require('passport');
const utils = require('../../../../lib/utils');
const logger = require('../../../../lib/winston.logger');

/**
 * Wishlist Category for items Api Controller
 * http://.../api/wishlist/category
 * @author Antonio Marasco
 */
class WishlistItemCategoryController {

  /**
   * Constructor for Wishlist Item Category
   * @param {router} router Node router framework
   * @example let controller = new WishlistItemCategoryController(router);
   */
  constructor(router) {
    router.get(
      '/',
      //passport.authenticate('user-bearer', { session: false }),
      //utils.isInRole('admin'),
      this.all.bind(this)
    );

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

    router.delete(
      '/:id',
      passport.authenticate('user-bearer', { session: false }),
      utils.isInRole('admin'),
      this.delete.bind(this)
    );

    //Logging Info
    this._classInfo = '*** [wishlist-item-category].controller';
    this._routeName = '/api/wishlist/category';

  }

  /**
   * Gets all Wishlist item categories
   * @param {Request} [request] Request object
   * @param {Response} response Response
   * @example GET /api/wishlist/category
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
  }

  /**
   * Gets all Wishlist paginated
   * @param {Request} request Request object {Default:10}
   * @param {Request} [request.params.top=10]
   * @param {Response} response Response
   * @example /api/wishlist/page/2/10
   * @description /api/wishlist/category/page/{page number}/{# per page}
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
   * Deletes a wishlist
   * @param {Request} request Request object
   * @param {Response} response Response object
   * @example DELETE /api/wishlist/category/:id
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
   * Gets a Wishlist by its id
   * @param {Request} request Request object
   * @param {Response} response Response
   * @example GET /api/wishlist/category/:id
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
   * Inserts a wishlist
   * @param {Request} request Request object
   * @param {Response} response Response
   * @example POST /api/wishlist/category
   */
  insert(request, response) {
    logger.info(`${this._classInfo}.insert() [${this._routeName}]`);

    repo.insert(request.body, (error, result) => {
      if (error) {
        logger.error(`${this._classInfo}.insert() [${this._routeName}]`, error);
        response.json({
          status: false,
          msg: 'Insert failed',
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
   * Updates a wishlist
   * @param {Request} request Request object
   * @param {Response} response Response object
   * @example PUT /api/wishlist/category/:id
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

module.exports = WishlistItemCategoryController;

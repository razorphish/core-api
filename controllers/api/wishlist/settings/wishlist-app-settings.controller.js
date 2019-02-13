'use strict';
/**
 * Wishlist Application Settings Api
 */

const repo = require('../../../../app/database/repositories/wishlist/wishlit-app-settings.repository');
const passport = require('passport');
const utils = require('../../../../lib/utils');
const logger = require('../../../../lib/winston.logger');

/**
 * Wishlist Application Settings for items Api Controller
 * http://.../api/wishlist/settings
 * @author Antonio Marasco
 */
class WishlistAppSettingsController {

    /**
     * Constructor for Wishlist Application SEttings
     * @param {router} router Node router framework
     * @example let controller = new WishlistAppSettingsController(router);
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
        this._classInfo = '*** [wishlist-app-settings].controller';
        this._routeName = '/api/wishlist/settings';

    }

    /**
     * Gets all Wishlist item categories
     * @param {Request} [request] Request object
     * @param {Response} response Response
     * @example GET /api/wishlist/settings
     * @returns {pointer} res.json
     */
    all(request, response, next) {
        logger.info(`${this._classInfo}.all() [${this._routeName}]`);

        repo.all((error, result) => {
            if (error) {
                logger.error(`${this._classInfo}.all() [${this._routeName}]`, error);
                response.status(500).json(error);
                //next(error);
            } else {
                logger.debug(`${this._classInfo}.all() [${this._routeName}] OK`);
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
     * @description /api/wishlist/settings/page/{page number}/{# per page}
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
     * @example DELETE /api/wishlist/settings/:id
     * @returns {status: true|false} via res pointer
     */
    delete(request, response) {
        const id = request.params.id;
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
     * @example GET /api/wishlist/settings/:id
     */
    get(request, response) {
        const id = request.params.id;
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
     * @example POST /api/wishlist/settings
     */
    insert(request, response) {
        logger.info(`${this._classInfo}.insert() [${this._routeName}]`);

        repo.insert(request.body, (error, result) => {
            if (error) {
                logger.error(`${this._classInfo}.insert() [${this._routeName}]`, error);
                response.status(500).json(error);
            } else {
                logger.debug(`${this._classInfo}.insert() [${this._routeName}] OK`);
                response.json(result);
            }
        });
    }

    /**
     * Updates a wishlist
     * @param {Request} request Request object
     * @param {Response} response Response object
     * @example PUT /api/wishlist/settings/:id
     */
    update(request, response) {
        const id = request.params.id;
        logger.info(`${this._classInfo}.update(${id}) [${this._routeName}]`);

        repo.update(id, request.body, (error, result) => {
            if (error) {
                logger.error(`${this._classInfo}.update() [${this._routeName}]`, error, request.body);
                response.status(500).json(error);
            } else {
                logger.debug(`${this._classInfo}.update() [${this._routeName}] OK`);
                response.json(result);
            }
        });
    }
}

module.exports = WishlistAppSettingsController;

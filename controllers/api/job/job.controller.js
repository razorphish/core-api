'use strict';
/**
 * [Job] Api
 */

const repo = require('../../../app/database/repositories/job/job.repository');
const utils = require('../../../lib/utils');
const logger = require('../../../lib/winston.logger');
const passport = require('passport');

/**
 * [Job] Api Controller
 * http://.../api/job
 * @author Antonio Marasco
 */
class JobController {

    /**
     * Constructor for [Wishlist]
     * @param {router} router Node router framework
     * @example let controller = new JobController(router);
     */
    constructor(router) {
        router.get(
            '/',
            passport.authenticate('user-bearer', { session: false }),
            utils.isInRole('admin'),
            this.all.bind(this)
        );

        router.get(
            '/details',
            passport.authenticate('user-bearer', { session: false }),
            utils.isInRole('admin'),
            this.allDetails.bind(this)
        );

        router.get(
            '/search/:name',
            passport.authenticate('user-bearer', { session: false }),
            utils.isInRole('admin'),
            this.byName.bind(this)
        );

        router.get(
            '/user/:userId',
            passport.authenticate('user-bearer', { session: false }),
            utils.isInRole('admin'),
            this.byUserId.bind(this)
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

        router.get(
            '/:id/details',
            passport.authenticate('user-bearer', { session: false }),
            utils.isInRole(['admin', 'user']),
            this.getDetails.bind(this)
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
        this._classInfo = '*** [job].controller';
        this._routeName = '/api/job';

    }

    /**
     * Gets all {job}
     * @param {Request} [request] Request object
     * @param {Response} response Response
     * @author Antonio Marasco
     * @example GET /api/job
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
     * Gets all {job}s with details
     * @param {Request} [request] Request object
     * @param {Response} response Response
     * @example GET /api/job
     * @returns {pointer} res.json
     */
    allDetails(request, response, next) {
        logger.info(`${this._classInfo}.all() [${this._routeName}]`);

        repo.allDetails((error, result) => {
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
     * Gets all {job} paginated
     * @param {Request} request Request object {Default:10}
     * @param {Request} [request.params.top=10]
     * @param {Response} response Response
     * @example /api/job/page/2/10
     * @description /api/job/page/{page number}/{# per page}
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
     * @description Search {job}s by name only
     * @author Antonio Marasco
     * @date 2019-04-22
     * @param {*} request
     * @param {*} response
     * @description /api/job/search/:name
     * @memberof JobController
     */
    byName(request, response) {

        const name = request.params.name;
        logger.info(`${this._classInfo}.byName(${name}) [${this._routeName}]`);

        let query = {
            name: { $regex: name, $options: 'i' },
            statusId: { $eq: 'active' },
            privacy: { $eq: 'public' }
        }

        let fieldSelect = {
            name: 1,
            _id: 1,
        }

        repo.search(query, fieldSelect, (error, result) => {
            if (error) {
                logger.error(`${this._classInfo}.byName(${name}) [${this._routeName}]`, error);
                response.status(500).json(error);
            } else {
                logger.debug(`${this._classInfo}.byName() [${this._routeName}] OK`);
                response.json(result);
            }
        });
    }

    /**
     * @description Search wishlists by userId
     * @author Antonio Marasco
     * @date 2019-05-30
     * @param {*} request
     * @param {*} response
     * @description /api/job/user/:userId
     * @memberof WishlistController
     */
    byUserId(request, response) {

        const userId = request.params.userId;
        logger.info(`${this._classInfo}.byUserId(${userId}) [${this._routeName}]`);

        let query = {
            userId: { $regex: userId, $options: 'i' },
            statusId: { $eq: 'active' },
            privacy: { $eq: 'public' }
        }

        repo.byUserId(query, (error, result) => {
            if (error) {
                logger.error(`${this._classInfo}.byUserId(${userId}) [${this._routeName}]`, error);
                response.status(500).json(error);
            } else {
                logger.debug(`${this._classInfo}.byUserId() [${this._routeName}] OK`);
                response.json(result);
            }
        });
    }

    /**
     * Deletes a {job}
     * @param {Request} request Request object
     * @param {Response} response Response object
     * @example DELETE /api/job/:id
     * @returns {status: true|false} via res pointer
     */
    delete(request, response) {
        const id = request.params.id;
        logger.info(`${this._classInfo}.delete(${id}) [${this._routeName}]`);

        repo.delete(id, (error, result) => {
            if (error) {
                logger.error(`${this._classInfo}.delete() [${this._routeName}]`, error);
                response.status(500).json(error);
            } else {
                logger.debug(`${this._classInfo}.delete() [${this._routeName}] OK`);
                response.json(result);
            }
        });
    }

    /**
     * Gets a {job} by its id
     * @param {Request} request Request object
     * @param {Response} response Response
     * @example GET /api/job/:id
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
     * Gets a single {job} details
     * @param {string} id Entity id
     * @param {requestCallback} callback Handles the response
     * @example getDetails('123456789', (error, data) => {})
     */
    getDetails(request, response) {
        const id = request.params.id;
        logger.info(`${this._classInfo}.getDetails(${id}) [${this._routeName}]`);

        repo.getDetails(id, (error, result) => {
            if (error) {
                logger.error(`${this._classInfo}.getDetails() [${this._routeName}]`, error);
                response.status(500).json(error);
            } else {
                logger.debug(`${this._classInfo}.getDetails() [${this._routeName}] OK`);
                response.json(result);
            }
        });
    }

    /**
     * Inserts a {job}
     * @param {Request} request Request object
     * @param {Response} response Response
     * @example POST /api/job
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
     * Updates a {job}
     * @param {Request} request Request object
     * @param {Response} response Response object
     * @example PUT /api/job/:id
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

module.exports = JobController;

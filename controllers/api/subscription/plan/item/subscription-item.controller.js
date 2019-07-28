'use strict';
/**
 * [SubscriptionItem]
 */
const passport = require('passport');

const repo = require('../../../../../app/database/repositories/subscription/subscription-item.repository');
const utils = require('../../../../../lib/utils');
const logger = require('../../../../../lib/winston.logger');

/**
 * [SubscriptionItem] Controller
 * http://.../api/subscription/plan/:id/item
 * @author Antonio Marasco
 */
class SubscriptionItemController {

    /**
     * Constructor for {subscriptionItem}
     * @param {router} router Node router framework
     * @example let controller = new SubscriptionItemController(router);
     */
    constructor(router) {
        router.get(
            '/:id/item',
            passport.authenticate('user-bearer', { session: false }),
            utils.isInRole('admin'),
            this.all.bind(this)
        );

        router.get(
            '/:id/item/page/:skip/:top',
            passport.authenticate('user-bearer', { session: false }),
            utils.isInRole('admin'),
            this.allPaged.bind(this)
        );

        router.get(
            '/:id/item/:itemId',
            passport.authenticate('user-bearer', { session: false }),
            utils.isInRole(['admin', 'user']),
            this.get.bind(this)
        );

        router.post(
            '/:id/item',
            passport.authenticate('user-bearer', { session: false }),
            utils.isInRole('admin'),
            this.insert.bind(this)
        );

        router.put(
            '/:id/item/:itemId',
            passport.authenticate('user-bearer', { session: false }),
            utils.isInRole(['admin', 'user']),
            this.update.bind(this)
        );

        router.delete(
            '/:id/item/:itemId',
            passport.authenticate('user-bearer', { session: false }),
            utils.isInRole('admin'),
            this.delete.bind(this)
        );

        //Logging Info
        this._classInfo = '*** [subscription-item].controller';
        this._routeName = '/api/subscription/plan/:id/item';

    }

    /**
     * Gets all {subscriptionItem}
     * @param {Request} [request] Request object
     * @param {Response} response Response
     * @example GET /api/subscription/plan/:id/item
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
                logger.debug(`${this._classInfo}.all() [${this._routeName}] OK`, result);
                response.json(result);
            }
        });
    }

    /**
     * Gets all {subscriptionItem} paginated
     * @param {Request} request Request object {Default:10}
     * @param {Request} [request.params.top=10]
     * @param {Response} response Response
     * @example /api/subscription/plan/page/2/10
     * @description /api/subscription/plan/:id/item/page/{page number}/{# per page}
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
                logger.debug(`${this._classInfo}.allPaged() [${this._routeName}] OK`, result);
                response.json(result);
            }
        });
    }

    /**
     * Deletes a {subscriptionItem}
     * @param {Request} request Request object
     * @param {Response} response Response object
     * @example DELETE /api/subscription/plan/:id/item/:itemId
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
     * Gets a {subscriptionItem} by its id
     * @param {Request} request Request object
     * @param {Response} response Response
     * @example GET /api/subscription/plan/:id/item/:itemId
     */
    get(request, response) {
        const id = request.params.id;
        logger.info(`${this._classInfo}.get(${id}) [${this._routeName}]`);

        repo.get(id, (error, result) => {
            if (error) {
                logger.error(`${this._classInfo}.get() [${this._routeName}]`, error);
                response.status(500).send(error)
            } else {
                logger.debug(`${this._classInfo}.get() [${this._routeName}] OK`, result);
                response.json(result);
            }
        });
    }

    /**
     * Inserts a {subscriptionItem}
     * @param {Request} request Request object
     * @param {Response} response Response
     * @example POST /api/subscription/plan/:id/item
     */
    insert(request, response, next) {
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
     * @description Updates a {subscriptionItem}
     * @author Antonio Marasco
     * @date 2019-05-09
     * @param {*} request
     * @param {*} response
     * @memberof SubscriptionItemController
     */
    update(request, response) {
        const id = request.params.id; //{subscriptionPlan} id
        const itemId = request.params.itemId; //{subscriptionItem} item id

        logger.info(`${this._classInfo}.update(${id}, ${itemId}) [${this._routeName}]`);

        repo.update(itemId, request.body, (error, result) => {
            if (error) {
                logger.error(`${this._classInfo}.update() [${this._routeName}]`, error, request.body);
                response.status(500).send(error);
            } else {
                logger.debug(`${this._classInfo}.update() [${this._routeName}] OK`, result);
                response.json(result);
            }
        });
    }


}

module.exports = SubscriptionItemController;

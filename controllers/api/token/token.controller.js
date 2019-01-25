//Tokens Api
const repo = require('../../../app/database/repositories/auth/token.repository');
const utils = require('../../../lib/utils');
const logger = require('../../../lib/winston.logger');
const passport = require('passport');

/**
 * Token Controller
 * http://.../api/tokens
 * @author Antonio Marasco
 */
class TokensController {
    /**
     * Constructor for tokens
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

        //Logging Info
        this._classInfo = '*** [Token].controller';
        this._routeName = '/api/token';
    }

    /**
     * Gets all tokens
     * @param {Request} [request] Request object
     * @param {Response} response Response
     * @example GET /api/token
     * @returns {pointer} res.json
     */
    all(request, response, next) {
        logger.info(`${this._classInfo}.all() [${this._routeName}]`);

        repo.details((error, result) => {
            if (error) {
                logger.error(`${this._classInfo}.all() [${this._routeName}]`, error);
                response.status(500).send(error);
            } else {
                logger.debug(`${this._classInfo}.all() [${this._routeName}] OK`);
                response.json(result);
            }
        });
    }

    /**
     * Gets all tokens paginated
     * @param {Request} request Request object {Default:10}
     * @param {Request} [request.params.top=10]
     * @param {Response} response Response
     * @example /api/token/page/2/10
     * @description /api/token/page/{page number}/{# per page}
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
                response.status(500).send(error);
            } else {
                logger.debug(`${this._classInfo}.allPaged() [${this._routeName}] OK`);
                response.json(result);
            }
        });
    }

    /**
     * Deletes a token
     * @param {Request} request Request object
     * @param {Response} response Response object
     * @example DELETE /api/token/:id
     * @returns {status: true|false} via res pointer
     */
    delete(request, response) {
        const id = request.params.id;
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
     * Gets a token by its id
     * @param {Request} request Request object
     * @param {Response} response Response
     * @example GET /api/token/:id
     */
    get(request, response) {
        const id = request.params.id;
        logger.info(`${this._classInfo}.get(${id}) [${this._routeName}]`);

        repo.detailsById(id, (error, result) => {
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
     * Inserts a token
     * @param {Request} request Request object
     * @param {Response} response Response
     * @example POST /api/token
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
     * Updates a token
     * @param {Request} request Request object
     * @param {Response} response Response object
     * @example PUT /api/user/:id
     */
    update(request, response) {
        const id = request.params.id;
        logger.info(`${this._classInfo}.update(${id}) [${this._routeName}]`);

        repo.update(id, request.body, (error, result) => {
            if (error) {
                logger.error(`${this._classInfo}.update() [${this._routeName}]`, error, request.body);
                response.status(500).send(error);
            } else {
                logger.debug(`${this._classInfo}.update() [${this._routeName}] OK`);
                response.json(result);
            }
        });
    }
}

module.exports = TokensController;

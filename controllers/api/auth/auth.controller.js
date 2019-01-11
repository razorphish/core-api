//Account Api
const repo = require('../../../app/database/repositories/auth/token.repository');
const utils = require('../../../lib/utils');
const logger = require('../../../lib/winston.logger');
const passport = require('passport');

/**
 * Auth Api Controller
 * http://.../api/auth
 * @author Antonio Marasco
 */
class AuthController {
    /**
     * Constructor for authorization
     * @param {router} router Node router framework
     */
    constructor(router) {

        router.post(
            '/logout',
            // passport.authenticate('user-bearer', { session: false }),
            // utils.isInRole('admin', 'user'),
            this.logout.bind(this)
        );

        //Logging Info
        this._classInfo = '*** [auth].controller';
        this._routeName = '/api/auth';
    }

    /**
     * Inserts a account
     * @param {Request} request Request object
     * @param {Response} response Response
     * @example POST /api/auth/logout
     */
    logout(request, response) {
        logger.info(`${this._classInfo}.logout() [${this._routeName}]`);

        repo.deleteByUserId(request.body.user._id, (error, result) => {
            if (error) {
                logger.error(`${this._classInfo}.logout() [${this._routeName}]`, error);
                response.json({
                    status: false,
                    msg: 'Logout failed',
                    error: error,
                    data: null
                });
            } else {
                request.logout();
                logger.debug(`${this._classInfo}.logout() [${this._routeName}] OK`, result);
                response.json({ status: true, error: null, data: result });
            }
        });
    }
}

module.exports = AuthController;

//Account Api
const tokenRepo = require('../../../app/database/repositories/auth/token.repository');
const userRepo = require('../../../app/database/repositories/account/user.repository');
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

        router.post(
            '/register-with-email-password',
            // passport.authenticate('user-bearer', { session: false }),
            // utils.isInRole('admin'),
            this.registerWithEmailPassword.bind(this)
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

        tokenRepo.deleteByUserId(request.body.user._id, (error, result) => {
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

   /**
   * Registers a user with email and password
   * @param {Request} request Request object
   * @param {Response} response Response
   * @example POST /api/user
   */
  registerWithEmailPassword(request, response) {
    logger.info(`${this._classInfo}.registerWithEmailPassword() [${this._routeName}]`);

    userRepo.insert(request.body, (error, result) => {
      if (error) {
        logger.error(`${this._classInfo}.registerWithEmailPassword() [${this._routeName}]`, error);
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
        logger.debug(`${this._classInfo}.registerWithEmailPassword() [${this._routeName}] OK`, result);
        response.json({ status: true, error: null, data: result });
      }
    });
  }
}

module.exports = AuthController;

//Account Api
const async = require('async');

const tokenRepo = require('../../../app/database/repositories/auth/token.repository');
const userRepo = require('../../../app/database/repositories/account/user.repository');
const logger = require('../../../lib/winston.logger');
const utils = require('../../../lib/utils');
const mandrill = require('../../../lib/mandrill.library').mandrill;


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
      this.logout.bind(this)
    );

    router.post(
      '/register-with-email-password',
      this.registerWithEmailPassword.bind(this)
    );

    router.post(
      '/forgot-password',
      this.forgotPassword.bind(this)
    );

    //Logging Info
    this._classInfo = '*** [auth].controller';
    this._routeName = '/api/auth';
  }

  /**
   * Forgot password
   * @param {Request} request Request object
   * @param {Response} response Response
   * @example POST /api/auth/forgot-password
   */
  forgotPassword(request, response, next) {
    async.waterfall([
      (done) => {
        userRepo.byEmail(request.body.email, (error, result) => {

          if (error) {
            logger.error(`${this._classInfo}.forgotPassword() [${this._routeName}]`, error);
            req.flash('error', 'User get by email failed');
            response.json({
              status: false,
              msg: 'User get by email failed',
              error: error,
              data: null
            });
          } else {
            if (!result) {
              req.flash('error', 'No account with that email address exists.');
              response.json({
                status: false,
                msg: 'No account with email exists',
                error: error,
                data: null
              });
            } else {
              let newToken = utils.createHttpToken(result._id, 'forgot_password_token', '120', '*', 'forgot_password', 'marasco')

              tokenRepo.insert(newToken, (error, token) => {
                return done(error, token, result);
              });
            }
          }
        })
      },
      (token, user, done) => {

        var mailOptions = {
          to: user.email,
          from: 'passwordreset@demo.com',
          subject: 'Node.js Password Reset',
          text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + request.headers.host + '/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };

        mandrill.messages.send(mailOptions, (result) => {

        }, (error) => {

        });
      }
    ], (error) => {
      if (error) {
        return next(error)
      }
    });
  }

  /**
   * Logs user out
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
  * @example POST /api/register-with-email-password'
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

//Account Api
const async = require('async');

const tokenRepo = require('../../../app/database/repositories/auth/token.repository');
const userRepo = require('../../../app/database/repositories/account/user.repository');
const logger = require('../../../lib/winston.logger');
const mandrill = require('../../../lib/mandrill.library').mandrill;
const mandrillConfig = require('../../../lib/config.loader').mandrill;
const httpSign = require('../../../app/security/signers/http-sign');

/**
 * This callback type is called `requestCallback` and is displayed as a global symbol.
 *
 * @callback requestCallback
 * @param {*} error
 * @param {*} data
 */

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

    // forgot-password
    router.post(
      '/forgot-password',
      this.forgotPassword.bind(this)
    );

    // logout
    router.post(
      '/logout',
      this.logout.bind(this)
    );

    // register-with-email-password
    router.post(
      '/register-with-email-password',
      this.registerWithEmailPassword.bind(this)
    );

    // Reset password : GET (verifies token)
    router.get(
      '/reset-password/:token',
      this.verifyResetPasswordToken.bind(this)
    );

    // Reset password : POST (changes User password)
    router.post(
      '/reset-password/:token',
      this.resetPassword.bind(this)
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
    logger.info(`${this._classInfo}.forgotPassword() [${this._routeName}]`);

    var mailchimp_async = false;
    async.waterfall([
      (done) => {
        var query = !!request.body.email ? { email: request.body.email } : { username: request.body.username }

        userRepo.search(query, (error, user) => {

          if (error) {
            logger.error(`${this._classInfo}.forgotPassword() [${this._routeName}]`, error);
            response.status(500).send(error);
          } else if (!user) {
            response.status(404).send({ error: { message: 'User does not exist' } });
          } else {
            let newToken = httpSign.token(user._id, 'forgot_password_token', '30', '*', 'forgot_password', 'marasco')
            newToken.origin = request.headers.origin;

            tokenRepo.insert(newToken, (error, token) => {
              //return done(error, token, user);
              if (!!token) {
                token.value_ = newToken.value_
              }
              done(error, token, user);
            });
          }
        })
      },
      (token, user, done) => {

        var html_content = 'Hello ' + user.firstName + ',<br/>' +
          'You are receiving this because you (or someone else) have requested the reset of the password for your account.<br/><br/>' +
          'Please click on the following link, or paste this into your browser to complete the process:<br/><br/>' +
          token.origin + '/auth/reset-password/' + token.value_ + '<br/><br/>' +
          'If you did not request a password reset, please ignore this email or reply to us to let us know.  ' +
          'This password reset is only valid for the next 30 minutes<br/><br/>' +
          'Thanks,<br/>' +
          'Maras.co Support<br/><br/>' +
          '<b>P.S.</b> WE also love hearing from you and helping you with any issues ' +
          'you have.  Please reply to this email if you want to ask a question or just say hi.<br/><br/>';

        var message = {
          to: [{
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            type: 'to'
          }],
          //headers: { "Reply-To": mandrillConfig.reply_to },
          important: false,
          // merge: true,
          // merge_language: "mailchimp",
          // merge_vars: [{
          //   rcpt: user.email,
          //   vars: [{
          //     name: "merge2",
          //     content: "merge2 content"
          //   }]
          // }],
          // tags: [
          //   "password-resets"
          // ],
          from_email: mandrillConfig.from_email,
          //from: mandrillConfig.from_email,
          from_name: mandrillConfig.from_name,
          subject: 'Forgot Password Reset',
          text: html_content,
          html: html_content
          // , google_analytics_domains: [
          //   'maras.co'
          // ],
          // google_analytics_campaign: "message.from_email@example.com",
          // metadata: {
          //   "website": "www.example.com"
          // },
          // recipient_metadata: [{
          //   rcpt: "recipient.email@example.com",
          //   values: {
          //     user_id: user.id
          //   }
          // }],
        };

        mandrill.messages.send({ message: message, async: mailchimp_async }, (data) => {
          logger.debug(`${this._classInfo}.forgotPassword() [${this._routeName}] MESSAGE REQUESTED`, data);
          let emailResult = data[0];

          if (emailResult.status !== 'sent') {
            response.status(500).send(new Error(email.reject_reason));
          }

          return done(null, emailResult);
        }, (error) => {
          done(error)
        });
      }
    ], (error, result) => {
      if (error) {
        logger.error(`${this._classInfo}.forgotPassword() [${this._routeName}]`, error);
        return next(error)
      }
      logger.debug(`${this._classInfo}.forgotPassword() [${this._routeName}] OK`);
      response.json(result);
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
        response.status(500).send(error);
      } else {
        request.logout();
        logger.debug(`${this._classInfo}.logout() [${this._routeName}] OK`);
        response.json(result);
      }
    });
  }

  /**
  * Registers a user with email and password
  * @param {Request} request Request object
  * @param {Response} response Response
  * @example POST /api/auth/register-with-email-password'
  */
  registerWithEmailPassword(request, response) {
    logger.info(`${this._classInfo}.registerWithEmailPassword() [${this._routeName}]`);

    userRepo.insert(request.body, (error, result) => {
      if (error) {
        logger.error(`${this._classInfo}.registerWithEmailPassword() [${this._routeName}]`, error);
        response.status(500).send(error);
      } else {
        logger.debug(`${this._classInfo}.registerWithEmailPassword() [${this._routeName}] OK`);
        response.json(result);
      }
    });
  }

  /**
 * Resets a password with a token
 * @param {Request} request Request object
 * @param {Response} response Response
 * @example POST /api/auth/reset-password/:token
 */
  resetPassword(request, response, next) {
    const token_ = request.params.token;
    const token = httpSign.decode(token_);
    const password = request.body.password;
    var mailchimp_async = false;

    logger.info(`${this._classInfo}.resetPassword(${token}) [${this._routeName}]`);

    async.waterfall([
      (done) => {
        tokenRepo.search(
          { value: token, dateExpire: { $gt: Date.now() } }
          , (error, result) => {
            if (error) {
              logger.error(`${this._classInfo}.resetPassword(${token}) [${this._routeName}]`, error);
              response.status(500).send(error);
            } else if (!result) {
              logger.debug(`${this._classInfo}.resetPassword(${token}) [${this._routeName}]`, 'Missing/invalid Token');
              response.status(404).send({ error: { message: 'Token is missing or invalid' } })
            } else {
              logger.debug(`${this._classInfo}.resetPassword(${token}) [${this._routeName}]::search() OK`);

              tokenRepo.delete(result._id, (error, deleteResult) => {
                request.login(result, (error) => {
                  done(error, result);
                })
              })
            }
          });
      },
      (token, done) => {
        userRepo.get(token.userId, (error, user) => {

          if (error) {
            logger.error(
              `${this._classInfo}.resetPassword(${token}) [${this._routeName}]::get()`, error);
            response.status(500).send(error);
          } else if (!user) {
            logger.debug(`${this._classInfo}.resetPassword(${token}) [${this._routeName}]::get() :: MISSING TOKEN USER`);
            response.status(404).send({ error: { message: 'User is missing or invalid' } });
          } else {
            user.password = password;

            user.save((error, result) => {
              if (error) {
                response.status(404).send({ error: { message: 'Reset Password: Save user failed' } })
                return done(error);
              }

              return done(null, result);
            })
          }
        })
      },
      (user, done) => {
        var html_content = 'Hello ' + user.firstName + ',<br/>' +
          'This is a confirmation that the password for your account ' +
          user.username +
          ' has just been changed.<br/><br/>' +
          'Thanks,<br/>' +
          'Maras.co Support<br/><br/>' +
          '<b>P.S.</b> WE also love hearing from you and helping you with any issues ' +
          'you have.  Please reply to this email if you want to ask a question or just say hi.<br/><br/>';

        var message = {
          to: [{
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            type: 'to'
          }],
          headers: { "Reply-To": mandrillConfig.reply_to },
          important: false,
          from_email: mandrillConfig.from_email,
          from_name: mandrillConfig.from_name,
          subject: 'Your password has been changed',
          text: html_content,
          html: html_content
        };

        mandrill.messages.send({ message: message, async: mailchimp_async }, (data) => {
          logger.debug(`${this._classInfo}.resetPassword() [${this._routeName}] MESSAGE REQUESTED`, data);
          let emailResult = data[0];

          if (emailResult.status !== 'sent') {
            response.status(500).send(new Error(email.reject_reason));
          }

          return done(null, emailResult);
        }, (error) => {
          done(error)
        });
      }
    ], (error, result) => {
      if (error) {
        logger.error(`${this._classInfo}.resetPassword() [${this._routeName}]`, error);
        return next(error);
      }
      logger.debug(`${this._classInfo}.resetPassword() [${this._routeName}/reset-password POST] OK`);
      response.json(result);
    });
  }

  /**
   * Verifies a user's reset password token
   * @param {Request} request Request object
   * @param {Response} response Response
   * @param {any} next Next method (callback)
   * @example GET /api/auth/verify-reset-password/:token
   */
  verifyResetPasswordToken(request, response, next) {
    const token_ = request.params.token;
    const token = httpSign.decode(token_);
    logger.info(`${this._classInfo}.verifyResetPasswordToken(${token}) [${this._routeName}]`);

    async.waterfall([
      (done) => {
        tokenRepo.search(
          { value: token, dateExpire: { $gt: Date.now() } }
          , (error, result) => {
            if (error) {
              logger.error(`${this._classInfo}.verifyResetPasswordToken(${token}) [${this._routeName}]`, error);
              response.status(500).send(error);
            } else if (!result) {
              logger.debug(`${this._classInfo}.verifyResetPasswordToken(${token}) [${this._routeName}]::get() :: MISSING TOKEN`);
              response.status(404).send({ error: { message: 'Token is missing or invalid' } })
              //done(error);
            } else {
              done(error, result);
            }
          });
      },
      (token, done) => {
        userRepo.get(token.userId, (error, user) => {

          if (error) {
            logger.error(`${this._classInfo}.verifyResetPasswordToken(${token}) [${this._routeName}]::get()`, error);
            response.status(500).send(error);
          } else if (!user) {
            logger.debug(`${this._classInfo}.verifyResetPasswordToken(${token}) [${this._routeName}]::get() :: MISSING TOKEN USER`);
            response.status(404).send({ error: { message: 'Token User is missing or invalid' } })
          } else {
            done(null, user);
          }
        })
      }
    ], (error, result) => {
      if (error) {
        logger.error(`${this._classInfo}.verifyResetPasswordToken() [${this._routeName}]/verify`, error);
        return next(error);
      }
      logger.debug(`${this._classInfo}.verifyResetPasswordToken() [${this._routeName}/reset-password/:token GET] OK`);
      response.json(result);
    });
  }

  //End Class
}

module.exports = AuthController;

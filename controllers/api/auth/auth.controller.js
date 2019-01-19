//Account Api
const async = require('async');

const tokenRepo = require('../../../app/database/repositories/auth/token.repository');
const userRepo = require('../../../app/database/repositories/account/user.repository');
const logger = require('../../../lib/winston.logger');
const utils = require('../../../lib/utils');
const mandrill = require('../../../lib/mandrill.library').mandrill;
const mandrillConfig = require('../../../lib/config.loader').mandrill;

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

    // register-with-email-password
    router.get(
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
        userRepo.byEmail(request.body.email, (error, user) => {

          if (error) {
            logger.error(`${this._classInfo}.forgotPassword() [${this._routeName}]`, error);
            response.json({
              status: false,
              msg: 'User get by email failed',
              error: error,
              data: null
            });
            done(error)
          } else if (!user) {
            response.json({
              status: false,
              msg: 'No account with email exists',
              error: error,
              data: null
            });
            done(new Error('No account with email exists'));
          } else {
            let newToken = utils.createHttpToken(user._id, 'forgot_password_token', '30', '*', 'forgot_password', 'marasco')

            tokenRepo.insert(newToken, (error, token) => {
              //return done(error, token, user);
              done(error, token, user);
            });
          }
        })
      },
      (token, user, done) => {

        var html_content = 'Hello ' + user.firstName + ',<br/>' +
          'You are receiving this because you (or someone else) have requested the reset of the password for your account.<br/><br/>' +
          'Please click on the following link, or paste this into your browser to complete the process:<br/><br/>' +
          'http://' + request.headers.host + '/api/auth/reset/' + token.value + '<br/><br/>' +
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
          //response.json({ status: true, error: null, data: result });
          let emailResult = data[0];

          if (emailResult.status !== 'sent') {
            response.json({ status: true, error: emailResult, data: null });
            return done(new Error(email.reject_reason))
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
      logger.debug(`${this._classInfo}.forgotPassword() [${this._routeName}] OK`, result);
      response.json({ status: true, error: null, data: result });
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
  * @example POST /api/auth/register-with-email-password'
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

  /**
   * Resets a password with a token
   * @param {Request} request Request object
   * @param {Response} response Response
   * @example GET /api/auth/reset-password/:token
   */
  resetPassword(request, response) {
    const token = request.params.token;
    var mailchimp_async = false;

    logger.info(`${this._classInfo}.resetPassword(${token}) [${this._routeName}]`);

    async.waterfall([
      (done) => {
        tokenRepo.search(
          { value: token, dateExpire: { $gt: Date.now() } }
          , (error, result) => {
            if (error) {
              logger.error(`${this._classInfo}.resetPassword(${token}) [${this._routeName}]`, error);
              response.json(null);
            } else {

              //if token expired send error
              //if token valid send OK and delete token
              logger.debug(`${this._classInfo}.resetPassword(${token}) [${this._routeName}] OK`, result);
              result.expiresIn = 0;
              result.dateExpire = Date.now;

              result.save((error) => {
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
            logger.error(`${this._classInfo}.resetPassword(${token}) [${this._routeName}]::get()`, error);
            response.json({
              status: false,
              msg: 'User get by id failed',
              error: error,
              data: null
            });
            done(error);
          } else if (!user) {

            response.json({
              status: false,
              msg: 'No account with this id exists',
              error: error,
              data: null
            });

            done(new Error('No account with id exists'));
          } else {
            done(null, user);
          }
        })
      },
      (user, done) => {
        var html_content = 'Hello ' + user.firstName + ',<br/>' +
          'This is a confirmation that the password for your account ' + user.username + ' has just been changed.<br/><br/>' +
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
          //response.json({ status: true, error: null, data: result });
          let emailResult = data[0];

          if (emailResult.status !== 'sent') {
            response.json({ status: true, error: emailResult, data: null });
            return done(new Error(email.reject_reason))
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
      logger.debug(`${this._classInfo}.forgotPassword() [${this._routeName}] OK`, result);
      response.json({ status: true, error: null, data: result });
    });
  }

  //End Class
}

module.exports = AuthController;

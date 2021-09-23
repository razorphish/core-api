/* eslint-disable consistent-return */
// Account Api
const async = require('async');

const tokenRepo = require('../../../app/database/repositories/auth/token.repository');
const userRepo = require('../../../app/database/repositories/account/user.repository');
const applicationRepo = require('../../../app/database/repositories/application/application.repository');
const logger = require('../../../lib/winston.logger');
const { mandrill } = require('../../../lib/mandrill.library');
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
    router.post('/forgot-password', this.forgotPassword.bind(this));

    // logout
    router.post('/logout', this.logout.bind(this));

    // logout all devices
    router.post('/logout-all', this.logoutAllDevices.bind(this));

    // register-with-email-password
    router.post(
      '/register-with-email-password',
      this.registerWithEmailPassword.bind(this)
    );

    router.post('/register-with-email', this.registerWithEmail.bind(this));

    // Reset password : GET (verifies token)
    router.get(
      '/reset-password/:token',
      this.verifyResetPasswordToken.bind(this)
    );

    // Reset password : POST (changes User password)
    router.post('/reset-password/:token', this.resetPassword.bind(this));

    // Logging Info
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

    const mailchimpAsync = false;
    async.waterfall(
      [
        (done) => {
          const { applicationId } = request.body;
          const query = request.body.email
            ? {
                email: request.body.email,
                applicationId
              }
            : {
                username: request.body.username,
                applicationId
              };

          userRepo.searchDetails(query, (error, user) => {
            if (error) {
              logger.error(
                `${this._classInfo}.forgotPassword() [${this._routeName}]`,
                error
              );
              response
                .status(500)
                .send({ error, message: 'Unknown error occurred' });
            } else if (!user) {
              response.status(404).send({ message: 'User does not exist' });
            } else {
              const newToken = httpSign.token(
                user._id,
                'forgot_password_token',
                '30',
                '*',
                'forgot_password',
                'marasco'
              );

              // TODO: Fixed based on application
              // newToken.origin = request.headers.origin;
              newToken.origin = 'https://wishlist.maras.co';
              // TODO

              tokenRepo.insert(newToken, (err, token) => {
                // return done(error, token, user);
                if (token) {
                  token.value_ = newToken.value_;
                }
                done(err, token, user);
              });
            }
          });
        },
        (token, user, done) => {
          const message = this.__createForgotPasswordEmail(user, token);

          mandrill.messages.send(
            { message, async: mailchimpAsync },
            (data) => {
              logger.debug(
                `${this._classInfo}.forgotPassword() [${this._routeName}] MESSAGE REQUESTED`,
                data
              );
              const emailResult = data[0];

              if (emailResult.status !== 'sent') {
                response.status(500).send(new Error(data.reject_reason));
              }

              return done(null, emailResult);
            },
            (error) => {
              done(error);
            }
          );
        }
      ],
      (error, result) => {
        if (error) {
          logger.error(
            `${this._classInfo}.forgotPassword() [${this._routeName}]`,
            error
          );
          return next(error);
        }
        logger.debug(
          `${this._classInfo}.forgotPassword() [${this._routeName}] OK`
        );
        response.json(result);
      }
    );
  }

  /**
   * Logs user out of a single device [current]
   * @param {Request} request Request object
   * @param {Response} response Response
   * @example POST /api/auth/logout
   */
  logout(request, response) {
    logger.info(`${this._classInfo}.logout() [${this._routeName}]`);
    const token_ = request.headers.authorization;

    if (token_) {
      const tokenHash = httpSign.decode(token_);

      tokenRepo.deleteByTokenHash(tokenHash, (error, result) => {
        if (error) {
          logger.error(
            `${this._classInfo}.logout() [${this._routeName}]`,
            error
          );
          response.status(500).send(error);
        } else {
          request.logout();
          logger.debug(`${this._classInfo}.logout() [${this._routeName}] OK`);
          response.json(result);
        }
      });
    } else {
      tokenRepo.deleteByUserId(request.body.user._id, (error, result) => {
        if (error) {
          logger.error(
            `${this._classInfo}.logout() [${this._routeName}]`,
            error
          );
          response.status(500).send(error);
        } else {
          request.logout();
          logger.debug(`${this._classInfo}.logout() [${this._routeName}] OK`);
          response.json(result);
        }
      });
    }
  }

  /**
   * Logs user out of all devices from which they are attached
   * @param {Request} request Request object
   * @param {Response} response Response
   * @example POST /api/auth/logout-all
   */
  logoutAllDevices(request, response) {
    logger.info(`${this._classInfo}.logoutAll() [${this._routeName}]`);

    tokenRepo.deleteByUserId(request.body.user._id, (error, result) => {
      if (error) {
        logger.error(
          `${this._classInfo}.logoutAll() [${this._routeName}]`,
          error
        );
        response.status(500).send(error);
      } else {
        request.logout();
        logger.debug(`${this._classInfo}.logoutAll() [${this._routeName}] OK`);
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
  registerWithEmailPassword(request, response, next) {
    logger.info(
      `${this._classInfo}.registerWithEmailPassword() [${this._routeName}]`
    );

    async.waterfall(
      [
        (done) => {
          applicationRepo.get(request.body.applicationId, (error, result) => {
            if (error) {
              logger.error(
                `${this._classInfo}.registerWithEmailPassword() [${this._routeName}]`,
                error
              );
              response.status(500).send(error);
            } else if (!result) {
              logger.debug(
                `${this._classInfo}.registerWithEmailPassword() [${this._routeName}]::get() :: MISSING APPLICATION`
              );
              response.status(404).send({
                error: { message: 'Application is missing or invalid' }
              });
            } else {
              logger.debug(
                `${this._classInfo}.registerWithEmailPassword() [${this._routeName}] OK`
              );
              return done(null, result);
            }
          });
        },
        (application, done) => {
          userRepo.insert(request.body, (error, result) => {
            if (error) {
              logger.error(
                `${this._classInfo}.registerWithEmailPassword() [${this._routeName}]`,
                error
              );
              response.status(500).send(error);
            } else {
              logger.debug(
                `${this._classInfo}.registerWithEmailPassword() [${this._routeName}] OK`
              );
              return done(null, result);
            }
          });
        }
      ],
      (error, result) => {
        if (error) {
          logger.error(
            `${this._classInfo}.registerWithEmailPassword() [${this._routeName}]`,
            error
          );
          return next(error);
        }
        logger.debug(
          `${this._classInfo}.registerWithEmailPassword() [${this._routeName}/register-with-email-password POST] OK`
        );
        response.json(result);
      }
    );
  }

  /**
   * Registers a user with email and password
   * @param {Request} request Request object
   * @param {Response} response Response
   * @example POST /api/auth/register-with-email-password'
   */
  registerWithEmail(request, response, next) {
    logger.info(`${this._classInfo}.registerWithEmail() [${this._routeName}]`);

    async.waterfall(
      [
        (done) => {
          applicationRepo.get(request.body.applicationId, (error, result) => {
            if (error) {
              logger.error(
                `${this._classInfo}.registerWithEmail() [${this._routeName}]`,
                error
              );
              response.status(500).send(error);
            } else if (!result) {
              logger.debug(
                `${this._classInfo}.registerWithEmail() [${this._routeName}]::get() :: MISSING APPLICATION`
              );
              response.status(404).send({
                error: { message: 'Application is missing or invalid' }
              });
            } else {
              logger.debug(
                `${this._classInfo}.registerWithEmail() [${this._routeName}] OK`
              );
              return done(null, result);
            }
          });
        },
        (application, done) => {
          request.body.username = request.body.email;

          userRepo.insert(request.body, (error, result) => {
            if (error) {
              logger.error(
                `${this._classInfo}.registerWithEmail() [${this._routeName}]`,
                error
              );
              response.status(500).send(error);
            } else {
              logger.debug(
                `${this._classInfo}.registerWithEmail() [${this._routeName}] OK`
              );
              return done(null, result);
            }
          });
        }
      ],
      (error, result) => {
        if (error) {
          logger.error(
            `${this._classInfo}.registerWithEmail() [${this._routeName}]`,
            error
          );
          return next(error);
        }
        logger.debug(
          `${this._classInfo}.registerWithEmail() [${this._routeName}/register-with-email POST] OK`
        );
        response.json(result);
      }
    );
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
    const { password } = request.body;
    const mailchimpAsync = false;

    logger.info(
      `${this._classInfo}.resetPassword(${token}) [${this._routeName}]`
    );

    async.waterfall(
      [
        (done) => {
          tokenRepo.search(
            { value: token, dateExpire: { $gt: Date.now() } },
            (error, result) => {
              if (error) {
                logger.error(
                  `${this._classInfo}.resetPassword(${token}) [${this._routeName}]`,
                  error
                );
                response.status(500).send(error);
              } else if (!result) {
                logger.debug(
                  `${this._classInfo}.resetPassword(${token}) [${this._routeName}]`,
                  'Missing/invalid Token'
                );
                response
                  .status(404)
                  .send({ error: { message: 'Token is missing or invalid' } });
              } else {
                logger.debug(
                  `${this._classInfo}.resetPassword(${token}) [${this._routeName}]::search() OK`
                );

                tokenRepo.delete(result._id, () => {
                  request.login(result, (err) => {
                    done(err, result);
                  });
                });
              }
            }
          );
        },
        (token2, done) => {
          userRepo.details(token2.userId, (error, user) => {
            if (error) {
              logger.error(
                `${this._classInfo}.resetPassword(${token2}) [${this._routeName}]::get()`,
                error
              );
              response.status(500).send(error);
            } else if (!user) {
              logger.debug(
                `${this._classInfo}.resetPassword(${token2}) [${this._routeName}]::get() :: MISSING TOKEN USER`
              );
              response
                .status(404)
                .send({ error: { message: 'User is missing or invalid' } });
            } else {
              user.password = password;

              user.save((err, result) => {
                if (err) {
                  response.status(404).send({
                    error: { message: 'Reset Password: Save user failed' }
                  });
                  return done(error);
                }

                return done(null, result);
              });
            }
          });
        },
        (user, done) => {
          const message = this.__createResetEmail(user);

          mandrill.messages.send(
            { message, async: mailchimpAsync },
            (data) => {
              logger.debug(
                `${this._classInfo}.resetPassword() [${this._routeName}] MESSAGE REQUESTED`,
                data
              );
              const emailResult = data[0];

              if (emailResult.status !== 'sent') {
                response.status(500).send(new Error(data.reject_reason));
              }

              return done(null, emailResult);
            },
            (error) => {
              done(error);
            }
          );
        }
      ],
      (error, result) => {
        if (error) {
          logger.error(
            `${this._classInfo}.resetPassword() [${this._routeName}]`,
            error
          );
          return next(error);
        }
        logger.debug(
          `${this._classInfo}.resetPassword() [${this._routeName}/reset-password POST] OK`
        );
        response.json(result);
      }
    );
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
    logger.info(
      `${this._classInfo}.verifyResetPasswordToken(${token}) [${this._routeName}]`
    );

    async.waterfall(
      [
        (done) => {
          tokenRepo.search(
            { value: token, dateExpire: { $gt: Date.now() } },
            (error, result) => {
              if (error) {
                logger.error(
                  `${this._classInfo}.verifyResetPasswordToken(${token}) [${this._routeName}]`,
                  error
                );
                response.status(500).send(error);
              } else if (!result) {
                logger.debug(
                  `${this._classInfo}.verifyResetPasswordToken(${token}) [${this._routeName}]::get() :: MISSING TOKEN`
                );
                response
                  .status(404)
                  .send({ error: { message: 'Token is missing or invalid' } });
                // done(error);
              } else {
                done(error, result);
              }
            }
          );
        },
        (token2, done) => {
          userRepo.get(token2.userId, (error, user) => {
            if (error) {
              logger.error(
                `${this._classInfo}.verifyResetPasswordToken(${token2}) [${this._routeName}]::get()`,
                error
              );
              response.status(500).send(error);
            } else if (!user) {
              logger.debug(
                `${this._classInfo}.verifyResetPasswordToken(${token2}) [${this._routeName}]::get() :: MISSING TOKEN USER`
              );
              response.status(404).send({
                error: { message: 'Token User is missing or invalid' }
              });
            } else {
              done(null, user);
            }
          });
        }
      ],
      (error, result) => {
        if (error) {
          logger.error(
            `${this._classInfo}.verifyResetPasswordToken() [${this._routeName}]/verify`,
            error
          );
          return next(error);
        }
        logger.debug(
          `${this._classInfo}.verifyResetPasswordToken() [${this._routeName}/reset-password/:token GET] OK`
        );
        response.json(result);
      }
    );
  }

  __createResetEmail(user) {
    const emailParams = user.applicationId.settings.emailNotifications.filter(
      (value) => value.name === 'RESET_PASSWORD'
    );

    const htmlContent = emailParams[0].html
      .replace('$$FIRST_NAME$$', user.firstName)
      .replace('$$USERNAME$$', user.username);

    const txtContent = emailParams[0].text
      .replace('$$FIRST_NAME$$', user.firstName)
      .replace('$$USERNAME$$', user.username);

    const message = {
      to: [
        {
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          type: 'to'
        }
      ],
      headers: { 'Reply-To': emailParams[0].replyTo },
      important: false,
      from_email: emailParams[0].fromEmailAddress,
      from_name: emailParams[0].fromName,
      subject: emailParams[0].subject,
      text: txtContent,
      html: htmlContent
    };

    return message;
  }

  __createForgotPasswordEmail(user, token) {
    const emailParams = user.applicationId.settings.emailNotifications.filter(
      (value) => value.name === 'FORGOT_PASSWORD'
    );

    const htmlContent = emailParams[0].html
      .replace('$$FIRST_NAME$$', user.firstName)
      .replace('$$URL$$', token.origin)
      .replace('$$TOKEN_VALUE$$', token.value_);

    const txtContent = emailParams[0].text
      .replace('$$FIRST_NAME$$', user.firstName)
      .replace('$$URL$$', token.origin)
      .replace('$$TOKEN_VALUE$$', token.value_);

    const message = {
      to: [
        {
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          type: 'to'
        }
      ],
      headers: { 'Reply-To': emailParams[0].replyTo },
      important: false,
      from_email: emailParams[0].fromEmailAddress,
      from_name: emailParams[0].fromName,
      subject: emailParams[0].subject,
      text: txtContent,
      html: htmlContent
    };

    return message;
  }
  // End Class
}

module.exports = AuthController;

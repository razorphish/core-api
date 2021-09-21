// Twitter Api
const passport = require('passport');
const async = require('async');
const tokenRepo = require('../../../app/database/repositories/auth/token.repository');
const twitterUserRepo = require('../../../app/database/repositories/account/twitter-user.repository');
const logger = require('../../../lib/winston.logger');
const twitterLibrary = require('../../../lib/twitter.library').twitter;
const config = require('../../../lib/config.loader').twitter;
const signer = require('../../../app/security/signers/http-sign');

/**
 * Twitter Api Controller
 * http://.../api/twitter
 * @example To Test twitter authentication follow steps
 * @step1 Login
 * @step2 Get accessToken and make call to twitter->request_token api
 * @step3 Go to table tokens and grab requestToken.value from database
 * @step4 Open up browswer and past value to this url https://api.twitter.com/oauth/authorize?oauth_token={access_token}
 * @step5 Twitter attempts redirect but just copy oauth_token={value}&oauth_verifier={value} params
 * @step6 Consume 'callback' call
 */
class TwitterController {
  /**
   * Constructor for Twitter
   * @param {router} router Node router framework
   */
  constructor(router) {
    router.post(
      '/request_token',
      // passport.authenticate('user-bearer', { session: false }),
      // utils.isInRole('admin'),
      this.requestToken.bind(this)
    );

    router.get(
      '/access_token',
      passport.authenticate('user-bearer', { session: false }),
      // utils.isInRole('admin'),
      this.accessToken.bind(this)
    );

    router.get(
      '/callBack',
      // passport.authenticate('user-bearer', { session: false }),
      // utils.isInRole('admin'),
      this.callBack.bind(this)
    );

    router.get(
      '/verify_credentials',
      // passport.authenticate('user-bearer', { session: false }),
      // utils.isInRole('admin'),
      this.verifyCredentials.bind(this)
    );

    // Logging Info
    this._classInfo = '*** [twitter].controller';
    this._routeName = '/api/twitter';
  }

  accessToken(request, response) {
    logger.info(`${this._classInfo}.all() [${this._routeName}]`);

    const twitter = new Twitter(config);
    twitter.getOAuthAccessToken((data) => {
      response.json(data);
    });
  }

  verifyCredentials(request, response, done) {
    logger.info(`${this._classInfo}.callBack() [${this._routeName}]`);

    // twitter.postCustomApiCall((twitterRequestToken) => {
    //     if (!twitterRequestToken) {
    //         logger.error(`${this._classInfo}.request_token():1:getOAuthRequestToken [${this._routeName}]`, error);
    //         response.status(500).send("Could not fulfill this request.");
    //     } else {
    //         logger.debug(`${this._classInfo}.request_token():1:getOAuthRequestToken [${this._routeName}] OK`);
    //         return done(null, twitterRequestToken);
    //     }
    // })
  }

  /**
   * @description This is called when Twitter redirects back from its own user verification
   * @author Antonio Marasco
   * @date 2019-06-29
   * @param {*} request
   * @param {*} response
   * @param {function} next
   * @example GET /api/twitter/callBack
   * @returns {pointer} res.json that contains a subset of twitter user info
   * @memberof TwitterController
   */
  callBack(request, response, next) {
    logger.info(`${this._classInfo}.callBack() [${this._routeName}]`);

    const { oauth_token } = request.query;
    const { oauth_verifier } = request.query;

    async.waterfall(
      [
        // 1.  Check if {twitter} request token exists
        (done) => {
          tokenRepo.byToken(oauth_token, (error, __oauth_token) => {
            if (error) {
              logger.error(
                `${this._classInfo}.callBack():1:byToken [${this._routeName}]`,
                error
              );
              response.status(500).send(error);
            } else {
              if (__oauth_token) {
                logger.debug(
                  `${this._classInfo}.callBack():1:byToken [${this._routeName}] OK`
                );
                return done(null, __oauth_token);
              }
              logger.error(
                `${this._classInfo}.callBack():1:byToken [${this._routeName}]`
              );
              response.status(404).send('Request Token Not Found');
            }
          });
        },
        // 2. Insert request token into db with verifier from Twitter
        (requestToken, done) => {
          requestToken.verifier = oauth_verifier;
          tokenRepo.update(requestToken._id, requestToken, (error, result) => {
            if (error) {
              logger.error(
                `${this._classInfo}.callBack():2:update [${this._routeName}]`,
                error
              );
              response.status(500).send(error);
            } else {
              if (result) {
                logger.debug(
                  `${this._classInfo}.callBack():2:update [${this._routeName}] OK`
                );
                // return done(null, { status: 'OK', code: 200 });
                return done(null, result);
              }
              logger.error(
                `${this._classInfo}.callBack():2:update [${this._routeName}]`
              );
              response.status(404).send('Request Token Not Updated');
            }
          });
        },
        // 3. Get an access token from request token at Twitter
        (requestToken, done) => {
          const __requestToken = {
            consumer_key: config.consumerKey,
            token: requestToken.value,
            verifier: requestToken.verifier,
            token_secret: requestToken.valueSecret
          };

          twitterLibrary.getOAuthAccessToken(__requestToken, (accessToken) => {
            if (!accessToken) {
              logger.error(
                `${this._classInfo}.callBack():3:getOAuthAccessToken [${this._routeName}]`
              );
              response
                .status(500)
                .send({ message: 'Unable to get oAuthAccesstoken' });
            } else {
              logger.debug(
                `${this._classInfo}.callBack():3:getOAuthAccessToken [${this._routeName}] OK`
              );
              __requestToken.userId = requestToken.userId;
              __requestToken.loginProvider = requestToken.loginProvider;
              return done(null, __requestToken, accessToken);
            }
          });
        },
        // 4. Insert accessToken into db
        (requestToken, accessToken, done) => {
          accessToken.loginProvider = requestToken.loginProvider;
          accessToken.userId = requestToken.userId;
          accessToken.value = accessToken.access_token;
          accessToken.valueSecret = accessToken.access_token_secret;
          accessToken.name = config.tokenAccessName;
          accessToken.type = 'bearer';
          accessToken.scope = '*';
          accessToken.protocol = 'https';
          accessToken.origin = request.headers.origin;

          tokenRepo.insert(accessToken, (error, result) => {
            if (error) {
              logger.error(
                `${this._classInfo}.callBack():4:insert [${this._routeName}]`,
                error
              );
              response.status(500).send(error);
            } else {
              if (result) {
                logger.debug(
                  `${this._classInfo}.request_token():4:insert [${this._routeName}] OK`
                );
                return done(null, result);
              }
              logger.error(
                `${this._classInfo}.request_token():4:insert [${this._routeName}]`
              );
              response.status(500).send('Access Token Not Created');
            }
          });
        },
        // 5.  Verify user credentials from Twittier
        (accessToken, done) => {
          const params = {
            include_entities: false,
            skip_status: true,
            include_email: false
          };

          twitterLibrary.verifyCredentials(
            params,
            (error, response, body) => {
              logger.error(
                `${this._classInfo}.callBack():3:verifyCredentials [${this._routeName}]`,
                error
              );
              response.status(500).send(error);
            },
            (body, limits) => {
              if (!body) {
                const error = 'Unable to verify users credentials';
                logger.error(
                  `${this._classInfo}.callBack():3:verifyCredentials [${this._routeName}]`,
                  error
                );
                response.status(500).send(error);
              } else {
                logger.debug(
                  `${this._classInfo}.callBack():3:verifyCredentials [${this._routeName}] OK`
                );
                return done(null, accessToken, body);
              }
            }
          );
        },
        // 6. Save credentials to db and complete tasks
        (accessToken, userCredentials, done) => {
          const credentials = JSON.parse(userCredentials);

          const twitterUser = {
            userId: accessToken.userId,
            twitterId: credentials.id,
            tokenId: accessToken._id,
            name: credentials.name,
            screenName: credentials.screen_name,
            location: credentials.location,
            description: credentials.description,
            url: credentials.url,
            payload: JSON.stringify(userCredentials)
          };

          twitterUserRepo.insert(twitterUser, (error, result) => {
            if (error) {
              logger.error(
                `${this._classInfo}.callBack():4:insertTwitterUser [${this._routeName}]`,
                error
              );
              response.status(500).send(error);
            } else {
              if (result) {
                logger.debug(
                  `${this._classInfo}.request_token():4:insertTwitterUser [${this._routeName}] OK`
                );
                // Do not return token or twitter user objects
                return done(null, {
                  status: 'OK',
                  code: 200
                });
              }
              logger.error(
                `${this._classInfo}.request_token():4:insertTwitterUser [${this._routeName}]`,
                error
              );
              response.status(500).send('Twitter User Not Created');
            }
          });
        }
      ],
      (error, result) => {
        if (error) {
          logger.error(
            `${this._classInfo}.request_token() [${this._routeName}]`,
            error
          );
          return next(error);
        }
        logger.debug(
          `${this._classInfo}.request_token() [${this._routeName}] OK`
        );
        response.json(result);
      }
    );
  }

  /**
   * @description Step 1 for Authentication
   * @author Antonio Marasco
   * @date 2019-06-28
   * @param {*} request Request
   * @param {*} response Reponse
   * @param {function} next
   * @example GET /api/twitter/request_token
   * @returns {pointer} res.json
   * @memberof TwitterController
   */
  requestToken(request, response, next) {
    logger.info(`${this._classInfo}.request_token() [${this._routeName}]`);

    async.waterfall(
      [
        // 1 (of 3). Get a request token from twitter
        (done) => {
          twitterLibrary.getOAuthRequestToken((twitterRequestToken) => {
            if (!twitterRequestToken) {
              logger.error(
                `${this._classInfo}.request_token():1:getOAuthRequestToken [${this._routeName}]`
              );
              response
                .status(500)
                .send({ message: 'Could not fulfill this request.' });
            } else {
              logger.debug(
                `${this._classInfo}.request_token():1:getOAuthRequestToken [${this._routeName}] OK`
              );
              return done(null, twitterRequestToken);
            }
          });
        },
        // 2 (of 3). Find auth token of user in database to get userId
        (twitterRequestToken, done) => {
          const accessToken = signer.decode(
            request.headers.authorization.substring('bearer '.length).trim()
          );

          tokenRepo.byToken(accessToken, (error, accessToken) => {
            if (error) {
              logger.error(
                `${this._classInfo}.request_token():2:byToken [${this._routeName}]`,
                error
              );
              response.status(500).send(error);
            } else {
              if (accessToken) {
                logger.debug(
                  `${this._classInfo}.request_token():2:byToken [${this._routeName}] OK`
                );
                return done(null, accessToken, twitterRequestToken);
              }
              logger.error(
                `${this._classInfo}.request_token():2:byToken [${this._routeName}]`,
                error
              );
              response.status(404).send('User Access Token Not Found');
            }
          });
        },
        // 3 (of 3).  Insert twitter request token into db
        (accessToken, twitterRequestToken, done) => {
          const requestToken = {
            name: config.tokenRequestName,
            value: twitterRequestToken.token,
            valueSecret: twitterRequestToken.token_secret,
            loginProvider: config.provider,
            type: 'bearer',
            scope: '*',
            protocol: 'https',
            origin: request.headers.origin,
            userId: accessToken.userId,
            confirmed: twitterRequestToken.oauth_callback_confirmed || false
          };

          tokenRepo.insert(requestToken, (error, result) => {
            if (error) {
              logger.error(
                `${this._classInfo}.request_token()::insert [${this._routeName}]`,
                error
              );
              response.status(500).send(error);
            } else {
              if (result) {
                logger.debug(
                  `${this._classInfo}.request_token()::insert [${this._routeName}] OK`
                );
                // Do not return token
                return done(null, {
                  status: 'OK',
                  code: 200,
                  confirmed: requestToken.confirmed
                });
              }
              logger.error(
                `${this._classInfo}.request_token()::insert [${this._routeName}]`
              );
              response.status(500).send('Request Token Not Created');
            }
          });
        }
      ],
      (error, result) => {
        if (error) {
          logger.error(
            `${this._classInfo}.request_token() [${this._routeName}]`,
            error
          );
          return next(error);
        }
        // For Debugging go to next step
        // https://api.twitter.com/oauth/authorize?oauth_token=DhewNgAAAAAA_MiyAAABbC8gc2I
        // Use newly created oauth token from step 2 above
        logger.debug(
          `${this._classInfo}.request_token() [${this._routeName}] OK`
        );
        response.json(result);
      }
    );
  }
}

module.exports = TwitterController;

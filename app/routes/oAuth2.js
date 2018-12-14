'use strict';

const oauth2orize = require('oauth2orize'),
    passport = require('passport'),
    userRepo = require('../../app/database/repositories/account/user.repository'),
    tokenRepo = require('../../app/database/repositories/auth/token.repository'),
    clientRepo = require('../../app/database/repositories/auth/client.repository'),
    crypto = require('crypto'),
    logger = require('../../lib/winston.logger'),
    utils = require('../../lib/utils');

// Create OAuth 2.0 server
const server = oauth2orize.createServer();

// Register serialialization and deserialization functions.
//
// When a client redirects a user to user authorization endpoint, an
// authorization transaction is initiated. To complete the transaction, the
// user must authenticate and approve the authorization request. Because this
// may involve multiple HTTP request/useronse exchanges, the transaction is
// stored in the session.
//
// An application must supply serialization functions, which determine how the
// client object is serialized into the session. Typically this will be a
// simple matter of serializing the client's ID, and deserializing by finding
// the client by ID from the database.

server.serializeClient((client, done) => done(null, client.id));

server.deserializeClient((clientId, done) => {
    clientRepo.byClientId(clientId, (error, client) => {
        if (error) {
            return done(error);
        }
        return done(null, client);
    });
});

// Exchange the client id and password/secret for an access token. The callback accepts the
// `client`, which is exchanging the client's id and password/secret from the
// authorization request for verification. If these values are validated, the
// application issues an access token on behalf of the client who authorized the code.

server.exchange(
    oauth2orize.exchange.clientCredentials((client, scope, done) => {
        // Validate the client
        clientRepo.byClientId(client.clientId, (error, localClient) => {
            if (error) {
                return done(error);
            }
            if (!localClient) {
                return done(null, false);
            }

            var accessTokenHash = crypto
                .createHash('sha1')
                .update(client.clientSecret)
                .digest('hex');
            if (localClient.clientSecret !== accessTokenHash) {
                return done(null, false);
            }
            // Everything validated, return the token
            const token = utils.getUid(256);
            // Pass in a null for user id since there is no user with this grant type
            db.accessTokens.save(token, null, client.clientId, (error) => {
                if (error) {
                    return done(error);
                }
                return done(null, token, { test: 'test' });
            });
        });
    })
);

// Exchange user id and password for access tokens. The callback accepts the
// `client`, which is exchanging the user's name and password from the
// authorization request for verification. If these values are validated, the
// application issues an access token on behalf of the user who authorized the code.

server.exchange(
    oauth2orize.exchange.password((client, username, password, scope, done) => {
        logger.info('*** userRepo.authenticate [Exchange:Password]');

        if (!username) {
            throw new Error('User required');
        }

        userRepo.authenticate(username, password, (err, user, reason) => {
            if (err) {
                logger.error(
                    `*** userRepo.authenticate [auth] user:${user}, reason:${reason}`,
                    err
                );
                return done(err);
            } else {
                if (user) {
                    logger.verbose('*** userRepo.authenticate [auth] user', user);
                    logger.debug('*** userRepo.authenticate [auth] ok', reason);

                    // Everything validated, return the token
                    const token = utils.getUid(256);
                    const refreshToken = utils.getUid(256);

                    var tokenHash = crypto
                        .createHash('sha1')
                        .update(token)
                        .digest('hex');
                    var refreshTokenHash = crypto
                        .createHash('sha1')
                        .update(refreshToken)
                        .digest('hex');

                    //Convert minutes to seconds
                    var expiresIn = client.tokenLifeTime * 60;
                    var expirationDate = new Date(
                        new Date().getTime() + expiresIn * 1000
                    ).toUTCString();

                    var accessToken = {
                        value: tokenHash,
                        userId: user.id,
                        type: 'bearer',
                        name: 'access_token',
                        loginProvider: 'oAuth2',
                        scope: scope || '*',
                        dateExpire: expirationDate,
                        expiresIn: expiresIn
                    };

                    var refreshExpiresIn = client.refreshTokenLifeTime * 60;
                    var refreshExpirationDate = new Date(
                        new Date().getTime() + refreshExpiresIn * 1000
                    ).toUTCString();

                    var refresh_token = Object.assign({}, accessToken, {
                        value: refreshTokenHash,
                        name: 'refresh_token',
                        expiresIn: refreshExpiresIn,
                        dateExpire: refreshExpirationDate
                    });

                    tokenRepo.insert(accessToken, (error) => {
                        if (error) {
                            return done(error);
                        }

                        //Save client refresh token
                        userRepo.updateToken(user.id, refresh_token, (err, resp) => {
                            //Let's do nothing as user will just NOT
                            //have a refresh token for the time being
                        });

                        return done(
                            null,
                            token,
                            refreshToken,
                            mergeParam(user, expirationDate, expiresIn)
                        );
                    });
                } else {
                    logger.debug('*** userRepo.authenticate [Auth] DENIED', reason);
                    return done(null, false);
                }
            }
        });
    })
);

/*
 * `accessToken` is the access token that will be sent to the client.  An
 * optional `refreshToken` will be sent to the client, if the server chooses to
 * implement support for this functionality.  Any additional `params` will be
 * included in the useronse.  If an error occurs, `done` should be invoked with
 * `err` set in idomatic Node.js fashion.
 * */
server.exchange(
    oauth2orize.exchange.refreshToken(function (
        client,
        refreshToken,
        scope,
        done
    ) {
        var that = this;
        logger.info('*** token [Exchange:Refresh Token]');

        if (!refreshToken) {
            throw new Error('Refresh token required');
        }

        // Validate the token
        var refreshTokenHash = crypto
            .createHash('sha1')
            .update(refreshToken)
            .digest('hex');

        // Client Validated, now lets check User
        userRepo.byRefreshToken(refreshTokenHash, (err, user) => {
            if (err) {
                return done(err);
            }

            //Make sure user was returned, if not refresh token invalid
            //or has been revoked.  Either way, access will be denied
            //user will be forced to login again
            if (!user) {
                logger.debug('*** token [Exchange:Refresh Token] REVOKED');
                return done(null, false);
            }

            //Check for refresh token expiration
            if (new Date() > user.refreshToken.dateExpire) {
                logger.debug('*** token [Exchange:Refresh Token] EXPIRED');
                //Force user to login
                return done(null, false);
            }

            //NOW everything checks out
            //lets issue new access token, and for good measure a new refresh
            logger.debug('*** token [Exchange:Refresh Token] OK');

            // Everything validated, return the token
            const token = utils.getUid(256);
            //const refreshToken = utils.getUid(256);

            var tokenHash = crypto
                .createHash('sha1')
                .update(token)
                .digest('hex');
            // var refreshTokenHash = crypto
            //   .createHash('sha1')
            //   .update(refreshToken)
            //   .digest('hex');

            var expiresIn = client.tokenLifeTime * 60;
            var expirationDate = new Date(
                new Date().getTime() + expiresIn * 1000
            ).toUTCString();

            var accessToken = {
                value: tokenHash,
                userId: user.id,
                type: 'bearer',
                name: 'access_token',
                loginProvider: 'oAuth2',
                scope: scope || '*',
                dateExpire: expirationDate,
                expiresIn: expiresIn
            };

            // var refreshExpiresIn = client.refreshTokenLifeTime * 60;
            // var refreshExpiriationDate = new Date(
            //     new Date().getTime() + (refreshExpiresIn * 1000)
            //   ).toUTCString();

            // var refresh_token = Object.assign({}, accessToken, {
            //   value: refreshTokenHash,
            //   name: 'refresh_token',
            //   expiresIn: refreshExpiresIn,
            //   dateExpire: refreshExpiriationDate
            // });

            tokenRepo.insert(accessToken, (error) => {
                if (error) {
                    return done(error);
                }

                //Save client refresh token
                // userRepo.updateToken(user.id, refresh_token, (err, resp) => {
                //   //Let's do nothing as user will just NOT
                //   //have a refresh token for the time being
                // });

                return done(
                    null,
                    token,
                    refreshToken,
                    mergeParam(user, expirationDate, expiresIn)
                );
            });
        });
    })
);

function mergeParam(user, expires, expiresIn) {
    var u = {
        '.issued': new Date().toUTCString(),
        '.expires': expires,
        expires_in: expiresIn,
        user: {
            _id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            homePhone: user.homePhone,
            avatar: user.avatar,
            roles: user.roles || [],
            calendars: user.calendars || [],
            addresses: user.addresses || [],
            businessHours: user.businessHours || [],
            salonServices: user.salonServices || [],
            twitter: user.twitter,
            facebook: user.facebook,
            instagram: user.instagram,
            devices: user.devices || []
        }
    };

    return u;
}

// Token endpoint.
//
// `token` middleware handles client requests to exchange authorization grants
// for access tokens. Based on the grant type being exchanged, the above
// exchange middleware will be invoked to handle the request. Clients must
// authenticate when making requests to this endpoint.

exports.token = [
    passport.authenticate(['basic', 'oauth2-client-password'], {
        session: false
    }),
    server.token(),
    server.errorHandler()
];

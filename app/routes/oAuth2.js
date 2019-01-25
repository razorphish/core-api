'use strict';

const oauth2orize = require('oauth2orize'),
    jwtBearer = require('oauth2orize-jwt-bearer').Exchange,
    passport = require('passport'),
    userRepo = require('../../app/database/repositories/account/user.repository'),
    tokenRepo = require('../../app/database/repositories/auth/token.repository'),
    clientRepo = require('../../app/database/repositories/auth/client.repository'),
    crypto = require('crypto'),
    logger = require('../../lib/winston.logger'),
    httpSign = require('../security/signers/http-sign'),
    jwt_sign = require('../security/signers/jwt-sign');

const oAuthProvider = 'oAuth2'

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

            var accessTokenHash = httpSign.decode(client.clientSecret);

            if (localClient.clientSecret !== accessTokenHash) {
                return done(null, false);
            }
            // Everything validated, return the token
            const token = httpSign.getUid(256);

            // Pass in a null for user id since there is no user with this grant type
            tokenRepo.insert(token, (error) => {
                if (error) {
                    return done(error);
                }

                return done(
                    null,
                    token, { test: 'test' }
                );
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

        userRepo.authenticate(username, password, client.requestBody.socialUser || null, (err, user, reason) => {
            if (err) {
                logger.error(
                    `*** userRepo.authenticate [auth] user:${user}, reason:${reason}`,
                    err
                );
                return done(err, false);
            } else {
                if (user) {
                    logger.verbose('*** userRepo.authenticate [auth] user', user);
                    logger.debug('*** userRepo.authenticate [auth] ok', reason);

                    // Everything validated, return the token
                    const token = httpSign.token(
                        user.id, 'access_token', client.tokenLifeTime, scope, null, null, null,
                        client.requestBody.forceRefresh, client.origin);
                    const refreshToken = httpSign.token(
                        user.id, 'refresh_token', client.refreshTokenLifeTime, scope, null, null, null,
                        client.requestBody.forceRefresh, client.origin);


                    tokenRepo.insert(token, (error) => {
                        if (error) {
                            return done(error);
                        }

                        //AM BUG
                        //Save client refresh token
                        userRepo.updateToken(user.id, refreshToken, (err, resp) => {
                            //Let's do nothing as user will just NOT
                            //have a refresh token for the time being
                        });
                        user.refreshToken = refreshToken.value_;

                        return done(
                            null,
                            token.value_,
                            refreshToken.value_,
                            mergeParam(user, refreshToken.value_, token.dateExpire, token.expiresIn, oAuthProvider)
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

server.exchange('urn:ietf:params:oauth:grant-type:jwt-bearer',
    jwtBearer(function (client, data, signature, done) {

        //load file system so you can grab the public key to read.
        var fs = require('fs');
        var path = require('path');
        var publicKey = path.resolve(process.cwd() + '/app/security/verifiers/public.pem');
        var privateKey = path.resolve(process.cwd() + '/app/security/verifiers/private.pem');

        //load PEM format public key as string, should be clients public key
        var pub = fs.readFileSync(publicKey).toString();

        var verifier = crypto.createVerify("RSA-SHA256");

        //logger.info('*** token [Exchange:JWT Client]', client);
        //logger.info('*** token [Exchange:JWT Data]', data);
        //logger.info('*** token [Exchange:JWT Signature]', signature)
        //logger.info('*** token [Exchange:JWT Pub]', pub)

        //verifier.update takes in a string of the data that is encrypted in the signature  
        //verifier.update(JSON.stringify(data));

        verifier.update(data);

        if (verifier.verify(pub, signature, 'base64')) {
            //base64url decode data 
            var b64string = data;
            var buf = new Buffer.from(b64string, 'base64').toString('ascii');
            console.log(buf.split('}{')[1])

            var Options = {
                issuer: 'www.maras.co',
                subject: 'auth_token',
                audience: client._id.toString() // this should be provided by client
            }

            //var token = jwt_sign.sign({ 'token_type': 'jwt', 'expires_in': 3600, 'mouse': 'dead' }, Options);
            var token = jwt_sign.token(client._id.toString(), 'jwt_bearer_token', '30', '*', 'bearer', 'oAuth2', 'jwt', Options)
            var refreshToken = jwt_sign.token(client._id.toString(), 'jwt_bearer_refresh_token', '30', '*', 'bearer', 'oAuth2', 'jwt', Options)
            var expiresIn = client.tokenLifeTime * 60;
            var expirationDate = new Date(
                new Date().getTime() + expiresIn * 1000
            ).toUTCString();

            done(null, token, mergeJWTParam(refreshToken, expirationDate, expiresIn, 'jwt'))
            // AccessToken.create(client, scope, function (err, accessToken) {
            //     if (err) { return done(err); }
            //     done(null, accessToken);
            // });
        } else {
            console.log('FAIL BIGLY')
        }
    }));
/*
 * `refresh_token` is the access token that will be sent to the client.  if the server chooses to
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

        logger.info('*** token [Exchange:Refresh Token]');

        if (!refreshToken) {
            throw new Error('Refresh token required');
        }

        // Validate the token
        var refreshTokenHash = httpSign.decode(refreshToken);

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
                logger.debug('*** token [Exchange:Refresh Token] NOT EXPIRED');
                //Force user to login
                return done(null, false);
            }

            //User has implied that they have opted out of refreshtoken (Stay signed in)
            if (!user.refreshToken.forceRefresh) {
                logger.debug('*** token [Exchange:Refresh Token] USER DOES NOT REQUIRE REFRESH');
                //Force user to login
                return done(null, false);
            }

            //NOW everything checks out
            //lets issue new access token, and for good measure a new refresh
            logger.debug('*** token [Exchange:Refresh Token] OK');

            // Everything validated, return the token
            //const newAccessToken = httpSign.token(user.id, 'access_token', client.tokenLifeTime, scope);

            const newAccessToken = httpSign.token(
                user.id, 'access_token', client.tokenLifeTime, scope, null, null, null,
                true, user.refreshToken.origin);

            tokenRepo.insert(newAccessToken, (error) => {
                if (error) {
                    return done(error);
                }

                return done(
                    null,
                    newAccessToken.value_,
                    refreshToken,
                    mergeParam(user, refreshToken, newAccessToken.dateExpire, newAccessToken.expiresIn, oAuthProvider)
                );
            });
        });
    })
);

function mergeParam(user, refreshToken, expires, expiresIn, signInProvider) {
    let issuedAtTime = new Date().toUTCString();
    var u = {
        '.issued': issuedAtTime,
        '.expires': expires,
        expires_in: expiresIn,
        expirationTime: expires,
        issuedAtTime: issuedAtTime,
        signInProvider: signInProvider,
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
            twitter: user.twitter,
            facebook: user.facebook,
            instagram: user.instagram,
            devices: user.devices || [],
            refreshToken: refreshToken
        }
    };

    if (user.status === 'awaitingPassword') {
        u.user.status = user.status;
    }
    return u;
}

function mergeJWTParam(refreshToken, expires, expiresIn, signInProvider) {
    let issuedAtTime = new Date().toUTCString();
    var u = {
        '.issued': issuedAtTime,
        '.expires': expires,
        expires_in: expiresIn,
        expirationTime: expires,
        issuedAtTime: issuedAtTime,
        signInProvider: signInProvider,
        user: {
            refreshToken: refreshToken
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

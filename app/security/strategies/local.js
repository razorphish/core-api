'use strict';

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const BearerStrategy = require('passport-http-bearer').Strategy;
const BasicStrategy = require('passport-http').BasicStrategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const userRepo = require('../../database/repositories/account/user.repository');
const tokenRepo = require('../../database/repositories/auth/token.repository');
const clientRepo = require('../../database/repositories/auth/client.repository');
const util = require('util');
const utils = require('../../../lib/utils');
const logger = require('../../../lib/winston.logger');

var JWTopts = {}
JWTopts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
JWTopts.secretOrKey = 'secret';
JWTopts.issuer = 'api.maras.co';
JWTopts.audience = 'maras.co';

/**
 * LocalStrategy
 *
 * This strategy is used to authenticate users based on a username and password.
 * Anytime a request is made to authorize an application, we must ensure that
 * a user is logged in before asking them to approve the request.
 */
passport.use(
  new LocalStrategy((username, password, done) => {
    userRepo.passwordMatch(username, password, (error, user) => {
      if (error) {
        return done(error);
      }

      if (!user) {
        return done(null, false);
      }

      return done(null, user);
    });
  })
);

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser((id, done) => {
  userRepo.users.finuserRepoyId(id, (error, user) => done(error, user));
});

/**
 * BasicStrategy & ClientPasswordStrategy
 *
 * These strategies are used to authenticate registered OAuth clients. They are
 * employed to protect the `token` endpoint, which consumers use to obtain
 * access tokens. The OAuth 2.0 specification suggests that clients use the
 * HTTP Basic scheme to authenticate. Use of the client password strategy
 * allows clients to send the same credentials in the request body (as opposed
 * to the `Authorization` header). While this approach is not recommended by
 * the specification, in practice it is quite common.
 */
function verifyClient(req, clientId, clientSecret, done) {
  logger.debug('*** verify [Client]');

  if (!clientId || !clientSecret) {
    throw new Error('Client required');
  }

  var origin = req.headers.origin;

  clientRepo.verify(clientId, clientSecret, origin, (err, client, reason) => {
    if (err) {
      logger.error('*** clientRepo.verify [Client] error: ', util.inspect(err));
      return done(err);
    }

    if (client) {
      logger.debug('*** verify [Client] ok');
      client.requestBody = req.body;
      return done(null, client);
    } else {
      logger.debug('*** verify [Client] denied');
      return done(null, false, reason);
    }
  });
}

passport.use(new BasicStrategy({ passReqToCallback: true }, verifyClient));

passport.use(
  new ClientPasswordStrategy({ passReqToCallback: true }, verifyClient)
);

passport.use(new JwtStrategy(JWTopts, function (jwt_payload, done) {
  tokenRepo.byToken({ id: jwt_payload.sub }, function (err, user) {
    if (err) {
      return done(err, false);
    }
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
      // or you could create a new account
    }
  });
}));

passport.use(new FacebookStrategy({
  clientID: 'FACEBOOK_APP_ID',
  clientSecret: 'FACEBOOK_APP_SECRET',
  callbackURL: "http://localhost:3000/auth/facebook/callback"
},
  function (accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ facebookId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));
/**
 * BearerStrategy
 *
 * (aka a bearer token). If a user, they must have previously authorized a client
 * application, which is issued an access token to make requests on behalf of
 * the authorizing user.
 */
passport.use(
  'user-bearer',
  new BearerStrategy(function (accessToken, done) {

    var accessTokenHash = utils.decodeHttpToken(accessToken);

    tokenRepo.byToken(accessTokenHash, (error, token) => {
      if (error) {
        return done(error);
      }

      if (!token) {
        return done(null, false);
      }

      if (new Date() > token.dateExpire) {
        tokenRepo.delete(token._id, function (err, token) {
          done(err);
        });
      } else {
        if (token.userId) {
          userRepo.get(token.userId, (error, user) => {
            if (error) {
              return done(error);
            }

            if (!user) {
              return done(null, false);
            }

            // To keep this example simple, restricted scopes are not implemented,
            // and this is just for illustrative purposes.
            done(null, user, { scope: '*' });
          });
        } else {
          // The request came from a client only since userId is null,
          // therefore the client is passed back instead of a user.
          clientRepo.byClientId(token.clientId, (error, client) => {
            if (error) {
              return done(error);
            }
            if (!client) {
              return done(null, false);
            }
            // To keep this example simple, restricted scopes are not implemented,
            // and this is just for illustrative purposes.
            done(null, client, { scope: '*' });
          });
        }
      }
    });
  })
);

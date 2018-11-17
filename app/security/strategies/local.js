'use strict';

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const BearerStrategy = require('passport-http-bearer').Strategy;
const BasicStrategy = require('passport-http').BasicStrategy;
const ClientPasswordStrategy = require('passport-oauth2-client-password')
  .Strategy;
const userRepo = require('../../database/repositories/account/user.repository');
const tokenRepo = require('../../database/repositories/auth/token.repository');
const clientRepo = require('../../database/repositories/auth/client.repository');
const crypto = require('crypto');
const util = require('util');

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
  console.log('*** verify [Client]');

  if (!clientId || !clientSecret) {
    throw new Error('Client required');
  }

  var origin = req.headers.origin;

  clientRepo.verify(clientId, clientSecret, origin, (err, client) => {
    if (err) {
      console.log('*** clientRepo.verify [Client] error: ' + util.inspect(err));
      return done(err);
    }

    if (client) {
      console.log('*** verify [Client] ok');
      return done(null, client);
    } else {
      console.log('*** verify [Client] denied');
      return done(null, false);
    }
  });
}

passport.use(new BasicStrategy({ passReqToCallback: true }, verifyClient));

passport.use(
  new ClientPasswordStrategy({ passReqToCallback: true }, verifyClient)
);

/**
 * BearerStrategy
 *
 * (aka a bearer token). If a user, they must have previously authorized a client
 * application, which is issued an access token to make requests on behalf of
 * the authorizing user.
 */
passport.use(
  'user-bearer',
  new BearerStrategy(function(accessToken, done) {

    var accessTokenHash = crypto
      .createHash('sha1')
      .update(accessToken)
      .digest('hex');

    tokenRepo.getByToken(accessTokenHash, (error, token) => {
      if (error) {
        return done(error);
      }

      if (!token) {
        return done(null, false);
      }

      if (new Date() > token.dateExpire) {
        tokenRepo.delete(token._id, function(err, token) {
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
          userRepo.getByClientId(token.clientId, (error, client) => {
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

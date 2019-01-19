'use strict';
const crypto = require('crypto');


module.exports.decodeHttpToken =
  function (token) {
    var accessTokenHash = crypto
      .createHash('sha1')
      .update(token)
      .digest('hex');

    return accessTokenHash;
  }

module.exports.createHttpToken =
  function (userId, name, tokenLifeTime, scope, type, provider, protocol) {
    const token = this.getUid(256);

    var tokenHash = this.decodeHttpToken(token);

    //Convert minutes to seconds
    var expiresIn = tokenLifeTime * 60;
    var expirationDate = new Date(
      new Date().getTime() + expiresIn * 1000
    ).toUTCString();

    var accessToken = {
      value: tokenHash,
      value_: token,
      userId: userId,
      type: type || 'bearer',
      name: name,
      loginProvider: provider || 'oAuth2',
      scope: scope || '*',
      dateExpire: expirationDate,
      expiresIn: expiresIn,
      protocol: protocol || 'http'
    };

    return accessToken;
  }


module.exports.getUid = function (length) {
  let uid = '';
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charsLength = chars.length;

  for (let i = 0; i < length; ++i) {
    uid += chars[getRandomInt(0, charsLength - 1)];
  }

  return uid;
};

module.exports.isObject = function (a) {
  return !!a && a.constructor === Object;
};

module.exports.isInRole = function (roles) {
  return function (req, res, next) {
    var group;
    var isInRole = false;

    if (!roles) {
      next();
    }

    if (!Array.isArray(roles)) {
      group = [roles];
    } else {
      group = roles;
    }

    for (var i = 0; i < group.length; i++) {
      var result = req.user.roles.filter(function (obj) {
        return obj.normalizedName === group[i].toUpperCase();
      });

      if (result.length > 0) {
        isInRole = true;
      }
    }

    if (isInRole) {
      next();
    } else {
      res.send(401, 'Unauthorized');
    }
  };
};

/**
 * Return a random int, used by `utils.getUid()`.
 *
 * @param {Number} min
 * @param {Number} max
 * @return {Number}
 * @api private
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

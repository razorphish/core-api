'use strict';

/**
 * Return a unique identifier with the given `len`.
 *
 * @param {Number} length
 * @return {String}
 * @api private
 */
module.exports.getUid = function(length) {
  let uid = '';
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charsLength = chars.length;

  for (let i = 0; i < length; ++i) {
    uid += chars[getRandomInt(0, charsLength - 1)];
  }

  return uid;
};

module.exports.isObject = function(a) {
  return !!a && a.constructor === Object;
};

module.exports.isInRole = function(roles) {
  return function(req, res, next) {
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
      var result = req.user.roles.filter(function(obj) {
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

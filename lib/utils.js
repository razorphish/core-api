'use strict';

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
      res.status(401).send({error: {
        code: 401,
        errmsg: 'User does not have access to this feature.'
      }});
    }
  };
};

module.exports.isObject = function isObject(a) {
  return !!a && a.constructor === Object;
};

module.exports.isInRole = function (roles) {
  return function (req, res, next) {
    let group;
    let isInRole = false;

    if (!roles) {
      next();
    }

    if (!Array.isArray(roles)) {
      group = [roles];
    } else {
      group = roles;
    }

    group.forEach((item) => {
      const result = req.user.roles.filter(
        (obj) => obj.normalizedName === item.toUpperCase()
      );

      if (result.length > 0) {
        isInRole = true;
      }
    });

    if (isInRole) {
      next();
    } else {
      res.status(401).send({
        error: {
          code: 401,
          errmsg: 'User does not have access to this feature.'
        }
      });
    }
  };
};

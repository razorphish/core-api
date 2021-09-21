const crypto = require('crypto');

module.exports = {
  // eslint-disable-next-line no-unused-vars
  code: (client, redirectUri, user, ares) => {
    const accessToken = {
      state: ''
    };

    return module.exports.sign(accessToken);
  },
  decode: (token) => {
    const accessTokenHash = crypto.createHash('sha1').update(token).digest('hex');

    return accessTokenHash;
  },
  getRandomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
  getUid: (length) => {
    let uid = '';
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charsLength = chars.length;

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < length; ++i) {
      uid += chars[module.exports.getRandomInt(0, charsLength - 1)];
    }

    return uid;
  },
  sign: (payload, $Option) => {
    /*
        $Option = {
            tokenLength: 256,
        }
        */
    const option = $Option || { tokenLength: 256 };
    const token = module.exports.getUid(option.tokenLength || 256);

    const tokenHash = module.exports.decode(token);

    const accessToken = {
      code: tokenHash,
      code_: token
    };

    return Object.assign(payload, accessToken);
  },
  verify: (token) =>
    /*
         $Option = {
         }
        */
    // No option to check just that it exists
    !!token

};

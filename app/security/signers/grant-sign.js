const crypto = require('crypto');

module.exports = {
    code: (client, redirect_uri, user, ares) => {

        var accessToken = {
            state: ''
        };

        return module.exports.sign(accessToken);
    },
    decode: (token) => {
        var accessTokenHash = crypto
            .createHash('sha1')
            .update(token)
            .digest('hex');

        return accessTokenHash;
    },
    getRandomInt: (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    getUid: (length) => {
        let uid = '';
        const chars =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charsLength = chars.length;

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

        var tokenHash = module.exports.decode(token);

        var accessToken = {
            code: tokenHash,
            code_: token
        };

        return Object.assign(payload, accessToken);;
    },
    verify: (token, $Option) => {
        /*
         $Option = {
         }  
        */
        //No option to check just that it exists
        return !!token
    }
}
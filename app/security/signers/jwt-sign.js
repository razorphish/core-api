const fs = require('fs');
const jwt = require('jsonwebtoken');
const path = require('path');

// use 'utf8' to get string instead of byte array  (512 bit key)
var publicKey_ = path.resolve(process.cwd() + '/app/security/verifiers/public.pem');
var privateKey_ = path.resolve(process.cwd() + '/app/security/verifiers/private.pem');

var privateKEY = fs.readFileSync(privateKey_, 'utf8');
var publicKEY = fs.readFileSync(publicKey_, 'utf8');

module.exports = {

  decode: (token) => {
    return jwt.decode(token, { complete: true });
    //returns null if token is invalid
  },
  sign: (payload, $Options) => {
    /*
     sOptions = {
      issuer: "Authorizaxtion/Resource/This server",
      subject: "iam@user.me", 
      audience: "Client_Identity" // this should be provided by client
     }
    */
    // Token signing options
    var signOptions = {
      issuer: $Options.issuer,
      subject: $Options.subject,
      audience: $Options.audience,
      expiresIn: "30d",    // 30 days validity
      algorithm: "RS256"
    };
    return jwt.sign(payload, privateKEY, signOptions);
  },
  token: (userId, name, tokenLifeTime, scope, type, provider, protocol, $Options) => {
    var expiresIn = tokenLifeTime * 60;
    var expirationDate = new Date(
      new Date().getTime() + expiresIn * 1000
    ).toUTCString();

    var payload = {
      userId: userId,
      type: type || 'bearer',
      name: name,
      loginProvider: provider || 'oAuth2',
      scope: scope || '*',
      dateExpire: expirationDate,
      expiresIn: expiresIn,
      protocol: protocol || 'http'
    }

    var token = module.exports.sign(payload, $Options);

    return token;
  },
  verify: (token, $Option) => {
    /*
     vOption = {
      issuer: "Authorization/Resource/This server",
      subject: "iam@user.me", 
      audience: "Client_Identity" // this should be provided by client
     }  
    */
    var verifyOptions = {
      issuer: $Option.issuer,
      subject: $Option.subject,
      audience: $Option.audience,
      expiresIn: "30d",
      algorithm: ["RS256"]
    };
    try {
      return jwt.verify(token, publicKEY, verifyOptions);
    } catch (err) {
      return false;
    }
  }
}
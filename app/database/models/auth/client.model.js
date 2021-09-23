const mongoose = require('mongoose');
const httpSign = require('../../../security/signers/http-sign');
const logger = require('../../../../lib/winston.logger');

const { Schema } = mongoose;

const ClientSchema = new Schema({
  applicationId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Application'
  },
  name: { type: String, required: true },
  clientId: { type: String, required: true, index: { unique: true } },
  clientSecret: { type: String, required: true },
  isTrusted: { type: Boolean, required: true, isDefault: false },
  applicationType: {
    type: String,
    enum: ['ClientConfidential', 'Native'],
    required: true
  },
  redirectUrl: { type: String, required: true, default: '/home' },
  tokenProtocol: {
    type: String,
    enum: ['http', 'jwt'],
    required: true,
    default: 'http'
  },
  allowedOrigins: { type: [String], required: true },
  tokenLifeTime: { type: Number, required: true },
  refreshTokenLifeTime: { type: Number, required: true },
  hash: { type: String, required: true },
  // allowedLoginAttempts: { type: Number, required: false, default: 0 },
  // daysToLock: { type: Number, required: false, default: 0 },
  dateCreated: { type: Date, required: true, default: Date.now },
  dateModified: { type: Date, required: true, default: Date.now }
});

// PRE-SAVE
// ClientSchema.pre('save', function(next) {
//   var client = this;

//   if (!client.isModified('clientSecret')) {
//     return next();
//   }

//   if (client._id){
//     return next();
//   }

//   console.log('Need a client hash brown?: ');
//   var hash = crypto.createHash('sha1').update(this.clientSecret).digest('hex');

//   client.clientSecret = hash;
//   next();

// });
// expose enum on the model, and provide an internal convenience reference
// eslint-disable-next-line no-multi-assign
const reasons = (ClientSchema.statics.failedVerification = {
  NOT_FOUND: 0,
  SECRET_INCORRECT: 1,
  ORIGIN_DISABLED: 2,
  NOT_TRUSTED: 3
});

ClientSchema.statics.getVerified = function getVerified(
  clientId,
  clientSecret,
  origin,
  callback
) {
  this.findOne({ clientId }, (error, client) => {
    if (error) {
      return callback(error);
    }

    // check if client found::NOT_FOUND
    if (!client) {
      return callback(null, false, reasons.NOT_FOUND);
    }

    const accessTokenHash = httpSign.decode(clientSecret);

    // Check correct secret::SECRET_INCORRECT
    if (client.clientSecret !== accessTokenHash) {
      return callback(null, false, reasons.SECRET_INCORRECT);
    }

    // Check origins::ORIGIN_DISABLED
    let originDisabled = true;

    client.allowedOrigins.forEach((allwedOrigin) => {
      logger.info('*** Client.SCHEMA.getVerified origin', allwedOrigin);
      if (allwedOrigin === '*') {
        originDisabled = false;
      }

      if (allwedOrigin === origin) {
        originDisabled = false;
      }
    });

    // Check origin
    if (originDisabled) {
      return callback(null, false, reasons.ORIGIN_DISABLED);
    }

    // Add origin to client
    client.origin = origin;

    // Finally, check for Trust::NOT_TRUSTED
    if (!client.isTrusted) {
      return callback(null, false, reasons.NOT_TRUSTED);
    }

    return callback(null, client);
  });
};

ClientSchema.virtual('origin').set((value) => {
  this._origin = value;
});

ClientSchema.virtual('origin').get(() => this._origin);

module.exports = mongoose.model('Client', ClientSchema, 'clients');

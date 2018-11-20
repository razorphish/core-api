/**
 * 
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Role = require('./role.model');
const Token = require('../auth/token.model');
const logger = require('../../../../lib/winston.logger');

const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10,
  // these values can be whatever you want - we're defaulting to a
  // max of 5 attempts, resulting in a 2 hour lock
  MAX_LOGIN_ATTEMPTS = 5,
  LOCK_TIME = 2 * 60 * 60 * 1000;

//////////////////////// Validators ///////////////////////////
/**
 * User address validator
 */
var userAddressValidator = [
  { validator: upperBound, msg: '{PATH} exceeds limit of 2' }
];

///////////////////////// Sub Schemas
const AddressSchema = new Schema({
  address: { type: String, /*required: true,*/ trim: true },
  city: { type: String, /*required: true,*/ trim: true },
  state: { type: String /*required: true,*/ },
  zip: { type: String /*required: true,*/ }
});

const DeviceSchema = new Schema({
  pushRegistrationId: { type: String, required: false, trim: true },
  cordova: { type: String, required: false, trim: true },
  model: { type: String, required: false, trim: true },
  platform: { type: String, required: false, trim: true },
  uuid: { type: String, required: false, trim: true },
  version: { type: String, required: false, trim: true },
  manufacturer: { type: String, required: false, trim: true },
  isVirtual: { type: String, required: false, trim: true },
  serial: { type: String, required: false, trim: true }
});

const UserSchema = new Schema({
  firstName: { type: String, required: false, trim: true },
  lastName: { type: String, required: false, trim: true },
  email: { type: String, required: true, trim: true, index: { unique: true } },
  email_lower: { type: String, required: true, trim: true, index: { unique: true }, lowercase: true },
  homePhone: { type: String, required: false, trim: true },
  username: {
    type: String,
    required: true,
    trim: true,
    index: { unique: true }
  },
  username_lower: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: { unique: true }
  },
  avatar: { type: String, required: false, trim: true },
  twitter: { type: String, required: false, trim: true },
  facebook: { type: String, required: false, trim: true },
  instagram: { type: String, required: false, trim: true },
  password: { type: String, required: true },
  salt: { type: String, required: false },
  refreshToken: { type: Token.schema, required: false },
  dateCreated: { type: Date, required: true, default: Date.now },
  dateModified: { type: Date, required: true, default: Date.now },
  roles: { type: [Role.schema], required: false },
  addresses: {
    type: [AddressSchema],
    required: false,
    validate: userAddressValidator
  },
  loginAttempts: { type: Number, required: true, default: 0 },
  lockUntil: { type: Number },
  devices: { type: [DeviceSchema], required: false },
  status: { type: String, enum: ['active', 'inactive', 'disabled', 'pending', 'archived', 'suspended'], required: true },
  account: { type: Schema.Types.ObjectId }
});

/**
 * Validates that array has no more than 2 elements
 * 
 * @param {any[]} val - Array to check
 * @returns {boolean} - True if array has 2 or less elements, otherwise false
 */
function upperBound(val) {
  if (val) {
    return val.length <= 2;
  } else {
    //ignore null as this is
    //not job of this validator
    return true;
  }
}

UserSchema.virtual('isLocked').get(function () {
  // check for a future lockUntil timestamp
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

//PRE-SAVE
UserSchema.pre('save', function (next) {
  var user = this;

  if (!user.isModified('password')) {
    return next();
  }

  bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    logger.info('user: got Salt?', salt)
    user.salt = salt;

    bcrypt.hash(user.password, salt, (err, hash) => {
      logger.info('*** User.SCHEMA.save password hashed', hash)
      user.password = hash;
      next();
    });
  });
  // bcrypt.hash(user.password, SALT_WORK_FACTOR)
  //   .then((hash, salt) => {
  //     user.password = hash;
  //     next();
  //   }).catch((reason) => {
  //     next();
  //   });
});

//Compare password
UserSchema.methods.comparePassword = function (candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password,  (err, isMatch) => {
    if (err) {
      return callback(err);
    }

    callback(null, isMatch);
  });
};

UserSchema.methods.incLoginAttempts = function (callback) {
  // if we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.update(
      {
        $set: { loginAttempts: 1 },
        $unset: { lockUntil: 1 }
      },
      callback
    );
  }
  // otherwise we're incrementing
  var updates = { $inc: { loginAttempts: 1 } };
  // lock the account if we've reached max attempts and it's not locked already
  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + LOCK_TIME };
  }
  return this.updateOne(updates, callback);
};

// expose enum on the model, and provide an internal convenience reference
var reasons = (UserSchema.statics.failedLogin = {
  NOT_FOUND: 0,
  PASSWORD_INCORRECT: 1,
  MAX_ATTEMPTS: 2
});

UserSchema.statics.getAuthenticated = function (username, password, callback) {
  this.findOne({ username: username },
    (err, user) => {
      if (err) {
        return callback(err);
      }

      // make sure the user exists
      if (!user) {
        return callback(null, null, reasons.NOT_FOUND);
      }

      // check if the account is currently locked
      if (user.isLocked) {
        // just increment login attempts if account is already locked
        return user.incLoginAttempts(function (err) {
          if (err) {
            return callback(err);
          }
          return callback(null, null, reasons.MAX_ATTEMPTS);
        });
      }

      // test for a matching password
      user.comparePassword(password, function (err, isMatch) {
        if (err) {
          return callback(err);
        }

        // check if the password was a match
        if (isMatch) {
          // if there's no lock or failed attempts, just return the user
          if (!user.loginAttempts && !user.lockUntil) {
            return callback(null, user);
          }
          // reset attempts and lock info
          var updates = {
            $set: { loginAttempts: 0 },
            $unset: { lockUntil: 1 }
          };
          return user.update(updates, function (err) {
            if (err) {
              return callback(err);
            }
            return callback(null, user);
          });
        }

        // password is incorrect, so increment login attempts before responding
        user.incLoginAttempts(function (err) {
          if (err) {
            return callback(err);
          }
          return callback(null, null, reasons.PASSWORD_INCORRECT);
        });
      });
    });
};

//Compound index
//UserSchema.index({username: 1, email: 1 });

module.exports = mongoose.model('User', UserSchema, 'users');

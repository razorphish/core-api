/**
 * 
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Role = require('../auth/role.model');
const Token = require('../auth/token.model');
const Social = require('../core/social.model');
const Device = require('../core/device.model');
const Notification = require('../core/notification.model');
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

const UserSchema = new Schema(
  {
    applicationId: { type: Schema.Types.ObjectId, required: true, ref: 'Application' },
    firstName: { type: String, required: false, trim: true },
    lastName: { type: String, required: false, trim: true },
    email: { type: String, required: true, trim: true },
    email_lower: { type: String, required: true, trim: true, lowercase: true },
    homePhone: { type: String, required: false, trim: true },
    username: {
      type: String,
      required: true,
      trim: true
    },
    username_lower: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    avatar: { type: String, required: false, trim: true },
    social: { type: Social.schema, required: false },
    password: { type: String, required: false },
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
    devices: { type: [Device.schema], required: false },
    notifications: { type: [Notification.schema], required: false },
    status: {
      type: String,
      enum: ['active', 'inactive', 'disabled', 'pending', 'archived', 'suspended', 'awaitingPassword'],
      default: 'pending',
      required: true
    }
  }, {
    toJSON: { virtuals: true }
  });

//Composite Key
UserSchema.index({ applicationId: 1, username: 1 }, { unique: true })

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

function traverseUser(user) {
  user.social = {};

  const user_ = Object.assign({}, user);

  switch (user.provider) {
    case 'FACEBOOK':
      user_.social.facebook = user.facebook;
      user_.social.facebook.authToken = user.authToken;
      user_.username = user.email;
      user_.email_lower = user.email.toLowerCase();
      user_.username_lower = user.email.toLowerCase();
      user_.avatar = user.photoUrl;
      break;
    case 'GOOGLE':
      user_.social.google = {
        authToken: user.authToken,
        email: user.email,
        firstName: user.firstName,
        id: user.id,
        lastName: user.lastName,
        name: user.name,
        photoUrl: user.photUrl,
        provider: user.provider,
        idToken: user.idToken
      };
      user_.username = user.email;
      user_.email_lower = user.email.toLowerCase();
      user_.username_lower = user.email.toLowerCase();
      user_.avatar = user.photoUrl;
      break;
    case 'LINKEDIN':
      user_.social.linkedIn = user.linkedIn;
      user_.social.linkedIn.authToken = user.authToken;
      user_.username = user.email;
      user_.email_lower = user.email.toLowerCase();
      user_.username_lower = user.email.toLowerCase();
      user_.avatar = user.photoUrl;
      break;
    default:
      user_.username_lower = user.email.toLowerCase();
      break;
  }

  return user_;
}

UserSchema.virtual('isLocked').get(function () {
  // check for a future lockUntil timestamp
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

//Add User Virtual Reference Objects
UserSchema.virtual('tokens', {
  ref: 'Token', // The model to use
  localField: '_id', // Find people where `localField`
  foreignField: 'userId', // is equal to `foreignField`
  // If `justOne` is true, 'members' will be a single doc as opposed to
  // an array. `justOne` is false by default.
  justOne: false,
  //options: { sort: { 'dateExpire': -1 }//, limit: 5 
  //} // Query options, see http://bit.ly/mongoose-query-options
});

UserSchema.virtual('wishlists', {
  ref: 'Wishlist', // The model to use
  localField: '_id', // Find people where `localField`
  foreignField: 'userId', // is equal to `foreignField`
  // If `justOne` is true, 'members' will be a single doc as opposed to
  // an array. `justOne` is false by default.
  justOne: false,
  //options: { sort: { 'dateExpire': -1 }//, limit: 5 
  //} // Query options, see http://bit.ly/mongoose-query-options
});

UserSchema.virtual('wishlistItemCategories', {
  ref: 'WishlistItemCategory', // The model to use
  localField: '_id', // Find people where `localField`
  foreignField: 'userId', // is equal to `foreignField`
  // If `justOne` is true, 'members' will be a single doc as opposed to
  // an array. `justOne` is false by default.
  justOne: false,
  //options: { sort: { 'dateExpire': -1 }//, limit: 5 
  //} // Query options, see http://bit.ly/mongoose-query-options
});

UserSchema.virtual('wishlistFollows', {
  ref: 'WishlistFollow', // The model to use
  localField: '_id', // Find people where `localField`
  foreignField: 'userId', // is equal to `foreignField`
  // If `justOne` is true, 'members' will be a single doc as opposed to
  // an array. `justOne` is false by default.
  justOne: false,
  //options: { sort: { 'dateExpire': -1 }//, limit: 5 
  //} // Query options, see http://bit.ly/mongoose-query-options
});

UserSchema.virtual('twitter', {
  ref: 'TwitterUser', // The model to use
  localField: '_id', // Find people where `localField`
  foreignField: 'userId', // is equal to `foreignField`
  // If `justOne` is true, 'members' will be a single doc as opposed to
  // an array. `justOne` is false by default.
  justOne: true,
  //options: { sort: { 'dateExpire': -1 }//, limit: 5 
  //} // Query options, see http://bit.ly/mongoose-query-options
});

//PRE-SAVE
UserSchema.pre('save', function (next) {
  const user = this;
  const now = new Date();

  if (!user.dateCreated) {
    user.dateCreated = now;
    user.dateModified = now;
  } else {
    user.dateModified = now;
  }

  if (!user.isModified('password')) {
    return next();
  }

  bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    logger.info('*** User.SCHEMA.save : got Salt?', salt)
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

UserSchema.methods.changeStatus = function (status, callback) {
  // Change status of the user
  return this.update(
    {
      $set: { status: status }
    },
    callback
  );

}

//Compare password
UserSchema.methods.comparePassword = function (candidatePassword, callback) {
  if (!!candidatePassword) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
      if (err) {
        return callback(err);
      }

      callback(null, isMatch);
    });
  } else {
    callback(new Error('Missing password'));
  }
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
  MAX_ATTEMPTS: 2,
  ACCOUNT_NOT_ACTIVE: 3
});

UserSchema.statics.getAuthenticated = function (username, password, applicationId, callback) {

  var query = { username: username };

  if (!!applicationId) {
    query.applicationId = applicationId;
  }

  this.findOne(query)
    .populate({
      path: 'wishlists',
      select: '_id name preferences statusId privacy items dateExpire dateCreated items',
      match: { statusId: { $ne: 'deleted' } },
      populate: [
        {
          path: 'items',
          match: { statusId: { $ne: 'deleted' } },
          select: '_id name categoryId price quantity url notes purchased image statusId sortOrder userId dateCreated'
        },
        {
          path: 'follows',
          select: '_id userId notifiedOnAddItem notifiedOnRemoveItem notifiedOnCompletion',
          match: { statusId: { $ne: 'deleted' } }
        }]
    })
    .populate({
      path: 'wishlistItemCategories',
      select: '_id name'
    })
    .populate({
      path: 'wishlistFollows',
      select: '_id dateCreated notifiedOnAddItem notifiedOnRemoveItem notifiedOnCompletion',
      match: { statusId: { $ne: 'deleted' } },
      populate: [
        {
          path: 'wishlistId',
          select: '_id name'
        }
      ]
    })
    .then(user => {
      if (!user) {
        return callback(null, null, reasons.NOT_FOUND);
      }

      if (user.isLocked) {
        // just increment login attempts if account is already locked
        return user.incLoginAttempts(function (err) {
          if (err) {
            return callback(err);
          }
          return callback(null, null, reasons.MAX_ATTEMPTS);
        });
      }

      //Determine if user is in active status
      if (user.status !== 'active') {
        return callback(null, null, reasons.ACCOUNT_NOT_ACTIVE);
      }

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
    })
    .catch(error => {
      return callback(error);
    });
};

UserSchema.statics.getSociallyAuthenticated = function (socialUser, callback) {
  var socialUser_ = traverseUser(socialUser);
  var query = { email: socialUser.email };

  if (!!socialUser.applicationId) {
    query.applicationId = socialUser.applicationId;
  }

  this.findOneAndUpdate(query, socialUser_,
    {
      upsert: true,
      new: true,
      //rawResult: true
    })
    .populate({
      path: 'wishlists',
      select: '_id name preferences statusId privacy items dateExpire dateCreated items',
      match: { statusId: { $ne: 'deleted' } },
      populate: [
        {
          path: 'items',
          match: { statusId: { $ne: 'deleted' } },
          select: '_id name categoryId price quantity url notes purchased image statusId sortOrder userId dateCreated'
        },
        {
          path: 'follows',
          select: '_id userId notifiedOnAddItem notifiedOnRemoveItem notifiedOnCompletion',
          match: { statusId: { $ne: 'deleted' } }
        }]
    })
    .populate({
      path: 'wishlistItemCategories',
      select: '_id name'
    })
    .populate({
      path: 'wishlistFollows',
      select: '_id dateCreated',
      match: { statusId: { $ne: 'deleted' } },
      populate: [
        {
          path: 'wishlistId',
          select: '_id name dateCreated'
        }
      ]
    })
    .then(user => {
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

      //Determine if user is in active status
      if (user.status !== 'active' && user.status !== 'pending' && user.status !== 'awaitingPassword') {
        //reasons.ACCOUNT_NOT_ACTIVE
        return callback(null, null, 'Account not active');
      }

      /**
       * When socially authenticating we will not check password
       * Typically the user will have already been authenticated
       * through another platform so no password is present 
       * or necessary
       */
      if (user.status === 'pending') {
        // if user status is pending and currently inserted
        // change status to awaitingPassword (from user)
        user.status = 'awaitingPassword'
        user.changeStatus(user.status, function (err) {
          if (err) {
            return callback(err);
          }
          //SUCCESSFUL : Move on
        });
      }

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

    })
    .catch(error => {
      return callback(error);
    });
};
//Compound index
//UserSchema.index({username: 1, email: 1 });

module.exports = mongoose.model('User', UserSchema, 'users');

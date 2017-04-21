/**
 * Module dependencies.
 */
const mongoose = require('mongoose'),

  Schema = mongoose.Schema,
  bcrypt = require('bcryptjs'),
  authTypes = ['github', 'twitter', 'facebook', 'google'];

/**
 * User Schema
 */
const UserSchema = new Schema({
  name: String,
  email: String,
  username: String,
  provider: String,
  avatar: String,
  premium: Number, // null or 0 for non-donors, 1 for everyone else (for now)
  donations: [],
  friends: {},
  hashed_password: String,
  hideTour: {
    type: Boolean,
    default: false
  },
  facebook: {},
  twitter: {},
  github: {},
  google: {},
  gameWins: { type: Number, default: 0 }
});

/**
 * Virtuals
 */
UserSchema
  .virtual('password')
  .set(function (password) {
    this._password = password;
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });

/**
 * Validations
 */
const validatePresenceOf = function (value) {
  return value && value.length;
};

// the below 4 validations only apply if you are signing up traditionally
UserSchema
  .path('name')
  .validate(function (name) {
    // if you are authenticating by any of the oauth strategies, don't validate
    if (authTypes.indexOf(this.provider) !== -1) {
      return true;
    }
    return name.length;
  }, 'Name cannot be blank');

UserSchema
  .path('email')
  .validate(function (email) {
    // if you are authenticating by any of the oauth strategies, don't validate
    if (authTypes.indexOf(this.provider) !== -1) {
      return true;
    }
    return email.length;
  }, 'Email cannot be blank');

UserSchema
  .path('username')
  .validate(function (username) {
    // if you are authenticating by any of the oauth strategies, don't validate
    if (authTypes.indexOf(this.provider) !== -1) {
      return true;
    }
    return username.length;
  }, 'Username cannot be blank');

UserSchema
  .path('hashed_password')
  .validate(function (hashed_password) {
    // if you are authenticating by any of the oauth strategies, don't validate
    if (authTypes.indexOf(this.provider) !== -1) {
      return true;
    }
    return hashed_password.length;
  }, 'Password cannot be blank');

/**
 * Pre-save hook
 */
UserSchema.pre('save', function (next) {
  if (!this.isNew) {
    return next();
  }
  if (!validatePresenceOf(this.password) && authTypes.indexOf(this.provider) === -1) {
    next(new Error('Invalid password'));
  } else {
    next();
  }
});

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function authenticate(plainText) {
    if (!plainText || !this.hashed_password) {
      return false;
    }
    return bcrypt.compareSync(plainText, this.hashed_password);
  },

  addFriend: function addFriend(email, name) {
    let status;
    // check if it's already a friend
    if (!this.friends) {
      this.friends = {};
    }
    if (!this.friends[email]) {
      // add friend
      this.friends[email] = name;
      status = true;
    } else {
      status = false;
    }

    return status;
  },

  removeFriend: function removeFriend(email) {
    let status;
    // check if it's a friend
    if (!this.friends) {
      this.friends = {};
    }
    if (this.friends[email]) {
      console.log('Deleting friend');
      delete this.friends[email];
      status = true;
    } else {
      console.log('Not a friend');
      status = false;
    }
    return status;
  },

  /**
   * Encrypt password
   * 
   * @param {String} password
   * @return {String}
   * @api public
   */
  encryptPassword: function encryptPassword(password) {
    if (!password) return '';
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
  }
};

const User = mongoose.model('User', UserSchema);
module.exports = User;

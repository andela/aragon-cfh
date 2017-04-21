/**
 * Module dependencies.
 */
const mongoose = require('mongoose'),
  avatars = require('./avatars').all(),
  _ = require('underscore'),
  User = mongoose.model('User');

/**
 * Auth callback
 */
exports.authCallback = (req, res, next) => {
  res.redirect('/chooseavatars');
};

/**
 * Show login form
 */
exports.signin = (req, res) => {
  if (!req.user) {
    res.redirect('/#!/signin?error=invalid');
  } else {
    res.redirect('/#!/app');
  }
};

/**
 * Show sign up form
 */
exports.signup = (req, res) => {
  if (!req.user) {
    res.redirect('/#!/signup');
  } else {
    res.redirect('/#!/app');
  }
};

/**
 * Logout
 */
exports.signout = (req, res) => {
  (new Promise((resolve) => {
    resolve(req.logout());
  }))
  .then(() => {
    console.log('Signed out');
    res.send(200);
  });
};

/**
 * Session
 */
exports.session = (req, res) => {
  res.redirect('/');
};

/** 
 * Check avatar - Confirm if the user who logged in via passport
 * already has an avatar. If they don't have one, redirect them
 * to our Choose an Avatar page.
 */
exports.checkAvatar = (req, res) => {
  if (req.user && req.user._id) {
    User.findOne({
      _id: req.user._id
    })
    .exec((err, user) => {
      if (user.avatar !== undefined) {
        res.redirect('/#!/');
      } else {
        res.redirect('/#!/choose-avatar');
      }
    });
  } else {
    // If user doesn't even exist, redirect to /
    res.redirect('/');
  }
};

/**
 * Create user
 */
exports.create = (req, res, next) => {
  if (req.body.name && req.body.password && req.body.email) {
    User.findOne({
      email: req.body.email
    }).exec((err, existingUser) => {
      if (!existingUser) {
        const user = new User(req.body);
        // Switch the user's avatar index to an actual avatar url
        user.avatar = avatars[user.avatar];
        user.provider = 'local';
        user.save((err) => {
          if (err) {
            return res.render('/#!/signup?error=unknown', {
              errors: err.errors,
              user
            });
          }
          req.logIn(user, (err) => {
            if (err) return next(err);
            return res.redirect('/#!/');
          });
        });
      } else {
        return res.redirect('/#!/signup?error=existinguser');
      }
    });
  } else {
    return res.redirect('/#!/signup?error=incomplete');
  }
};

exports.addFriend = (req, res, next) => {
  if (req.body.friendEmail && req.body.friendName && req.body.userId) {
    User.findById(req.body.userId)
      .exec((error, user) => {
        if (error) {
          return next(error);
        }
        if (user) {
          const friendAdded = user.addFriend(req.body.friendEmail.replace(/\./g, '\\u002e'), req.body.friendName);
          if (friendAdded) {
            User.findByIdAndUpdate(
              user._id,
              { $set: { friends: user.friends } },
              { new: true },
              (err, updatedUser) => {
                if (err) {
                  next(err);
                } else if (updatedUser) {
                  res.status(201).send(_.pick(updatedUser, '_id', 'donations', 'email', 'friends', 'gameWins', 'hideTour', 'name', 'provider'));
                }
              });
          } else {
            res.status(204).send({ message: 'Friend already added' });
          }
        }
      });
  } else {
    res.status(400);
  }
};

exports.removeFriend = (req, res, next) => {
  if (req.body.friendEmail && req.body.userId) {
    User.findById(req.body.userId)
      .exec((error, user) => {
        if (error) {
          return next(error);
        }
        if (user) {
          const friendRemoved = user.removeFriend(req.body.friendEmail.replace(/\./g, '\\u002e'));
          if (friendRemoved) {
            User.findByIdAndUpdate(
              user._id,
              { $set: { friends: user.friends } },
              { new: true },
              (err, updatedUser) => {
                if (err) {
                  next(err);
                } else if (updatedUser) {
                  res.status(201).send(_.pick(updatedUser, '_id', 'donations', 'email', 'friends', 'gameWins', 'hideTour', 'name', 'provider'));
                }
              });
          } else {
            res.status(204).send({ message: 'Friend already removed' });
          }
        }
      });
  }
};

/**
 * Assign avatar to user
 */
exports.avatars = (req, res) => {
  // Update the current user's profile to include the avatar choice they've made
  if (req.user && req.user._id && req.body.avatar !== undefined &&
    /\d/.test(req.body.avatar) && avatars[req.body.avatar]) {
    User.findOne({
      _id: req.user._id
    })
    .exec((err, user) => {
      user.avatar = avatars[req.body.avatar];
      user.save();
    });
  }
  return res.redirect('/#!/app');
};

exports.addDonation = (req, res) => {
  if (req.body && req.user && req.user._id) {
    // Verify that the object contains crowdrise data
    if (req.body.amount && req.body.crowdrise_donation_id && req.body.donor_name) {
      User.findOne({
        _id: req.user._id
      })
      .exec((err, user) => {
        // Confirm that this object hasn't already been entered
        let duplicate = false;
        for (let i = 0; i < user.donations.length; i += 1) {
          if (user.donations[i].crowdrise_donation_id === req.body.crowdrise_donation_id) {
            duplicate = true;
          }
        }
        if (!duplicate) {
          console.log('Validated donation');
          user.donations.push(req.body);
          user.premium = 1;
          user.save();
        }
      });
    }
  }
  res.send();
};

/**
 *  Show profile
 */
exports.show = (req, res) => {
  const user = req.profile;

  res.render('users/show', {
    title: user.name,
    user
  });
};

/**
 * Send User
 */
exports.me = (req, res) => {
  res.jsonp(req.user || null);
};

/**
 * Find user by id
 */
exports.user = (req, res, next, id) => {
  User
    .findOne({
      _id: id
    })
    .exec((err, user) => {
      if (err) return next(err);
      if (!user) return next(new Error(`Failed to load User ${id}`));
      req.profile = user;
      next();
    });
};

const jwt = require('jsonwebtoken'),
  mongoose = require('mongoose'),
  expiryDate = 86400, // 24hours
  secret = process.env.SECRET,
  User = mongoose.model('User'),
  avatars = require('../app/controllers/avatars').all();

// routing process to authenticate users and generate token
exports.authToken = (req, res) => {
  // find the user
  User.findOne({
    email: req.body.email
  }, (error, existingUser) => {
    if (error) {
      throw error;
    }
    if (!existingUser) {
      return res.redirect('/#!/signup?error=notanexistinguser');
    } else if (existingUser) {
      if (!existingUser.authenticate(req.body.password)) {
        return res.redirect('/#!/signup?error=notanexistinguser');
      }
      // Create the token
      req.logIn(existingUser, (err) => {
        if (err) {
          throw err;
        }
        const token = jwt.sign(existingUser, secret, {
          expiresIn: expiryDate
        });
        // return the token as JSON
        res.set('x-access-token', token);
        return res.redirect('/#!/');
      });
    }
  });
};


// Routing process of the middleware to verify a user token
exports.checkToken = (req, res, next) => {
    // checking header or url parameters or post parameters for token
  const token = req.body.token || req.query.token ||
      req.headers['x-access-token'];
    // decoding the token
  if (token) {
      // verifies secret and checks
    jwt.verify(token, secret, (error, decoded) => {
      if (error) {
        return res.status(403).json({
          message: 'Failed to authenticate token.' });
      }
      // if the authentication process was succesful, save to request for use in other routes
      req.decoded = decoded;
      next();
    });
  } else {
      // if there is no token available
      // return an error
    return res.status(403).send({
      message: 'No token returned.'
    });
  }
};

exports.create = (req, res) => {
  if (!req.body.name || !req.body.email || !req.body.password) {
    return res.redirect('/#!/signup?error=incomplete');
  }
  User.findOne({
    email: req.body.email
  }).exec((err, existingUser) => {
    if (err) throw err;
    if (!existingUser) {
      const user = new User(req.body);
      user.avatar = avatars[user.avatar];
      user.provider = 'jwt';

      user.save((err) => {
        if (err) {
          return res.render('/#!/signup?error=unknown', {
            errors: err.errors,
            userDetails: user
          });
        }

        req.logIn(user, (err) => {
          if (err) return err;
          const token = jwt.sign(user, secret, {
            expiresIn: 86400
          });
          res.set('x-access-token', token);
          return res.redirect('/#!/');
        });
      });
    } else {
      return res.redirect('/#!/signup?error=existinguser');
    }
  });
};


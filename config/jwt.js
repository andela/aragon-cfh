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
      return res.json({ success: false,
        message: '' });
    } else if (existingUser) {
      if (!existingUser.authenticate(req.body.password)) {
        return res.json({ success: false,
          message: '' });
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
        return res.json({ success: true, message: 'Signed up', id: req.user._id, token });
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
    return res.json({ success: false, message: 'Incomplete user details' });
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
        if (err) return res.json({ success: false, message: 'Unable to save' });

        req.logIn(user, (err) => {
          if (err) return err;
          const token = jwt.sign(user, secret, {
            expiresIn: 86400
          });
          return res.json({ success: true, message: 'Signed up', id: req.user._id, token });
        });
      });
    } else {
      return res.json({ success: false,
        message: 'Existing user cannot sign up again. Please sign in' });
    }
  });
};


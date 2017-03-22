const jwt = require('jsonwebtoken'),
  mongoose = require('mongoose'),
  expiryDate = 86400, // 24hours
  secret = 'ilovescotchyscotch',
  User = mongoose.model('User');
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

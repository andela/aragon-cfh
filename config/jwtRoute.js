  /**
 * Module dependencies.
 */
const mongoose = require('mongoose'),
  User = mongoose.model('User');
const config = require('../config/config'),
  jwt = require('jsonwebtoken');
const avatars = require('../app/controllers/avatars').all();

module.exports = (app) => {
  // Register new users
  app.post('/api/auth/signup', (req, res) => {
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
        alert('User Created');
        user.save((err) => {
          if (err) {
            return res.render('/#!/signup?error=unknown', {
              errors: err.errors,
              user: user
            });
          }
          req.logIn(user, (err) => {
            if (err) return err;
            const token = jwt.sign(user, config.secret, {
              expiresIn: 86400
            });
            res.set('Authorization', 'JWT '.concat(token));
            return res.redirect('/#!/');
          });
        });
      } else {
        return res.redirect('/#!/signup?error=existinguser');
      }
    });
  });
};

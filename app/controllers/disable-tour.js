const User = require('../models/user');

module.exports = (req, res) => {
  if (req.isAuthenticated()) {
    User.findOne({
      _id: req.body._id
    }, (err, user) => {
      if (err) {
        res.json(err);
      }
      user.hideTour = true;
      user.save((err) => {
        if (err) {
          res.json(err);
        }
        res.send(200);
      });
    });
  } else {
    res.status(403).send({
      error: 'Please log in to update users!'
    });
  }
};

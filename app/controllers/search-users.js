// const mongoose = require('mongoose');
const User = require('../models/user');

module.exports = (req, res) => {
  if (req.isAuthenticated()) {
    const inviteeName = req.query.name;
    User.find({
      name: new RegExp(inviteeName, 'i')
    }, (err, results) => {
      if (err) {
        res.json(err);
      }
      const users = [];
      results.forEach((result) => {
        users.push({
          name: result.name,
          email: result.email
        });
      });
      res.json(users);
    }).limit(20);
  } else {
    res.status(403).send({
      error: 'Please log in to search users!'
    });
  }
};

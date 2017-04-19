const Game = require('../models/record.js');
const Users = require('../models/user.js');



exports.leaderboard = (req, res) => {
  Users.find().sort({ gameWins: -1 }).exec((error, result) => {
    res.send(result);
  });
};

exports.gamelog = (req, res) => {
  Game.find({ }, (error, log) => {
    if (error) {
      return res.status(404).send({ error });
    }
    return res.send(log);
  });
};

exports.donations = (req, res) => {
  const userName = req.query.name;
  console.log(userName);
  Users.find({ name: userName }, (error, result) => {
    if (error) {
      console.log(error);
    }
    res.send(result);
  });
};

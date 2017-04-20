/*
* Module dependencies.
*/

const Record = require('../models/record');


exports.saveRecords = (req, res) => {
  res.connection.setTimeout(0);
  const gameID = req.body.gameID,
    players = req.body.players,
    winner = req.body.winner,
    rounds = req.body.rounds;

  const record = new Record({
    gameID,
    players,
    rounds,
    winner
  });
  record.save((err) => {
    if (err) return (err);
  }
  );
};


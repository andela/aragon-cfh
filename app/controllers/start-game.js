/*
* Module dependencies.
*/
const mongoose = require('mongoose');

const Record = require('../models/record');


exports.saveRecords = (req) => {
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
  record.save(
    {
      winner,
      rounds,
      players,
      gameID
    });
};


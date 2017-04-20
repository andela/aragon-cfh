/*
* Module dependencies.
*/

const Record = require('../models/record');
const User = require('../models/user');


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

  User.findOneAndUpdate({ name: winner },
    {
      $inc: { gameWins: 1 }
    }, (error) => {
      if (error) {
        console.log(`Error occured for ${winner}`);
      } else {
        console.log(`${winner} record has been updated`);
      }
    });
};


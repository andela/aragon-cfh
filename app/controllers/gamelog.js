const Game = require('../models/record.js');


exports.saveRecord = (req, res) => {
  const game = new Game({
    gameID: req.body.gameID,
    gamePlayers: req.body.gamePlayers,
    gameOwnerId: req.params.id,
    gameRounds: req.body.gameRounds,
    gameWinner: req.body.gameWinner,
    gameStartTime: req.body.gameStartTime,
    gameEndTime: req.body.gameEndTime,
  });

  game.save((error) => {
    if (!(error)) {
      console.log(game.gameRounds);
      console.log(game.gameWinner);
      res.status(200)
        .json({
          message: 'Game successfully recorded'
        });
      console.log('game is saved');
    } else {
      console.log('an error occured', error);
      res.status(500)
        .json({
          message: 'Unable to save this game log'
        });
    }
  });
};

exports.updateRecord = (req, res) => {
  const game = new Game({
    gameID: req.body.gameID,
    gameRounds: req.body.gameRounds,
    gameWinner: req.body.gameWinner,
    gameEndTime: req.body.gameEndTime,
  });

  Game.findOneAndUpdate({ gameID: game.gameID },
    {
      $set: {
        gameID: game.gameID,
        gameRounds: game.gameRounds,
        gameWinner: game.gameWinner,
        gameEndTime: game.gameEndTime,
      }
    },
    {
      upsert: true,
    }, (error) => {
      if (!(error)) {
        console.log('record is updated');
        res.status(200).json({
          message: 'Game successfully recorded'
        });
      } else {
        console.log('error updating');
        res.status(500)
          .json('An error occured. saving this game log');
      }
    });
};
exports.leaderboard = (req, res) => {
  Game.find({}, (error, allGames) => {
    if (error) {
      return res.status(404).send({ error });
    }
    return res.status(200).json(allGames);
  });
};

exports.gamelog = (req, res) => {
  Game.find({}, (error, allGames) => {
    if (error) {
      return res.status(404).send({ error });
    }
    return res.status(200).json(allGames);
  });
};

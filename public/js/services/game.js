angular.module('mean.system')
  .factory('game', ['socket', '$rootScope', '$location', '$timeout', '$http', '$window', '$q', function gameService(socket, $rootScope, $location, $timeout, $http, $window, $q) {
    const game = {
      id: null, // This player's socket ID, so we know who this player is
      gameID: null,
      players: [],
      playerIndex: 0,
      winningCard: -1,
      winningCardPlayer: -1,
      gameWinner: -1,
      table: [],
      czar: null,
      playerMinLimit: 3,
      playerMaxLimit: 12,
      pointLimit: null,
      state: null,
      round: 0,
      time: 0,
      curQuestion: null,
      notification: null,
      timeLimits: {},
      joinOverride: false
    };

    const notificationQueue = [];
    let timeout = false;

    const setNotification = function setNotification() {
      if (notificationQueue.length === 0) { // If notificationQueue is empty, stop
        clearInterval(timeout);
        timeout = false;
        game.notification = '';
      } else {
        // Show a notification and check again in a bit
        game.notification = notificationQueue.shift();
        timeout = $timeout(setNotification, 1300);
      }
    };

    const addToNotificationQueue = function addToNotificationQueue(msg) {
      notificationQueue.push(msg);
      if (!timeout) { // Start a cycle if there isn't one
        setNotification();
      }
    };

    let timeSetViaUpdate = false;
    const decrementTime = function decrementTime() {
      if (game.time > 0 && !timeSetViaUpdate) {
        game.time -= 1;
      } else {
        timeSetViaUpdate = false;
      }
      $timeout(decrementTime, 950);
    };

    socket.on('id', (data) => {
      game.id = data.id;
    });

    socket.on('prepareGame', (data) => {
      game.playerMinLimit = data.playerMinLimit;
      game.playerMaxLimit = data.playerMaxLimit;
      game.pointLimit = data.pointLimit;
      game.timeLimits = data.timeLimits;
    });

    socket.on('gameUpdate', (data) => {
      // Update gameID field only if it changed.
      // That way, we don't trigger the $scope.$watch too often
      if (game.gameID !== data.gameID) {
        game.gameID = data.gameID;
      }
      game.joinOverride = false;
      clearTimeout(game.joinOverrideTimeout);

      // Cache the index of the player in the players array
      for (let i = 0; i < data.players.length; i += 1) {
        if (game.id === data.players[i].socketID) {
          game.playerIndex = i;
        }
      }

      const newState = (data.state !== game.state);

      // Handle updating game.time
      if (data.round !== game.round && data.state !== 'awaiting players' &&
        data.state !== 'game ended' && data.state !== 'game dissolved') {
        game.time = game.timeLimits.stateChoosing - 1;
        timeSetViaUpdate = true;
      } else if (newState && data.state === 'waiting for czar to decide') {
        game.time = game.timeLimits.stateJudging - 1;
        timeSetViaUpdate = true;
      } else if (newState && data.state === 'winner has been chosen') {
        game.time = game.timeLimits.stateResults - 1;
        timeSetViaUpdate = true;
      }

      // Set these properties on each update
      game.round = data.round;
      game.winningCard = data.winningCard;
      game.winningCardPlayer = data.winningCardPlayer;
      game.winnerAutopicked = data.winnerAutopicked;
      game.gameWinner = data.gameWinner;
      game.pointLimit = data.pointLimit;

      // Handle updating game.table
      if (data.table.length === 0) {
        game.table = [];
      } else {
        const added = _.difference(_.pluck(data.table, 'player'), _.pluck(game.table, 'player'));
        const removed = _.difference(_.pluck(game.table, 'player'), _.pluck(data.table, 'player'));
        for (let i = 0; i < added.length; i += 1) {
          for (let j = 0; j < data.table.length; j += 1) {
            if (added[i] === data.table[j].player) {
              game.table.push(data.table[j], 1);
            }
          }
        }
        for (let i = 0; i < removed.length; i += 1) {
          for (let k = 0; k < game.table.length; k += 1) {
            if (removed[i] === game.table[k].player) {
              game.table.splice(k, 1);
            }
          }
        }
      }

      if (game.state !== 'waiting for players to pick' || game.players.length !== data.players.length) {
        game.players = data.players;
      }

      if (newState || game.curQuestion !== data.curQuestion) {
        game.state = data.state;
      }

      if (data.state === 'waiting for czar to draw cards') {
        game.czar = data.czar;
        if (game.czar === game.playerIndex) {
          addToNotificationQueue('You\'re the czar. Please wait!');
        } else {
          addToNotificationQueue('wait for czar to shuffle');
        }
      } else
      if (data.state === 'waiting for players to pick') {
        game.czar = data.czar;
        game.curQuestion = data.curQuestion;
        // Extending the underscore within the question
        game.curQuestion.text = data.curQuestion.text.replace(/_/g, '<u></u>');

        // Set notifications only when entering state
        if (newState) {
          if (game.czar === game.playerIndex) {
            addToNotificationQueue('You\'re the Card Czar! Please wait!');
          } else if (game.curQuestion.numAnswers === 1) {
            addToNotificationQueue('Select an answer!');
          } else {
            addToNotificationQueue('Select TWO answers!');
          }
        }
      } else if (data.state === 'waiting for czar to decide') {
        if (game.czar === game.playerIndex) {
          addToNotificationQueue("Everyone's done. Choose the winner!");
        } else {
          addToNotificationQueue('The czar is contemplating...');
        }
      } else if (data.state === 'waiting for czar to draw cards') {
        if (game.czar === game.playerIndex) {
          addToNotificationQueue('Click to Draw the Cards!');
        } else {
          addToNotificationQueue('The czar is drawing the cards...');
        }
      } else if (data.state === 'winner has been chosen' &&
                game.curQuestion.text.indexOf('<u></u>') > -1) {
        game.curQuestion = data.curQuestion;
      } else if (data.state === 'awaiting players') {
        joinOverrideTimeout = $timeout(() => {
          game.joinOverride = true;
        }, 15000);
      } else if (data.state === 'game dissolved' || data.state === 'game ended') {
        game.players[game.playerIndex].hand = [];
        game.time = 0;
        const userid = $window.localStorage.id;
        const username = $window.user.name;
        const players = [];
        game.players.forEach((player) => {
          players.push(player.username);
        });
        const gameData = {
          winner: game.players[game.gameWinner].username,
          rounds: game.round,
          gameID: game.gameID,
          userName: username,
          players
        };
        if ($window.user.name === players[0]) {
          $http.post(`/api/games/${userid}/start`, gameData);
        }
      }
    });
    socket.on('notification', (data) => {
      addToNotificationQueue(data.notification);
    });

    socket.on('alert', (data) => {
      $location.url('/');
      $rootScope.popupMessage = data;
      $('#popup-modal').modal('show');
    });

    game.joinGame = function joinGame(mode, room, createPrivate) {
      mode = mode || 'joinGame';
      room = room || '';
      createPrivate = createPrivate || false;
      const userID = !!window.user ? user._id : 'unauthenticated';
      socket.emit(mode, { userID, room, createPrivate });
    };

    game.startGame = function startGame() {
      socket.emit('startGame');
    };

    game.leaveGame = function leaveGame() {
      game.players = [];
      game.time = 0;
      socket.emit('leaveGame');
    };

    game.pickCards = function pickCards(cards) {
      socket.emit('pickCards', { cards });
    };

    game.pickWinning = function pickWinning(card) {
      socket.emit('pickWinning', { card: card.id });
    };

    game.setRegion = function setRegion(region) {
      const deferred = $q.defer();
      socket.emit('setRegion', { region }, (res) => {
        if (res.success) {
          deferred.resolve(res);
        } else {
          deferred.reject(res);
        }
      });

      return deferred.promise;
    };

    game.drawCard = () => {
      socket.emit('drawCard');
    };

    decrementTime();

    return game;
  }]);

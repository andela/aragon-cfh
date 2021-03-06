const Game = require('./game');
const Player = require('./player');
require('console-stamp')(console, 'mm/dd HH:MM:ss');
const mongoose = require('mongoose');
const firebase = require('firebase');

const User = mongoose.model('User');

// firebase details
const config = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: process.env.DATABASE_URL,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
};
firebase.initializeApp(config);
const database = firebase.database();

const avatars = require('../../app/controllers/avatars.js').all();
// Valid characters to use to generate random private game IDs
const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';

module.exports = (io) => {
  let chatMessages = [];
  const allGames = {};
  const allPlayers = {};
  const onlineUsers = {};
  const userStatuses = {};
  const gamesNeedingPlayers = [];
  const invites = {};
  let gameID = 0;

  const setUserStatus = (email, id, status) => {
    userStatuses[email] = { id, status };
  };

  const getUserStatus = (email) => {
    if (userStatuses[email]) {
      return userStatuses[email].status;
    }
    return 'offline';
  };

  const getUserStatuses = (emails) => {
    const statuses = {};
    emails.forEach((email) => {
      statuses[email] = getUserStatus(email);
    });
    return statuses;
  };

  const addUser = (socket, data) => {
    onlineUsers[socket.id] = data.email;
    setUserStatus(data.email, socket.id, 'online');
  };

  const addPlayer = (socket) => {
    if (onlineUsers[socket.id]) {
      setUserStatus(onlineUsers[socket.id], socket.id, 'playing');
      console.log(onlineUsers);
      console.log(userStatuses);
    }
  };

  const removePlayer = (socket) => {
    if (onlineUsers[socket.id]) {
      setUserStatus(onlineUsers[socket.id], socket.id, 'online');
    }
  };

  const removeUser = (socket) => {
    if (onlineUsers[socket.id]) {
      setUserStatus(onlineUsers[socket.id], null, 'offline');
      delete onlineUsers[socket.id];
    }
  };

  const sendInvite = (data) => {
    if (getUserStatus(data.email) !== 'offline') {
      if (!invites[data.email]) {
        invites[data.email] = [];
      }
      invites[data.email].unshift({
        inviter: data.name,
        game: data.gameURL
      });
      // database.ref(`invites/${data.email.replace(/\./g, '%2E')}`).set(invites[data.email]);
      io.to(userStatuses[data.email].id).emit('receiveInvite', invites[data.email]);
      return { success: true };
    }
    return { success: false };
  };

  const getInvites = (data) => {
    if (invites[data.email]) {
      return {
        success: true,
        invites: invites[data.email]
      };
    }
    return { success: false };
  };

  const removeInvites = (data) => {
    if (invites[data.email]) {
      delete invites[data.email];
    }
  };

  const fireGame = (player, socket) => {
    let game;
    if (gamesNeedingPlayers.length <= 0) {
      gameID += 1;
      const gameIDStr = gameID.toString();
      game = new Game(gameIDStr, io);
      allPlayers[socket.id] = true;
      game.players.push(player);
      allGames[gameID] = game;
      gamesNeedingPlayers.push(game);
      socket.join(game.gameID);
      socket.gameID = game.gameID;
      console.log(`${socket.id} has joined newly created game ${game.gameID}`);
      addPlayer(socket);
      game.assignPlayerColors();
      game.assignGuestNames();
      game.sendUpdate();
    } else {
      game = gamesNeedingPlayers[0];
      allPlayers[socket.id] = true;
      game.players.push(player);
      console.log(`${socket.id} has joined game ${game.gameID}`);
      socket.join(game.gameID);
      socket.gameID = game.gameID;
      addPlayer(socket);
      game.assignPlayerColors();
      game.assignGuestNames();
      game.sendUpdate();
      game.sendNotification(`${player.username} has joined the game!`);
      if (game.players.length >= game.playerMaxLimit) {
        gamesNeedingPlayers.shift();
        game.state = 'waiting to start';
      }
    }
  };

  const createGameWithFriends = (player, socket) => {
    let isUniqueRoom = false;
    let uniqueRoom = '';
    // Generate a random 6-character game ID
    while (!isUniqueRoom) {
      uniqueRoom = '';
      for (let i = 0; i < 6; i += 1) {
        uniqueRoom += chars[Math.floor(Math.random() * chars.length)];
      }
      if (!allGames[uniqueRoom] && !(/^\d+$/).test(uniqueRoom)) {
        isUniqueRoom = true;
      }
    }
    console.log(`${socket.id} has created unique game ${uniqueRoom}`);
    const game = new Game(uniqueRoom, io);
    allPlayers[socket.id] = true;
    game.players.push(player);
    allGames[uniqueRoom] = game;
    socket.join(game.gameID);
    socket.gameID = game.gameID;
    addPlayer(socket);
    game.assignPlayerColors();
    game.assignGuestNames();
    game.sendUpdate();
  };

  const getGame = (player, socket, requestedGameId, createPrivate) => {
    requestedGameId = requestedGameId || '';
    createPrivate = createPrivate || false;
    console.log(`${socket.id} is requesting room ${requestedGameId}`);
    if (requestedGameId.length && allGames[requestedGameId]) {
      console.log(`Room ${requestedGameId} is valid`);
      const game = allGames[requestedGameId];
      // Ensure that the same socket doesn't try to join the same game
      // This can happen because we rewrite the browser's URL to reflect
      // the new game ID, causing the view to reload.
      // Also checking the number of players, so node doesn't crash when
      // no one is in this custom room.
      if (game.state === 'awaiting players' && (!game.players.length ||
        game.players[0].socket.id !== socket.id)) {
        // Put player into the requested game
        console.log(`Allowing player to join ${requestedGameId}`);
        allPlayers[socket.id] = true;
        game.players.push(player);
        socket.join(game.gameID);
        socket.gameID = game.gameID;
        game.assignPlayerColors();
        game.assignGuestNames();
        game.sendUpdate();
        game.sendNotification(`${player.username} has joined the game!`);
        if (game.players.length >= game.playerMaxLimit) {
          gamesNeedingPlayers.shift();
          game.state = 'waiting to start';
        }
        addPlayer(socket);
      } else {
        io.to(player.socket.id).emit('alert',
          `Sorry, game ${game.gameID} already has ${game.playerMaxLimit} players.`);
      }
    } else {
      // Put players into the general queue
      console.log(`Redirecting player ${socket.id} to general queue`);
      if (createPrivate) {
        createGameWithFriends(player, socket);
      } else {
        fireGame(player, socket);
      }
    }
  };

  const joinGame = (socket, data) => {
    const player = new Player(socket);
    data = data || {};
    player.userID = data.userID || 'unauthenticated';
    if (data.userID !== 'unauthenticated') {
      User.findOne({
        _id: data.userID
      }).exec((err, user) => {
        if (err) {
          console.log(`Err: ${err}`);
          return err; // Hopefully this never happens.
        }
        if (!user) {
          // If the user's ID isn't found (rare)
          player.username = 'Guest';
          player.avatar = avatars[Math.floor(Math.random() * 4) + 12];
        } else {
          player.username = user.name;
          player.premium = user.premium || 0;
          player.avatar = user.avatar || avatars[Math.floor(Math.random() * 4) + 12];
        }
        getGame(player, socket, data.room, data.createPrivate);
      });
    } else {
      // If the user isn't authenticated (guest)
      player.username = 'Guest';
      player.avatar = avatars[Math.floor(Math.random() * 4) + 12];
      getGame(player, socket, data.room, data.createPrivate);
    }
  };

  const exitGame = (socket) => {
    console.log(`${socket.id} has disconnected`);
    if (allGames[socket.gameID]) { // Make sure game exists
      const game = allGames[socket.gameID];
      console.log(`${socket.id} has left game ${game.gameID}`);
      delete allPlayers[socket.id];
      if (game.state === 'awaiting players' ||
        game.players.length - 1 >= game.playerMinLimit) {
        game.removePlayer(socket.id);
        if (game.state === 'waiting to start') {
          game.state = 'awaiting players';
        }
      } else {
        game.stateDissolveGame();
        for (let j = 0; j < game.players.length; j += 1) {
          game.players[j].socket.leave(socket.gameID);
        }
        game.killGame();
        delete allGames[socket.gameID];
        chatMessages = [];
      }
      if (game.players.length === 1) {
        chatMessages = [];
        game.sendUpdate();
      }
    }
    socket.leave(socket.gameID);
  };

  io.sockets.on('connection', (socket) => {
    console.log(`${socket.id} Connected`);
    socket.emit('id', { id: socket.id });
    // initialize chat when a new socket is connected
    socket.emit('initializeChat', chatMessages);

    // send recieved chat message to all connected sockets
    socket.on('chat message', (chat) => {
      allGames[socket.gameID].players.forEach(player => player.socket.emit('chat message', chat));
      chatMessages.push(chat);
      database.ref(`chat/${gameID}`).set(chatMessages);
    });

    socket.on('pickCards', (data) => {
      console.log(socket.id, 'picked', data);
      if (allGames[socket.gameID]) {
        allGames[socket.gameID].pickCards(data.cards, socket.id);
      } else {
        console.log('Received pickCard from', socket.id, 'but game does not appear to exist!');
      }
    });

    socket.on('pickWinning', (data) => {
      if (allGames[socket.gameID]) {
        allGames[socket.gameID].pickWinning(data.card, socket.id);
      } else {
        console.log(`Received pickWinning from ${socket.id} but game does not appear to exist!`);
      }
    });

    socket.on('joinGame', (data) => {
      if (!allPlayers[socket.id]) {
        joinGame(socket, data);
      }
    });

    socket.on('joinNewGame', (data) => {
      exitGame(socket);
      joinGame(socket, data);
    });

    socket.on('setRegion', (data, fn) => {
      if (allGames[socket.gameID]) {
        const thisGame = allGames[socket.gameID];
        console.log(`Setting region for game ${socket.gameID}`);
        thisGame.setRegion(data.region);
        fn({ success: true });
      }
    });

    socket.on('startGame', () => {
      if (allGames[socket.gameID]) {
        const thisGame = allGames[socket.gameID];
        console.log(`Comparing ${thisGame.players[0].socket.id} with ${socket.id}`);
        if (thisGame.players.length >= thisGame.playerMinLimit) {
          // Remove this game from gamesNeedingPlayers so new players can't join it.
          gamesNeedingPlayers.forEach((game, index) => {
            if (game.gameID === socket.gameID) {
              return gamesNeedingPlayers.splice(index, 1);
            }
          });
          thisGame.prepareGame();
          thisGame.sendNotification('The game has begun!');
        }
      }
    });

    socket.on('leaveGame', () => {
      exitGame(socket);
      removePlayer(socket);
      console.log(onlineUsers);
      console.log(userStatuses);
    });

    socket.on('disconnect', () => {
      console.log(`Rooms on Disconnect: ${io.sockets.adapter.rooms}`);
      exitGame(socket);
      removeUser(socket);
      console.log(onlineUsers);
      console.log(userStatuses);
    });

    socket.on('drawCard', () => {
      allGames[socket.gameID].drawCard(allGames[socket.gameID]);
    });

    socket.on('login', (data) => {
      addUser(socket, data);
      console.log(onlineUsers);
      console.log(userStatuses);
    });

    socket.on('logout', () => {
      removeUser(socket);
      console.log(onlineUsers);
      console.log(userStatuses);
    });

    socket.on('getStatus', (data, fn) => {
      fn(getUserStatus(data.email));
    });

    socket.on('getStatuses', (data, fn) => {
      fn(getUserStatuses(data));
    });

    socket.on('sendInvite', (data, fn) => {
      fn(sendInvite(data));
    });

    socket.on('getInvites', (data, fn) => {
      fn(getInvites(data));
    });

    socket.on('readInvites', (data) => {
      removeInvites(data);
    });
  });
};

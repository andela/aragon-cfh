// User Routes
const users = require('../app/controllers/users'),
  jwt = require('./jwt'),
  answers = require('../app/controllers/answers'),
  questions = require('../app/controllers/questions'),
  avatars = require('../app/controllers/avatars'),
  index = require('../app/controllers/index'),
  disableTour = require('../app/controllers/disable-tour');

const startGame = require('../app/controllers/start-game');
const middleware = require('./middlewares/authorization');

module.exports = (app, passport) => {
  app.get('/signin', users.signin);
  app.get('/signup', users.signup);
  app.get('/chooseavatars', users.checkAvatar);
  app.get('/signout', users.signout);

    // Setting up the users api
  app.post('/users', users.create);
  app.post('/users/avatars', users.avatars);

    // Donation Routes
  app.post('/donations', users.addDonation);

  app.post('/users/session', passport.authenticate('local', {
    failureRedirect: '/signin',
    failureFlash: 'Invalid email or password.'
  }), users.session);

  app.get('/users/me', users.me);
  app.get('/users/:userId', users.show);

    // Setting the facebook oauth routes
  app.get('/auth/facebook', passport.authenticate('facebook', {
    scope: ['email'],
    failureRedirect: '/signin'
  }), users.signin);

  app.get('/auth/facebook/callback', passport.authenticate('facebook', {
    failureRedirect: '/signin'
  }), users.authCallback);

    // Setting the github oauth routes
  app.get('/auth/github', passport.authenticate('github', {
    failureRedirect: '/signin'
  }), users.signin);

  app.get('/auth/github/callback', passport.authenticate('github', {
    failureRedirect: '/signin'
  }), users.authCallback);

    // Setting the twitter oauth routes
  app.get('/auth/twitter', passport.authenticate('twitter', {
    failureRedirect: '/signin'
  }), users.signin);

  app.get('/auth/twitter/callback', passport.authenticate('twitter', {
    failureRedirect: '/signin'
  }), users.authCallback);

    // Setting the google oauth routes
  app.get('/auth/google', passport.authenticate('google', {
    failureRedirect: '/signin',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ]
  }), users.signin);

  app.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/signin'
  }), users.authCallback);

    // Finish with setting up the userId param
  app.param('userId', users.user);

    // Answer Routes
  app.get('/answers', answers.all);
  app.get('/answers/:answerId', answers.show);
    // Finish with setting up the answerId param
  app.param('answerId', answers.answer);

    // Question Routes
  app.get('/questions', questions.all);
  app.get('/questions/:questionId', questions.show);
    // Finish with setting up the questionId param
  app.param('questionId', questions.question);

    // Avatar Routes
  app.get('/avatars', avatars.allJSON);

    // Home route
  app.get('/play', index.play);
  app.get('/', index.render);

  // JWT API endpoint
  app.post('/api/auth/login', jwt.authToken);
  app.post('/api/auth/signup', jwt.create);

  // APIs
  const searchUsers = require('../app/controllers/search-users');
  const inviteUsers = require('../app/controllers/send-invite.js');
  app.get('/api/search/users', searchUsers);
  app.post('/api/invite', inviteUsers);
  app.post('/api/disabletour', disableTour);

  // End point route
  app.post('/api/games/:id/start', middleware.requiresLogin, startGame.saveRecords);
  const game = require('../app/controllers/gamelog');
  app.post('/api/games/history', game.gamelog);
};

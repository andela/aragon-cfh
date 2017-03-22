/**
 * Module dependencies.
 */
const express = require('express'),
  fs = require('fs'),
  passport = require('passport'),
  logger = require('mean-logger'),
  io = require('socket.io'),
  path = require('path');
require('dotenv').load();
/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */
// Load configurations
// if test env, load example file
const env = process.env.NODE_ENV = process.env.NODE_ENV || 'development',
  config = require('./config/config'),
  auth = require('./config/middlewares/authorization'),
  mongoose = require('mongoose');

// Bootstrap db connection
const db = mongoose.connect(process.env.MONGOHQ_URL);

// Bootstrap models
const modelsPath = path.join(__dirname, '/app/models');
const walk = (pathway) => {
  fs.readdirSync(pathway).forEach((file) => {
    const newPath = path.join(pathway, '/', file);
    const stat = fs.statSync(newPath);
    if (stat.isFile()) {
      if (/(.*)\.(js|coffee)/.test(file)) {
        require(newPath);
      }
    } else if (stat.isDirectory()) {
      walk(newPath);
    }
  });
};
walk(modelsPath);
// bootstrap passport config
require('./config/passport')(passport);

const app = express();
app.use((req, res, next) => {
  next();
});
// express settings
require('./config/express')(app, passport, mongoose);

// JWT route
require('./config/jwtRoute')(app);

// Bootstrap routes
require('./config/routes')(app, passport, auth);
// Start the app by listening on <port>
const port = config.port;
const server = app.listen(port);
const ioObj = io.listen(server, { log: false });
// game logic handled here
require('./config/socket/socket')(ioObj);

console.log('Express app started on port ', port);
// Initializing logger
logger.init(app, passport, mongoose);
// expose app
module.exports = app;
exports = app;

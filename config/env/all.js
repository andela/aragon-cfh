const path = require('path');

const rootPath = path.normalize(path.join(__dirname, '/../..'));


module.exports = {
  root: rootPath,
  port: process.env.PORT || 8000,
  db: process.env.MONGOHQ_URL,
  secret: process.env.JWTSECRET
};

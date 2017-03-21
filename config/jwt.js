const jwt    = require('jsonwebtoken');
const mongoose = require('mongoose');
const expiryDate = '1440m';//24hours
const secret =  'ilovescotchyscotch';
const User = mongoose.model('User');
 //routing process to authenticate users and generate token
 exports.authToken = (req, res) => {
    // find the user
    User.findOne({
        email: req.body.email
    },(error, existingUser)=>{
    if (error) throw error;
    if (!existingUser){
        res.status(403).json({
          message: 'User not found.',
          email: req.body.email });
      } else if (existingUser){

        if(!existingUser.authenticate(req.body.password)) {
            return res.status(403).json({
                message: 'Invalid Password'
            });
        }
        // Create the token
        let token = jwt.sign(existingUser, secret, {
        });
        // return the token as JSON
        res.status(200).json({
          token: token
        });
      }
    });
  };
// Routing process of the middleware to verify a user token
  exports.checkToken = (req, res, next) => {
    // checking header or url parameters or post parameters for token
    let token = req.body.token || req.query.token ||
      req.headers['x-access-token'];
    // decoding the token
    if(token){
      // verifies secret and checks 
      jwt.verify(token, secret, (error, decoded) => {
        if (error) {
          return res.status(403).json({
            message: 'Failed to authenticate token.' });
        } else {
          // if the authentication process was succesful, save to request for use in other routes
          req.decoded = decoded;
          next();
        }
      });
    }
    else{
      // if there is no token available
      // return an error
      return res.status(403).send({
        message: 'No token returned.'
      });
    }
  };
//requires
var mongoose = require('mongoose');
var passport = require('passport');
var Strategy = require('passport-local');

//create an authentication strategy using the user schema
var User = mongoose.model('User');

passport.use(new Strategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

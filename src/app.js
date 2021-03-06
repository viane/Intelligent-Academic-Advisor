var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
//var session = require ('express-session'); //commented because twitter signin disabled
var authenticate = require('./authenticate');
var config = require('./config');
var uploadfile = require('express-fileupload');

const flash = require('connect-flash');
const nodemon = require('nodemon');

mongoose.connect(config.mongoUrl);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    // we're connected!
    console.log("Connected correctly to DB");
});

var app = express();

//redirect to https server disabled!
// app.all('*', function(req, res, next){
//   console.log('req start: ',req.secure, req.hostname, req.url, app.get('port'));
//   if (req.secure) {
//     return next();
//   };

//  res.redirect('https://'+req.hostname+':'+app.get('secPort')+req.url);
// });
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(uploadfile());
// passport config
//app.use(session({secret:config.secret, resave: false, saveUninitialized:false}));//commented because twitter signin disabled
app.use(passport.initialize());
//app.use(passport.session());//commented because twitter signin disabled
app.use(express.static(path.join(__dirname, 'views'))); // front end
app.use('/dev-center',express.static(path.join(__dirname, 'doc/API/build'))); // API doc
require('./routes/index')(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  });
});

// init routes


module.exports = app;

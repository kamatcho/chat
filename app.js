var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

var  usernames = [];
// Socket Io
server.listen(process.env.PORT || 3000);
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/views/index.html');
});

io.on('connection', function (socket) {
    socket.on('new user' , function (data , callback) {
        if (usernames.indexOf(data) != -1) {
            callback(false);
        }else  {
            callback(true);
            socket.username = data;
            usernames.push(socket.username)
            updateUsername()
        }
    });

    // Update Username
    function updateUsername() {
        io.sockets.emit('usernames', usernames);
    }
    // Send Message
    socket.on('send message' , function (data) {
        io.sockets.emit('new message', {msg : data , user : socket.username})
    })
    // Disconnect
    socket.on('disconnect' , function (data) {
        if (!socket.username) return;
        usernames.splice(usernames.indexOf(data));
        updateUsername();
    })
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public/javascripts'));
app.get('/', function (req , res) {
    res.sendFile(__dirname + '/views/index.html')
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

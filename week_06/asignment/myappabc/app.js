var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// variable router

// SESSION_06 BELOW
// var indexRouter = require('./routes/index'); // Menggunakan f-ile index.js untuk rute utama
// var aboutRouter = require('./routes/about'); // Menambahkan rute untuk halaman about
// var usersRouter = require('./routes/users');
// var profileRouter = require('./routes/profile'); // Define a new router for profile

// SESSION_07 BELLOW
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// SESSION_06 BELLOW
// app.use('/', indexRouter);
// app.use('/register', registerRouter); // FIX: Menggunakan path URL '/register'
// app.use('/about', aboutRouter); // Mengarahkan path '/about' ke aboutRouter
// app.use('/users', usersRouter); // ,engarahkan path '/users' ke usersRouter'
// app.use('/users/profile', profileRouter); // Mengarahkan path '/users/profile' ke profileRouter

// SESSION_07 BELLOW
app.use('/', indexRouter);
app.use('/users', usersRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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

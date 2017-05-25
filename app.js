let express = require('express')
let path = require('path')
let logger = require('morgan')
// Uncomment after installing 'serve-favicon' module.
// let favicon = require('serve-favicon')

let app = express()

// View engine - Jade/Pug - setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// Uncomment after installing 'serve-favicon' module and placing a favicon.
// app.use(favicon(path.join(__dirname, 'public', '/img/favicon.ico')))

// The logger module is 'morgan'
app.use(logger('tiny'))

// Locate & use static files
app.use(express.static(path.join(__dirname, 'public')))

// Use index route
app.use('/', index)

/**
 * GET home page.
 */
app.get('/', (req, res, next) => {
  res.render('index')
})
/**
 * User requests a url.
 */
app.get(/^\/(.+)/, (req, res, next) => {
  // Enter your SoundCloud API key here.
  res.render('index', { soundcloudURL: req.params['0'], CLIENT_ID: '' })
})

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  let err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development'
    ? err
    : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

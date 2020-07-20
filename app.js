const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const handlebars = require('express-handlebars').create({ defaultLayout: 'main' })
const mongoose = require('mongoose')

const opts = {
  useNewUrlParser: true,
  useUnifiedTopology: true
}

const User = require('./models/user')
const credentials = require('./credentials')

require('dotenv').config()

const app = express()

// Environment

const PORT = process.env.PORT || 8080

switch (app.get('env')) {
  case 'development':
    mongoose.connect(credentials.mongo.development.connectionUrl, opts)
    break
  case 'production':
    mongoose.connect(credentials.mongo.production.connectionUrl, opts)
    break
  default:
    throw new Error(`Unknown environment: ${app.get('env')}`)
}

// Seeding

// eslint-disable-next-line array-callback-return
User.find((err, users) => {
  if (err) console.error(err)
  if (users.length) return

  const user = new User
  user.email = 'felizkatus@gmail.com'
  user.password = Buffer.from('password').toString('base64')
  user.save()
})

// Handlebars

app.engine('handlebars', handlebars.engine)
app.set('view engine', 'handlebars')

// Static

app.use(express.static(path.join(__dirname, 'public')))

// URL encoding

app.use(bodyParser.urlencoded({ extended: false }))

// Cookies and Sessions

app.use(require('cookie-parser')(credentials.cookieSecret))
app.use(
  require('express-session')({
    resave: false,
    saveUninitialized: false,
    secret: credentials.cookieSecret
  })
)

// Flash

app.use((req, res, next) => {
  res.locals.flash = req.session.flash
  delete req.session.flash
  next()
})

// Routing

app.get('/', (req, res) => {
  res.render('login', { layout: null })
})

app.post('/', (req, res) => {
  const loggingUser = req.body

  User.findOne({ email: loggingUser.email }).then((existingUser) => {
    if (existingUser) {
      if (loggingUser.password === Buffer.from(existingUser.password, 'base64').toString('ascii')) {
        res.cookie('logged_in', true, { signed: true, httpOnly: true })
        res.render('profile')
      } else {
        req.session.flash = {
          intro: '¡Error de verificación!',
          message: 'Contraseña incorrecta.'
        }
        res.redirect(303, '/')
      }
    } else {
      req.session.flash = {
        intro: '¡Error de verificación!',
        message: 'Usuario no encontrado.'
      }
      res.redirect(303, '/')
    }
  })
})

app.get('/forgot', (req, res) => {
  res.render('forgot', { layout: null })
})

app.post('/forgot', (req, res) => {})

app.get('/profile', (req, res) => {
  if (req.signedCookies.logged_in) {
    res.render('profile')
  } else {
    req.session.flash = {
      intro: '¡Error de verificación!',
      message: 'Por favor, inicia la sesión.'
    }
    res.redirect(303, '/')
  }
})

app.get('/users', (req, res) => {
  if (req.signedCookies.logged_in) {
    res.render('users')
  } else {
    req.session.flash = {
      intro: '¡Error de verificación!',
      message: 'Por favor, inicia la sesión.'
    }
    res.redirect(303, '/')
  }
})

app.post('/logout', (req, res) => {
  res.clearCookie('logged_in')
  req.session.flash = {
    intro: '¡Felicidades!',
    message: 'Estás desconectado.'
  }
  res.redirect(303, '/')
})

app.listen(PORT, () => {
  console.log(`Server started in ${app.get('env')} mode at http://localhost:${PORT}`)
})

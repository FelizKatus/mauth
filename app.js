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

User.find((err, users) => {
  if (err) console.error(err)
  if (users.length) return

  const user = new User
  user.email = 'felizkatus@gmail.com'
  user.password = 'password'
  user.save()
})

// Handlebars

app.engine('handlebars', handlebars.engine)
app.set('view engine', 'handlebars')

// Static

app.use(express.static(path.join(__dirname, 'public')))

// URL encoding

app.use(bodyParser.urlencoded({ extended: false }))

// Cookies

app.use(require('cookie-parser')(credentials.cookieSecret))

// Flash

// app.use((req, res, next) => {
//   res.locals.flash = req.session.flash
//   delete req.session.flash
//   next()
// })

// Routing

app.get('/', (req, res) => {
  res.render('login', { layout: null })
})

app.post('/', (req, res) => {
  const loggingUser = req.body

  User.findOne({ email: loggingUser.email }).then((existingUser) => {
    if (existingUser) {
      if (loggingUser.password === existingUser.password) {
        res.cookie('logged_in', true, { signed: true, httpOnly: true })
        res.render('profile')
      }
    } else {
      res.send('User not found')
    }
  })
})

app.get('/profile', (req, res) => {
  if (req.signedCookies.logged_in) {
    res.render('profile')
  } else {
    res.send('Please, log in')
  }
})

app.get('/users', (req, res) => {
  if (req.signedCookies.logged_in) {
    res.render('users')
  } else {
    res.send('Please, log in')
  }
})

app.post('/logout', (req, res) => {
  res.clearCookie('logged_in')
  res.send('Please, log in')
})

app.listen(PORT, () => {
  console.log(`Server started in ${app.get('env')} mode at http://localhost:${PORT}`)
})

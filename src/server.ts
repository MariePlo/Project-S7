//import functions
import express = require('express')
import { Metric, MetricsHandler } from './metrics'
import path = require('path')
import bodyparser = require('body-parser')
import session = require('express-session')
import levelSession = require('level-session-store')

const app = express()
const port: string = process.env.PORT || '8080'
app.use(express.static(path.join(__dirname, '/../public')))

app.set('views', __dirname + "/../views")
app.set('view engine', 'ejs');

app.use(bodyparser.json())
app.use(bodyparser.urlencoded())

const dbMet: MetricsHandler = new MetricsHandler('./db/metrics')  //create or open a levelDB database

app.post('/metrics/:id', (req: any, res: any) => {
  dbMet.save(req.params.id, req.body, (err: Error | null) => {
    if (err) throw err
    res.status(200).send('ok')
  })
})

//Get metrics
app.get('/metrics/:id', (req: any, res: any) => {
  dbMet.getAll(
    req.params.id, (err: Error | null, metrics: Metric[] | null) => {
    if (err) throw err
    if (metrics !== null) {
      let DATA : object[]= []
      metrics.sort(function(a : Metric, b : Metric) { 
        if (Number(a.timestamp) > Number(b.timestamp)) {
          return 1;
        }
        if (Number(a.timestamp) < Number(b.timestamp)) {
          return -1;
        }
        return 0;
      });
      metrics.forEach((data)=> {
        DATA.push({timestamp :Number(data.timestamp), value : Number(data.value)})
      })
      if (DATA.length == 0) res.status(404).render('error.ejs', {})
      else res.status(200).send(DATA)
    }
    
  })
})


const LevelStore = levelSession(session)

//
app.use(session({
  secret: 'my very secret phrase',
  store: new LevelStore('./db/sessions'),
  resave: true,
  saveUninitialized: true
}))

import { UserHandler, User } from './user'
import { read } from 'fs'
const dbUser: UserHandler = new UserHandler('./db/users') //create or open a levelDB database
const authRouter = express.Router()

//Route to login
authRouter.get('/login', (req: any, res: any) => {
  let notFoundErr : string = ""
  let pwdErr : string = ""
  res.render('login.ejs', {notFoundErr : notFoundErr, pwdErr : pwdErr})
})

//Route to home
authRouter.get('/home', (req: any, res: any) => {
  let notFoundErr : string = ""
  let pwdErr : string = ""
  res.render('home.ejs', {notFoundErr : notFoundErr, pwdErr : pwdErr})
})

//Route to sign up
authRouter.get('/signup', (req: any, res: any) => {
  let existErr : string = ""
  let emptyErr : string = ""
  res.render('signup.ejs', { existErr: existErr, emptyErr : emptyErr})
})

//Route to log out
authRouter.get('/logout', (req: any, res: any) => {
  delete req.session.loggedIn
  delete req.session.user
  res.redirect('/login')
})

//Post for new user
authRouter.post('/signup', (req: any, res: any, next: any) => {
  let existErr : string = ""
  let emptyErr : string = ""

  dbUser.get(req.body.username, function (err: Error | null, result?: User) {
    if (!err || result !== undefined) {
      existErr = "Username already taken, try another one"
      res.render('signup.ejs', { existErr: existErr, emptyErr : emptyErr})
    } else if (req.body.username === "" || req.body.email === "" || req.body.password === "") {
      emptyErr = "You forgot a field"
      res.render('signup.ejs', { existErr: existErr, emptyErr : emptyErr})
    } else {
      const user : User = new User(req.body.username, req.body.email, req.body.password)
      dbUser.save(user, function (err: Error | null) {
        dbUser.get(req.body.username, (err: Error | null, result?: User) => {
          if (err) {
            next(err)
          }
          else {
            req.session.loggedIn = true
            req.session.user = result
            res.redirect('/')
          }
        })
      })
    }
  })
})

//Post login
authRouter.post('/login', (req: any, res: any, next: any) => {
  let notFoundErr : string = ""
  let pwdErr : string = ""

  dbUser.get(req.body.username, (err: Error | null, result?: User) => {
    if (err || result === undefined) {
      notFoundErr = "Wrong username"
      res.render('login.ejs', {notFoundErr : notFoundErr, pwdErr : pwdErr})
    } else if (!result.validatePassword(req.body.password))  {
      pwdErr = "Wrong password"
      res.render('login.ejs', {notFoundErr : notFoundErr, pwdErr : pwdErr})
    } else {
      req.session.loggedIn = true
      req.session.user = result
      res.redirect('/')
    }
  })
})

//Post delete metric
authRouter.post('/delete', (req: any, res: any, next: any) => {
  if (!isNaN(Number(req.body.timestamp)) && req.body.timestamp !=="") {
    dbMet.delete(req.session.user.username, req.body.timestamp, (err: Error | null) => {
      if (err) throw err;
      res.redirect('/')
    })
  }
})

//Post add a new metric
authRouter.post('/add', (req: any, res: any, next: any) => {
  if (req.body.timestamp !=="" && req.body.value !=="" && !isNaN(Number(req.body.value)) && !isNaN(Number(req.body.timestamp))) {
    dbMet.add(req.session.user.username, req.body.timestamp, req.body.value)
    res.redirect('/')
  }
})

//Post convert datetime
authRouter.post('/convert', (req: any, res: any, next: any) => {
  var time : string = String(new Date(req.body.dateTime).getTime())
  var Datetime : string = "The timestamp of "+req.body.dateTime+" is : "+time+""
  var Timestamp : string = ""
  res.render('index', { name: req.session.user.username, datetime : Datetime, timestamp : Timestamp})
})

//Post convert timestamp
authRouter.post('/convert2', (req: any, res: any, next: any) => {
  var Datetime: string = ""
  var Timestamp : string = ""
  if (!isNaN(Number(req.body.timestamp)) && req.body.timestamp !== "") {
    var time : string = String(new Date(Number(req.body.timestamp)).toLocaleString())
    Timestamp = "The datetime of "+req.body.timestamp+" is : "+time+""
  }
  res.render('index', { name: req.session.user.username, datetime : Datetime, timestamp : Timestamp})
})

app.use(authRouter)

const userRouter = express.Router()

//Post add user
userRouter.post('/', (req: any, res: any, next: any) => {
  dbUser.get(req.body.username, function (err: Error | null, result?: User) {
    if (!err || result !== undefined) {
      res.status(409).send("user already exists")
    } else {
      let user = new User(req.body.username, req.body.email, req.body.password)
      dbUser.save(req.body, function (err: Error | null) {
        if (err) next(err)
        else {
          res.status(201).send("user persisted")
        }
      })
    }
  })
})

//Get with username
userRouter.get('/:username', (req: any, res: any, next: any) => {
  dbUser.get(req.params.username, function (err: Error | null, result?: User) {
    if (err || result === undefined) {
      res.status(404).render('error.ejs', {});
    } else res.status(200).json(result)
  })
})

app.use('/user', userRouter)

//if logged in
const authCheck = function (req: any, res: any, next: any) {
  if (req.session.loggedIn) {
    next()
  } else res.redirect('/home')
}

//go to profile
app.get('/', authCheck, (req: any, res: any) => {
  var datetime : string = ""
  var timestamp : string = ""
  res.render('index', { name: req.session.user.username, datetime : datetime, timestamp : timestamp})
})

//Wrong url
app.use(function(req, res, next){
  res.status(404).render('error.ejs', {});
});

//Port
app.listen(port, (err: Error) => {
  if (err) {
    throw err
  }
  console.log(`Server is running on http://localhost:${port}`)
})
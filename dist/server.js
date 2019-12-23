"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var metrics_1 = require("./metrics");
var path = require("path");
var bodyparser = require("body-parser");
var session = require("express-session");
var levelSession = require("level-session-store");
var app = express();
var port = process.env.PORT || '8082';
app.use(express.static(path.join(__dirname, '/../public')));
app.set('views', __dirname + "/../views");
app.set('view engine', 'ejs');
app.use(bodyparser.json());
app.use(bodyparser.urlencoded());
var dbMet = new metrics_1.MetricsHandler('./db/metrics'); //create or open a levelDB database
/*Add data from Postman*/
app.post('/metrics/:id', function (req, res) {
    dbMet.save(req.params.id, req.body, function (err) {
        if (err)
            throw err;
        res.status(200).send('ok');
    });
});
/*Get user's metrics (don't need to be connected)*/
app.get('/metrics/:id', function (req, res) {
    dbMet.getAll(req.params.id, function (err, metrics) {
        if (err)
            throw err;
        if (metrics !== null) {
            var DATA_1 = [];
            metrics.sort(function (a, b) {
                if (Number(a.timestamp) > Number(b.timestamp)) {
                    return 1;
                }
                if (Number(a.timestamp) < Number(b.timestamp)) {
                    return -1;
                }
                return 0;
            });
            metrics.forEach(function (data) {
                DATA_1.push({ timestamp: Number(data.timestamp), value: Number(data.value) });
            });
            if (DATA_1.length == 0)
                res.status(404).render('error.ejs', {});
            else
                res.status(200).send(DATA_1);
        }
    });
});
var LevelStore = levelSession(session);
app.use(session({
    secret: 'my very secret phrase',
    store: new LevelStore('./db/sessions'),
    resave: true,
    saveUninitialized: true
}));
var user_1 = require("./user");
var dbUser = new user_1.UserHandler('./db/users'); //create or open a levelDB database
var authRouter = express.Router();
authRouter.get('/login', function (req, res) {
    var notFoundErr = "";
    var pwdErr = "";
    res.render('login.ejs', { notFoundErr: notFoundErr, pwdErr: pwdErr });
});
authRouter.get('/signup', function (req, res) {
    var existErr = "";
    var emptyErr = "";
    res.render('signup.ejs', { existErr: existErr, emptyErr: emptyErr });
});
authRouter.get('/logout', function (req, res) {
    delete req.session.loggedIn;
    delete req.session.user;
    res.redirect('/login');
});
authRouter.post('/signup', function (req, res, next) {
    var existErr = "";
    var emptyErr = "";
    /*The code below use dbUser.get(...) twice
    The first use is to check out if the username is already in the database or not
    The second time is to get new user's data to get into its profile page*/
    dbUser.get(req.body.username, function (err, result) {
        if (!err || result !== undefined) {
            //if the username is not found in the db, then display existErr message
            existErr = "Username already exists !";
            res.render('signup.ejs', { existErr: existErr, emptyErr: emptyErr });
        }
        else if (req.body.username === "" || req.body.email === "" || req.body.password === "") {
            //if one of the fields was empty, then display emptyErr message
            emptyErr = "One of the fields was empty !";
            res.render('signup.ejs', { existErr: existErr, emptyErr: emptyErr });
        }
        else {
            //all the fields are correct, start to save the new user in the database
            var user = new user_1.User(req.body.username, req.body.email, req.body.password);
            dbUser.save(req.body, function (err) {
                //console.log("SUCCESSFULLY ADDED!!!")
                dbUser.get(req.body.username, function (err, result) {
                    //console.log(result) 
                    if (err) {
                        next(err);
                    }
                    else {
                        req.session.loggedIn = true;
                        req.session.user = result;
                        res.redirect('/');
                    }
                });
            });
        }
    });
});
authRouter.post('/login', function (req, res, next) {
    var notFoundErr = "";
    var pwdErr = "";
    dbUser.get(req.body.username, function (err, result) {
        if (err || result === undefined) {
            notFoundErr = "User not found. Unknown username";
            res.render('login.ejs', { notFoundErr: notFoundErr, pwdErr: pwdErr });
        }
        else if (!result.validatePassword(req.body.password)) {
            pwdErr = "Wrong password. Try again !";
            res.render('login.ejs', { notFoundErr: notFoundErr, pwdErr: pwdErr });
        }
        else {
            //console.log("SUCCESSFULLY CONNECTED!!!")
            req.session.loggedIn = true;
            req.session.user = result;
            res.redirect('/');
        }
    });
});
//delete a user's metric
authRouter.post('/delete', function (req, res, next) {
    if (!isNaN(Number(req.body.timestamp)) && req.body.timestamp !== "") {
        dbMet.delete(req.session.user.username, req.body.timestamp);
        res.redirect('/');
    }
});
//Add a new metric in user's database
authRouter.post('/add', function (req, res, next) {
    if (req.body.timestamp !== "" && req.body.value !== "" && !isNaN(Number(req.body.value)) && !isNaN(Number(req.body.timestamp))) {
        dbMet.add(req.session.user.username, req.body.timestamp, req.body.value);
        res.redirect('/');
    }
});
//Convert datetime into timestamp
authRouter.post('/convert', function (req, res, next) {
    var time = String(new Date(req.body.dateTime).getTime());
    var Datetime = "The timestamp of " + req.body.dateTime + " is : " + time + "";
    var Timestamp = "";
    res.render('index', { name: req.session.user.username, datetime: Datetime, timestamp: Timestamp });
});
//Convert timestamp into datetime 
authRouter.post('/convert2', function (req, res, next) {
    var Datetime = "";
    var Timestamp = "";
    if (!isNaN(Number(req.body.timestamp)) && req.body.timestamp !== "") {
        var time = String(new Date(Number(req.body.timestamp)).toLocaleString());
        Timestamp = "The datetime of " + req.body.timestamp + " is : " + time + "";
    }
    res.render('index', { name: req.session.user.username, datetime: Datetime, timestamp: Timestamp });
});
app.use(authRouter); //enable the middleware of express.Router()
var userRouter = express.Router();
//FOR ADDING A NEW USER FROM POSTMAN
userRouter.post('/', function (req, res, next) {
    dbUser.get(req.body.username, function (err, result) {
        if (!err || result !== undefined) {
            res.status(409).send("user already exists");
        }
        else {
            var user = new user_1.User(req.body.username, req.body.email, req.body.password);
            dbUser.save(req.body, function (err) {
                if (err)
                    next(err);
                else {
                    res.status(201).send("user persisted");
                }
            });
        }
    });
});
//CHECK WHAT I GOT WITH THE KEY USERNAME
userRouter.get('/:username', function (req, res, next) {
    dbUser.get(req.params.username, function (err, result) {
        if (err || result === undefined) {
            res.status(404).render('error.ejs', {});
        }
        else
            res.status(200).json(result);
    });
});
app.use('/user', userRouter);
var authCheck = function (req, res, next) {
    if (req.session.loggedIn) {
        next();
    }
    else
        res.redirect('/login');
};
//if the user is authenticated, then go to its profile page with its metrics
app.get('/', authCheck, function (req, res) {
    var datetime = "";
    var timestamp = "";
    res.render('index', { name: req.session.user.username, datetime: datetime, timestamp: timestamp });
});
//Display an error page if the URL is unknown
app.use(function (req, res, next) {
    res.status(404).render('error.ejs', {});
});
app.listen(port, function (err) {
    if (err) {
        throw err;
    }
    console.log("Server is running on http://localhost:" + port);
});

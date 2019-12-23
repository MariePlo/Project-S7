import express = require('express');
import level = require('level');
import path = require('path');
const db = level('users');
const port: string = process.env.PORT || '8080'
const app = express()
//app.set('views', __dirname + "/views")
app.use(express.static(path.join(__dirname, 'public')))

app.use(express.urlencoded());
app.set('view engine', 'ejs');

app.get("/", function(req, res)
{
	res.writeHead(200, {"Content-Type":"text/html"});
	res.write("<!DOCTYPE html" + "<html>" + "<head>" + "<meta charset='utf-8' />" + "<title>" + "titre" + "</title>" +
		"</head>" + "<body>" + "<form method='post', action='/submit'>" + "<div>" + "<label for ='username'>Username</label>" + "<input type='text' id='username' name='username'>" + "</div>" + 
		"<div>"+ "<label for ='password'>password</label>" + "<input type='password' id='password' name='password'>" + "</div>" + "<button type='submit'>Submit</button>" +"</form>" + "</body>" + "</html>");
});


app.post('/submit', (req, res) => {
	
	const username = req.body.username;
	const password = req.body.password;

	db.put('username', username, function (err) {
		if (err) return console.log('Ooops!', err) // some kind of I/O error
	  
		// 3) Fetch by key
		db.get('username', function (err, value) {
		  if (err) return console.log('Ooops!', err) // likely the key was not found
	  
		  // Ta da!
		  console.log('name=' + value)
		})
	  })
	module.exports.username=username;
	module.exports.loggedIn=false;
	console.log(username);
	console.log(password);
	res.redirect("/home");
});

app.get('/home', function(req, res)
{
	res.render('home', {name:module.exports.username, loggedIn:module.exports.loggedIn});
});


app.listen(port);
console.log(`server is listening on port ${port}`);


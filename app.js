var express = require("express");
var app = express();
app.use(express.urlencoded());
app.set('view engine', 'ejs');

app.get("/", function(req, res)
{
	res.writeHead(200, {"Content-Type":"text/html"});
	res.write("<!DOCTYPE html" + "<html>" + "<head>" + "<meta charset='utf-8' />" +
		"</head>" + "<body>" + "<form method='post', action='/submit'>" + "<div>" + "<label for ='username'>Username</label>" + "<input type='text' id='username' name='username'>" + "</div>" + 
		"<div>"+ "<label for ='password'>password</label>" + "<input type='password' id='password' name='password'>" + "</div>" + "<button type='submit'>Submit</button>" +"</form>" + "</body>" + "</html>");
});


app.post('/submit', (req, res) => {
	const username = req.body.username;
	const password = req.body.password;
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


app.listen(8080);
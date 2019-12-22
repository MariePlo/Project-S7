module.exports = function(username, password, loggedIn)
{
	this.username=username;
	this.password=password;
	this.loggedIn=loggedIn;

	this.getUsername=function()
	{
		return this.username;
	}

	this.getPassword=function()
	{
		return this.password;
	}

	this.getLoggedIn=function()
	{
		return this.loggedIn;
	}

	this.setUsername=function(username)
	{
		this.username=username;
	}

	this.setPassword=function(password)
	{
		this.password=password;
	}

	this.setLoggedIn=function(loggedIn)
	{
		this.loggedIn=loggedIn;
	}
}

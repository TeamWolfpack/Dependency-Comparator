var express = require('express');
var portscanner = require('portscanner');
var path = require("path");
var open = require("open");
var http = require("http"); //this is needed
var app = express();
var server;

//use .html extension instead of .ejs
app.engine('html', require('ejs').renderFile);

//set the view engine to .html
app.set('view engine', 'html');

//sets the default port
app.set("port", 45000);

//set the view directory to /html
app.set('views', path.normalize(__dirname + "/../html"));

//link css, js, and other files to express
app.use(express.static(path.normalize(__dirname + "/../html")));

function start(table){
	app.get('/', function (req, res) {
		res.render("dep-tool", { table: JSON.stringify(table) });
	});
	
	portscanner.findAPortNotInUse(45000, 45100, "127.0.0.1", function(err, port){
		server = app.listen(port, function () {
			console.log('Listening on localhost:' + port);
			app.set("port", port);
			openHTML(table);
		});
	});
	
}

function openHTML(table){
	try {
		open("http://localhost:" + app.get("port"));
		return true;
	}catch(err){
		return false;
	}
}

module.exports = {
    start: start,
	open: openHTML
};
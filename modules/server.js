var express = require('express');
var portscanner = require('portscanner');
var path = require("path");
var open = require("open");
var app = express();
var server = require("http").Server(app);

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

function start(table, maxDepth){
	app.get('/', function (req, res) {
		res.render("dep-tool",
			{port: app.get("port"), table: JSON.stringify(table), depth: maxDepth});
	});
	
	portscanner.findAPortNotInUse(45000, 45100, "127.0.0.1", function(err, port){
		server.listen(port, function () {
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

var io = require('socket.io').listen(server);
io.on('connection', function(socket) {
	connectionCount++;
    socket.on('disconnect', function() {
        connectionCount--;
		if (connectionCount == 0){
			setTimeout(function() {
				if (connectionCount == 0){
					server.close();
					socket.disconnect();
					process.exit()
				}
			}, 1000)
		}
    });
});

var connectionCount = 0;

module.exports = {
    start: start,
	open: openHTML
};
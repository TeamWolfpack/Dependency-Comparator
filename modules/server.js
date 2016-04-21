var express = require('express');
var path = require("path");
var app = express();

//use .html extension instead of .ejs
app.engine('html', require('ejs').renderFile);

//set the view engine to .html
app.set('view engine', 'html');

//set the view directory to /html
app.set('views', path.normalize(__dirname + "/../html"));

//link css, js, and other files to express
app.use(express.static(path.normalize(__dirname + "/../html")));

function start(table){
	app.get('/', function (req, res) {
		res.render("dep-tool", { table: table });
	});

	app.listen(45101, function () {
	  console.log('Listening on localhost:45101');
	});
}

module.exports = {
    start: start
};
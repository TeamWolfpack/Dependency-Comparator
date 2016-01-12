require("babel/register")();

var Promise = require("bluebird");

var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var express = require("express");
var log4js = require("log4js");
var logger = log4js.getLogger();
logger.setLevel("TRACE");
var methodOverride = require("method-override");

var port = process.env.WALLBOARDS_PORT || 3000;

var app = express();

app.set("port", port);
app.use(log4js.connectLogger(logger));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(methodOverride());
app.use(cookieParser());

app.listen(port, function() {
    logger.info("createApiServer: Creating API Server on port [" + port + "] ... DONE");
});


// go to http://localhost:3000/ to use this
app.get("/", function(req, res){
    res.statusCode = 200;
    res.send({id:"mySampleResponse", date: (new Date()).toJSON()});
});

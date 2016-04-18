/**
 * Created by farrowc on 4/11/2016.
 */

var path = require("path");
var open = require("open");
var express = require("express");


module.exports = {
    openHTML: openHTML
};

function openHTML(matchedDependencies){
	open(path.normalize(__dirname+"/../html/dep-tool.html"));
    
}


function getLogger(){
	open(path.normalize(__dirname+"/../logfiles/dep-tool.html"));
}

function createHTMLTable(){
	express.get('/', function (req, res) {
		res.send('Hello World!');
	});

	express.listen(3000, function () {
		console.log('Example express listening on port 3000!');
	});

}
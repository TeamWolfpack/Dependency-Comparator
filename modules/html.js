/**
 * Created by farrowc on 4/11/2016.
 */

var path = require("path");
var open = require("open");


module.exports = {
    openHTML: openHTML
};

function openHTML(matchedDependencies){
	try {
		open(path.normalize(__dirname + "/../html/dep-tool.html"));
	}catch(err){
		return false;
	}
	return true;
    
}


function getLogger(){
	open(path.normalize(__dirname+"/../logfiles/dep-tool.html"));
}

function createHTMLTable(){
	
}
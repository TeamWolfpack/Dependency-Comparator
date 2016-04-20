/**
 * Created by farrowc on 4/11/2016.
 */

var path = require("path");
var open = require("open");
var jsonfile = require("jsonfile");


module.exports = {
    openHTML: openHTML
};

function openHTML(matchedDependencies){
	jsonfile.writeFile(path.normalize(__dirname +"/../html/search.json"),matchedDependencies,{spaces:1},function(err){
		if(err){
			console.log("Can't make the logfiles json file:\n"+err);
		}

	});
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

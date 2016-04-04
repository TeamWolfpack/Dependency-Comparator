/**
 * Created by farrowc on 2/18/2016.
 */

var path = require("path");
var jsonfile = require("jsonfile");
var mkdirp = require('mkdirp');


module.exports = {
    logDependencies: logDependencies
};

function logDependencies(dependencies){
    var date = new Date();
    var dateString = date.toUTCString();
    dateString = dateString.replace(",","");
    dateString = dateString.replace(/:/g,"-");
    dateString = dateString.replace(/\s+/g,"");
    var logFolder = path.normalize(__dirname+"/../logfiles");
    var fileName = path.normalize(logFolder+"/"+dateString+".json");

    mkdirp(logFolder, function (err) {
        if (err){
            console.log("Can't make the logfiles folder:\n"+err);
        }
    });
    jsonfile.writeFile(fileName,dependencies,{spaces:1},function(err){
        if(err){
			console.log("Can't make the logfiles json file:\n"+err);           
        }

    })

}

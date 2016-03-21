/**
 * Created by farrowc on 2/18/2016.
 */

var path = require("path");
var jsonfile = require("jsonfile");
var mkdirp = require('mkdirp');


module.exports = {
    logDependencies: logDependencies
};

function logDependencies(dependencies,outputFile){
    var date = new Date();
    var dateString = date.toUTCString();
    dateString = dateString.replace(",","");
    dateString = dateString.replace(/:/g,"-");
    dateString = dateString.replace(/\s+/g,"");
    var fileName = __dirname+"/../logfiles/"+dateString;
    var fileName = path.normalize(fileName)+".json";
    var depString = JSON.stringify(dependencies);
    mkdirp(__dirname+'/../logfiles', function (err) {
        if (err){
            console.log("An error has occured with the"+
                "logger:\n"+err);
        }
    });
    jsonfile.writeFile(fileName,dependencies,{spaces:1},function(err){
        if(err!=null) {
            console.log("An error has occured with the"+
                "logger:\n"+err);
        }

    })

}
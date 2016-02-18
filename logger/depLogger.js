/**
 * Created by farrowc on 2/18/2016.
 */

var fs = require("fs");
var path = require("path");

module.exports = {
    logDependencies: logDependencies
};

function logDependencies(dependencies,outputFile){
    var date = new Date();
    var dateString = date.toUTCString();
    dateString = dateString.replace(",","");
    dateString = dateString.replace(":","-");
    dateString = dateString.replace(/\s+/g,"");
    var fileName = path.normalize(outputFile+"/"+dateString+".json");
    var depString = JSON.stringify(dependencies);
    fs.writeFile(fileName,depString,"utf8",function(err){
        if(err!=null) {
            console.log("Dependencies logged");
        }else{
            console.log(err);
        }

    })

}
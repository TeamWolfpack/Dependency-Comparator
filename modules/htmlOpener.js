/**
 * Created by farrowc on 4/11/2016.
 */

var path = require("path");
var open = require("open");


module.exports = {
    openHTML: openHTML
};

function openHTML(matchedDependencies){

    open(path.normalize(__dirname+"/../html/dep-tool.html"));
}
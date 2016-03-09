/**
 * Created by farrowc on 2/18/2016.
 */

var textTable = require("text-table");


var totals = {
    projectOne: {
        major: 0,
        minor: 0,
        patch: 0,
        unmatched: 0
    },
    projectTwo: {
        major: 0,
        minor: 0,
        patch: 0,
        unmatched: 0
    }
};

/**
 * Prints the summary table.
 */
function printSummaryTable(globalProjectOne,globalProjectTwo) {
    if (globalProjectOne == globalProjectTwo) {
        totals.projectOne.major /= 2;
        totals.projectOne.minor /= 2;
        totals.projectOne.patch /= 2;
        totals.projectTwo = totals.projectOne;
    }
    var summaryTable = textTable([
        ["", "Project One", "Project Two"],
        ["major", totals.projectOne.major, totals.projectTwo.major],
        ["minor", totals.projectOne.minor, totals.projectTwo.minor],
        ["patch", totals.projectOne.patch, totals.projectTwo.patch],
        ["unmatched", totals.projectOne.unmatched, totals.projectTwo.unmatched]
    ], {align: ["l", "l", "l"]});
    console.log(summaryTable);
}

exports.printSummaryTable = printSummaryTable;
exports.totals = totals;
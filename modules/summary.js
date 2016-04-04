/**
 * Created by farrowc on 3/7/2016.
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
function printSummaryTable() {
    var summaryTable = createSummaryTable(totals);
    console.log(summaryTable);
}

/**
 *  Creates a table of the totals
 * @param dependencyTotals the totals of the dependency attributesg
 * @returns {*}
 */
function createSummaryTable(dependencyTotals){
    checkTotals(dependencyTotals);
    var summaryTable = textTable([
        ["", "Project One", "Project Two"],
        ["major", dependencyTotals.projectOne.major,
            dependencyTotals.projectTwo.major],
        ["minor", dependencyTotals.projectOne.minor,
            dependencyTotals.projectTwo.minor],
        ["patch", dependencyTotals.projectOne.patch,
            dependencyTotals.projectTwo.patch],
        ["unmatched", dependencyTotals.projectOne.unmatched,
            dependencyTotals.projectTwo.unmatched]
    ], {align: ["l", "l", "l"]});
    return summaryTable;
}

function checkTotals(dependencyTotals){
    if(dependencyTotals == undefined){
        throw new Error("Summary table error: " +
            "Dependency Totals is undefined");
    }else if(dependencyTotals.projectOne == undefined){
        throw new Error("Summary table error: " +
            "Project One Totals is undefined");
    }else if(dependencyTotals.projectTwo == undefined){
        throw new Error("Summary table error: " +
            "Project Two Totals is undefined");
    }else if(dependencyTotals.projectOne.major<0){
        throw new Error("Summary table error: Project One " +
            "major difference count is negative")
    }else if(dependencyTotals.projectOne.minor<0){
        throw new Error("Summary table error: Project One " +
            "minor difference count is negative")
    }else if(dependencyTotals.projectOne.patch<0){
        throw new Error("Summary table error: Project One " +
            "patch difference count is negative")
    }else if(dependencyTotals.projectOne.unmatched<0){
        throw new Error("Summary table error: Project One " +
            "unmatched difference count is negative")
    }else if(dependencyTotals.projectTwo.major<0){
        throw new Error("Summary table error: Project Two " +
            "major difference count is negative")
    }else if(dependencyTotals.projectTwo.minor<0){
        throw new Error("Summary table error: Project Two " +
            "minor difference count is negative")
    }else if(dependencyTotals.projectTwo.patch<0){
        throw new Error("Summary table error: Project Two " +
            "patch difference count is negative")
    }else if(dependencyTotals.projectTwo.unmatched<0){
        throw new Error("Summary table error: Project Two " +
            "unmatched difference count is negative")
    }else if(! dependencyTotals.projectOne.hasOwnProperty("major")){
        throw new Error("Summary table error: Project One " +
            "major difference count is missing")
    }else if(! dependencyTotals.projectOne.hasOwnProperty("minor")){
        throw new Error("Summary table error: Project One " +
            "minor difference count is missing")
    }else if(! dependencyTotals.projectOne.hasOwnProperty("patch")){
        throw new Error("Summary table error: Project One " +
            "patch difference count is missing")
    }else if(! dependencyTotals.projectOne.hasOwnProperty("unmatched")){
        throw new Error("Summary table error: Project One " +
            "unmatched difference count is missing")
    }else if(! dependencyTotals.projectTwo.hasOwnProperty("major")){
        throw new Error("Summary table error: Project Two " +
            "major difference count is missing")
    }else if(! dependencyTotals.projectTwo.hasOwnProperty("minor")){
        throw new Error("Summary table error: Project Two " +
            "minor difference count is missing")
    }else if(! dependencyTotals.projectTwo.hasOwnProperty("patch")){
        throw new Error("Summary table error: Project Two " +
            "patch difference count is missing")
    }else if(! dependencyTotals.projectTwo.hasOwnProperty("unmatched")){
        throw new Error("Summary table error: Project Two " +
            "unmatched difference count is missing")
    }
}

module.exports = {printSummaryTable: printSummaryTable,
    createSummaryTable: createSummaryTable,
    totals: totals}
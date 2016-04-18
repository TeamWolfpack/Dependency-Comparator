/**
 * Created by farrowc on 3/7/2016.
 */

var textTable = require("text-table");

var totals = [];
	
//	[project: {
//    major: 0,
//    minor: 0,
//    patch: 0,
//    unmatched: 0
//}];

function printSummaryTable() {
    createSummaryTable(totals);
}

function createSummaryTable(dependencyTotals){
    checkTotalsForErrors(dependencyTotals);
//    var summaryTable = textTable([
//        ["", "Project One", "Project Two"],
//        ["major", dependencyTotals.projectOne.major,
//            dependencyTotals.projectTwo.major],
//        ["minor", dependencyTotals.projectOne.minor,
//            dependencyTotals.projectTwo.minor],
//        ["patch", dependencyTotals.projectOne.patch,
//            dependencyTotals.projectTwo.patch],
//        ["unmatched", dependencyTotals.projectOne.unmatched,
//            dependencyTotals.projectTwo.unmatched]
//    ], {align: ["l", "l", "l"]});
    
    //create empty table
    var table = new cliTable({
        head: ["", ],
        style: {
            head: [] //disable colors in header cells
        },
        wordWrap: true
    });
    
    var rows = [];
    rows.push(["major"]);
    rows.push(["minor"]);
    rows.push(["patch"]);
    rows.push(["unmatched"]);
    
    //Add each project to the header
    for (p in dependecyTotals) {
        table.options.head.push(totals[p]);
        rows[0].push(dependecyTotals[p].major);
        rows[1].push(dependecyTotals[p].minor);
        rows[2].push(dependecyTotals[p].patch);
        rows[3].push(dependecyTotals[p].unmatched);
    }
    
    //Add each row to the table
    for (r in rows) {
        table.push(rows[r]);
    }

    console.log(table.toString());
    
    //return summaryTable;
}

function checkTotalsForErrors(dependencyTotals){  
	if(dependencyTotals == undefined){
        throw new Error("Summary table error: " +
            "Dependency Totals is undefined");
    }
	for(i in dependecyTotals){
		var totals = dependencyTotals[i];
		if(totals == undefined){
	        throw new Error("Summary table error: " +
	            "Project " + i + " Totals is undefined");
	    }else if(totals.major<0){
	        throw new Error("Summary table error: Project " + i +
	            " major difference count is negative")
	    }else if(totals.minor<0){
	        throw new Error("Summary table error: Project " + i +
	            " minor difference count is negative")
	    }else if(totals.patch<0){
	        throw new Error("Summary table error: Project " + i +
	            " patch difference count is negative")
	    }else if(totals.unmatched<0){
	        throw new Error("Summary table error: Project " + i +
	            " unmatched difference count is negative")
	    }else if(! totals.hasOwnProperty("major")){
	        throw new Error("Summary table error: Project " + i +
	            " major difference count is missing")
	    }else if(! totals.hasOwnProperty("minor")){
	        throw new Error("Summary table error: Project " + i +
	            " minor difference count is missing")
	    }else if(! totals.hasOwnProperty("patch")){
	        throw new Error("Summary table error: Project " + i +
	            " patch difference count is missing")
	    }else if(! totals.hasOwnProperty("unmatched")){
	        throw new Error("Summary table error: Project " + i +
	            " unmatched difference count is missing")
	    }
    }	
}

module.exports = {printSummaryTable: printSummaryTable,
    createSummaryTable: createSummaryTable,
    totals: totals}
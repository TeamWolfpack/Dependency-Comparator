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

function printSummaryTable(matchedDependencies) {
    createTotals(matchedDependencies);
	createSummaryTable());
}

function createTotals(matchedDependencies){
	
	for(d in matchedDependencies){
		
	}
}

function createSummaryTable(){
    checkTotalsForErrors();
    
    //create empty table
    var table = new cliTable({
        head: [""],
        style: {
            head: [] //disable colors in header cells
        },
        wordWrap: true
        //{align: ["l", "l", "l"]}	//fix this later
    });
    
    var rows = [];
    rows.push(["major"]);
    rows.push(["minor"]);
    rows.push(["patch"]);
    rows.push(["unmatched"]);
    
    //Add each project to the header
    for (t in totals) {
        table.options.head.push(totals[t]);
        rows[0].push(totals[t].major);
        rows[1].push(totals[t].minor);
        rows[2].push(totals[t].patch);
        rows[3].push(totals[t].unmatched);
    }
    
    //Add each row to the table
    for (r in rows) {
        table.push(rows[r]);
    }

    console.log(table.toString());
    
    //return summaryTable;
}

function checkTotalsForErrors(){  
	if(totals == undefined){
        throw new Error("Summary table error: " +
            "Dependency Totals is undefined");
    }
	for(i in totals){
		var tots = totals[i];
		if(tots == undefined){
	        throw new Error("Summary table error: " +
	            "Project " + i + " Totals is undefined");
	    }else if(tots.major<0){
	        throw new Error("Summary table error: Project " + i +
	            " major difference count is negative")
	    }else if(tots.minor<0){
	        throw new Error("Summary table error: Project " + i +
	            " minor difference count is negative")
	    }else if(tots.patch<0){
	        throw new Error("Summary table error: Project " + i +
	            " patch difference count is negative")
	    }else if(tots.unmatched<0){
	        throw new Error("Summary table error: Project " + i +
	            " unmatched difference count is negative")
	    }else if(! tots.hasOwnProperty("major")){
	        throw new Error("Summary table error: Project " + i +
	            " major difference count is missing")
	    }else if(! tots.hasOwnProperty("minor")){
	        throw new Error("Summary table error: Project " + i +
	            " minor difference count is missing")
	    }else if(! tots.hasOwnProperty("patch")){
	        throw new Error("Summary table error: Project " + i +
	            " patch difference count is missing")
	    }else if(! tots.hasOwnProperty("unmatched")){
	        throw new Error("Summary table error: Project " + i +
	            " unmatched difference count is missing")
	    }
    }	
}

module.exports = {printSummaryTable: printSummaryTable,
    createSummaryTable: createSummaryTable,
    totals: totals}
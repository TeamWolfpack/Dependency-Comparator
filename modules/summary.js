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

function createSummaryTable(){
    checkTotalsForErrors();
	
	var rows = [];
	rows.push([""]);
    rows.push(["major"]);
    rows.push(["minor"]);
    rows.push(["patch"]);
    rows.push(["unmatched"]);
    
    for (t in totals) {
        rows[0].push(totals[t].name);
        rows[1].push(totals[t].major);
        rows[2].push(totals[t].minor);
        rows[3].push(totals[t].patch);
        rows[4].push(totals[t].unmatched);
    }
	
	var table = textTable([
        rows[0],
        rows[1],
        rows[2],
        rows[3],
        rows[4]
	]);

    console.log(table);
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

module.exports = {
    printSummaryTable: createSummaryTable,
    totals: totals
}
/*
 * Command line application that compares the dependency versions of two projects
 */

var cliTable = require("cli-table2");
var chalk = require("chalk");
var commander = require("commander");
var pjson = require("../package.json");

/**
 * Creates, fills, and prints the table based on a list of
 * dependencies. Since this function comes at the end
 * of the process, and the array is built internally, it assumes
 * the array and json objects have been formatted correctly.
 *
 * @param dependencies - Array of all dependencies
 *
 * @author Josh Leonard
 */

function createTable(dependencies) {
    var pOneName; //Name of project one
    var pTwoName; //Name of project two
	
    //Create the table object
    var table = new cliTable({
        //Project names are originally blank and then found in the dependencies
        //NOTE: The method for finding the names can be changed based on other variables
        head: ["Module Name", "", "", "", ""],
        style: {
            head: [] //disable colors in header cells
        },
        wordWrap: true
    });
	
    //Check that the param exists.
    //Since this is made internally, it assumes everything else
    //is there and correctly formatted.
    if (dependencies) {
        for (index in dependencies) { //loops through each dependency
			//Grab info about the dependency
            var dependency = dependencies[index];
            var depName = Object.keys(dependency)[0];
            var depInfo = dependency[depName];
            var rowSpan = depInfo.maxinstances;
            var instances = depInfo.instances;
            var rows = [];
            for (i in instances) { //loops through each instance of the dependency
                var instance = instances[i];
                if (i == 0) { //the first instance fills in the Module column of the table
                    //the very first instance will set the Project One name
                    //NOTE: this assumes the very first instanse is part of Project one
                    if (!pOneName) {
                        pOneName = instance.project;
                        table.options.head[1] = pOneName;
                        table.options.head[2] = pOneName + " Path";
                    }
                    //Determines location of instance based on project name
                    if (instance.project == pOneName) {
                        rows.push([{rowSpan: rowSpan, content: depName}, instance.version, instance.path, "", ""]);
                    } else {
                        rows.push([{rowSpan: rowSpan, content: depName}, "", "", instance.version, instance.path]);
                    }
                } else if (i < rowSpan) { //based on the dependency format, this will fill the left most instance
                    //Determines location of instance based on project name
                    if (instance.project == pOneName) {
                        rows.push([instance.version, instance.path, "", ""]);
                    } else {
                        rows.push(["", "", instance.version, instance.path]);
                    }
                } else { //fill any missing Project Two instances
                    if (!pTwoName) { //sets the name of Project 2 if previously undefined
                        pTwoName = instance.project;
                        table.options.head[3] = pTwoName;
                        table.options.head[4] = pTwoName + " Path";
                    }
                    rows[i - rowSpan][3] = instance.version;
                    rows[i - rowSpan][4] = instance.path;
                }
            }
            for (r in rows) { //Pushes each row into the table
                table.push(rows[r]);
            }
        }
        console.log(table.toString()); //prints the table
    } else { //prints simple error message is there is no dependency array
        console.error("No dependency data.");
    }
}

/**
 * Method that runs when the user enters the 'compare' command
 *
 * @author Chris Farrow
 * @param fileOne
 * @param fileTwo
 */
function compare(fileOne, fileTwo) {
    //Method Stub for main compare method
}

//Commander lines go below this comment
commander
	.version(pjson.version);

//All commands need a command, description, alias, and action component
commander
	.command("compare [fileOne] [fileTwo]")
		.description("Compare the dependencies of two projects")
		.alias("cmp")
		.action(compare);
	
commander.parse(process.argv);

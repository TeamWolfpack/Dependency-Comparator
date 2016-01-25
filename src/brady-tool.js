/*
 * Command line application that compares the dependency versions of two projects
 */
var cliTable = require("cli-table2");
var chalk = require("chalk");
var commander = require("commander");
var fs = require('fs');
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
 * Compares and matches dependencies from two arrays of dependencies from projects
 * Must be edited for comparing with depth
 * @param projectOne Dependencies from project 1
 * @param projectTwo Dependencies from project 2
 */
function compareAndMatch(projectOne, projectTwo){
	//Create new object, ordered by dependencies
	var projectOneDep = projectOne.dependencies;
	var projectTwoDep = projectTwo.dependencies;
	var dependencies = [];

	//Iterate through the first project's dependencies
	for(var p1dep in projectOneDep){
		//The array we will be storing matched dependencies in
		var matchedDeps = [];
		//Match dependencies by checking to see if it exists in the second project
		if(projectTwoDep[p1dep]) {
			//If they match, add the matched one to the array
			matchedDeps[0] = {
				version: projectOneDep[p1dep].version,
				Project: projectOne.name,
				path: projectOneDep[p1dep].path,
				color: "white"
			};
			matchedDeps[1] = {
				version: projectTwoDep[p1dep].version,
				Project: projectTwo.name,
				path: projectTwoDep[p1dep].path,
				color: "white"
			};
			projectOneDep[p1dep] = undefined;
			projectTwoDep[p1dep] = undefined;


		}
		//Adding the matched dependencies to the dependencies array
		//Max instances will be implemented properly once we start checking depth
		//For now, it will be 1
		dependencies[p1dep]={
			maxinstances: 1,
			instances: matchedDeps
		};
	}

	//Iterate through what remians in the first project, adding it to the end.
	for(var p1dep in projectOneDep){
		if(projectOneDep[p1dep]) {
			//The array we will be storing matched dependencies in
			var matchedDeps = [];

			matchedDeps[0] = {
				version: projectOneDep[p1dep].version,
				Project: projectOne.name,
				path: projectOneDep[p1dep].path,
				color: "white"
			};
			projectOneDep[p1dep] = undefined;

			dependencies[p1dep] = {
				maxinstances: 1,
				instances: matchedDeps
			};
		}

	}

	//Iterate through what remians in the second project, adding it to the end.
	for(var p2dep in projectTwoDep){
		if(projectTwoDep[p2dep]) {
			//The array we will be storing matched dependencies in
			var matchedDeps = [];

			matchedDeps[0] = {
				version: projectTwoDep[p2dep].version,
				Project: projectTwo.name,
				path: projectTwoDep[p2dep].path,
				color: "white"
			};
			projectTwoDep[p2dep] = undefined;

			dependencies[p2dep] = {
				maxinstances: 1,
				instances: matchedDeps
			};
		}
	}
	return dependencies;
}

/**
 * Takes in the location of the root file of the project and outputs an object with the
 * name, path, and dependencies of the project.
 * @param file Location of the root file of the project
 * @returns {{name: Project Name, path: Project Path, dependencies: Array of Dependencies}}
 */
function parseDependencies(file){
	//Get the package.json for the project
	var filePackage = require(file.toString()+"/package.json");
	//Get the dependencies of the project
	var fileDep = filePackage.dependencies;
	//Store the name and path of the project
	var fileParsedDependencies = {
		name :filePackage.name.toString(),
		path :file.toString(),
		dependencies: []
	};
	//Iterate through dependencies and save them in the specified format
	for(dep in fileDep){
		fileParsedDependencies.dependencies[dep] =
		{
			version: fileDep[dep],
			path: file.toString()+"/"+dep
		};
	}
	//Return the completed and parsed json object with the dependencies
	return fileParsedDependencies;
	}

/**
 * Method that runs when the user enters the 'compare' command.
 * Will compare the versions of the dependencies of two projects
 * and print out the differences.
 * @author Chris Farrow
 * @param fileOne The first project that will be compared
 * @param fileTwo The second project that will be compared
 */
function compare(fileOne, fileTwo){
	var filesExist = true;
	//Check to see if file one exists
	fs.access(fileOne, fs.F_OK, function(err) {
		if (err) {
			filesExist = false;

			console.log("Can't find file one: " + fileOne + "/package.json");
		}
	});

	//Check to see if file two exists
	fs.access(fileTwo, fs.F_OK, function (err) {
		if (err) {
			filesExist = false;
			console.log("Can't find file two: " + fileTwo + "/package.json");
		}
	});

	//If the files exist, parse them
	if (filesExist) {
		//Parse project one
		var fileOneParsedDependencies = parseDependencies(fileOne);
		//Parse project two
		var fileTwoParsedDependencies = parseDependencies(fileTwo);
		//Combine the parsed projects
		var combined = {
			project1: fileOneParsedDependencies,

			project2: fileTwoParsedDependencies
		};
	}

	//Here we will compare the dependencies
	var matchedDependencies = compareAndMatch(combined.project1,combined.project2);

	//
	createTable(matchedDependencies);
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

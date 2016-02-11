#!/usr/bin/env node
/*
 * Command line application that compares the dependency versions of two projects
 */
var cliTable = require("cli-table2");
var chalk = require("chalk");
var commander = require("commander");
var fs = require("fs");
var pjson = require("../package.json");
var child_process = require("child_process");
var async = require("async");
var ProgressBar = require('progress');
var os = require('os');

var totals = {
    major: 0,
    minor: 0,
    patch: 0,
    unmatched: 0
}

//For Testing
module.exports = {
	createTable: createTable,
    compare: compare
}

/**
 * Turns the string representation of a version into a 
 * JSON object with major, minor, and patch elements
 *
 * @param {string} stringVersion String representation of a version
 */
function parseVersion(stringVersion){
	var splitVersion = stringVersion.split(".");
    var version = {
        major: Number(splitVersion[0]),
        minor: splitVersion.length > 0 ? Number(splitVersion[1]) : 0,
        patch: splitVersion.length > 1 ? Number(splitVersion[2]) : 0
    };
	return version;
}

/**
 * Assigns colors to instances in an array of instances of a dependency based off of the version of that instance and the
 * max version found.
 *
 * @param {Array} instances An array of instances of the dependency
 * @param {JSON} maxVersion The most up-to-date instance's version found
 */
function assignColor(instances, npmVersion, callback) {
	parsedNPMVersion = parseVersion(npmVersion);
    for (var instance in instances) {
        var version = parseVersion(instances[instance].version);
		var lowestColor = 0; //green
		
		//Compare the version of this instance with the npm version
		if (JSON.stringify(version) === JSON.stringify(parsedNPMVersion)){
			instances[instance].color = "green";
		} else if (version.major > parsedNPMVersion.major 
					|| (version.major == parsedNPMVersion.major && version.minor > parsedNPMVersion.minor)
					|| (version.major == parsedNPMVersion.major && version.minor == parsedNPMVersion.minor && version.patch > parsedNPMVersion.patch)) {
			instances[instance].color = "green";
		}else if (version.major < parsedNPMVersion.major) {
            instances[instance].color = "red";
			totals.major++;
			if (lowestColor < 3){
				lowestColor = 3; //red
			}
        }else if (version.minor < parsedNPMVersion.minor) {
            instances[instance].color = "magenta";
			totals.minor++;
			if (lowestColor < 2){
				lowestColor = 2; //magenta
			}
        }else if (version.patch < parsedNPMVersion.patch) {
            instances[instance].color = "yellow";
			totals.patch++;
			if (lowestColor < 1){
				lowestColor = 1; //yellow
			}
        }
    }
	if (lowestColor == 3){
		npmVersion = chalk.red(npmVersion)
	} else if (lowestColor == 2) {
		npmVersion = chalk.magenta(npmVersion)
	} else if (lowestColor == 1) {
		npmVersion = chalk.yellow(npmVersion)
	} else {
		npmVersion = chalk.green(npmVersion)
	}
	return callback(npmVersion);
}

/**
 * Creates, fills, and prints the table based on a list of
 * dependencies. Since this function comes at the end
 * of the process, and the array is built internally, it assumes
 * the array and json objects have been formatted correctly.
 *
 * @param {Array} dependencies - Array of all dependencies
 *
 * @author Josh Leonard
 */
function createTable(dependencies) {
    var projectOneName; //Name of project one
    var projectTwoName; //Name of project two
		
    //Create the table object
    var table = new cliTable({
        //Project names are originally blank and then found in the dependencies
        //NOTE: The method for finding the names can be changed based on other variables
        head: ["Module Name", "NPM Version", "", "", "", ""],
        style: {
            head: [] //disable colors in header cells
        },
        wordWrap: true
    });
	
    //Check that the param exists.
    //Since this is made internally, it assumes everything else
    //is there and correctly formatted.
    if (dependencies) {
		dependencies.forEach(function(dependency){
			var dependencyName = dependency.name;
            var rowSpan = dependency.maxinstances;
			var npmVersion = dependency.npmVersion;
            var instances = dependency.instances;
            var rows = [];
			
            for (i in instances) { //loops through each instance of the dependency
                var instance = instances[i];
                if (instance.color == "green") {
                    var instanceVersion = chalk.green(instance.version);
                } else if (instance.color == "magenta") {
                    var instanceVersion = chalk.magenta(instance.version);
                } else if (instance.color == "yellow") {
                    var instanceVersion = chalk.yellow(instance.version);
                } else if (instance.color == "red") {
                    var instanceVersion = chalk.red(instance.version);
                } else {
					var instanceVersion = chalk.white(instance.version);
				}

                if (i == 0) { //the first instance fills in the Module column of the table
                    //the very first instance will set the Project One name
                    //NOTE: this assumes the very first instanse is part of Project one
                    if (!projectOneName) {
                        projectOneName = instance.Project;
                        table.options.head[2] = projectOneName;
                        table.options.head[3] = projectOneName + " Path";
                    }
                    //Determines location of instance based on project name
                    if (instance.Project == projectOneName) {
                        rows.push([{rowSpan: rowSpan, content: dependencyName}, npmVersion, instanceVersion, instance.path, "", ""]);
                    } else {
                        rows.push([{rowSpan: rowSpan, content: dependencyName}, npmVersion, "", "", instanceVersion, instance.path]);
                    }
                } else if (i < rowSpan) { //based on the dependency format, this will fill the left most instance
                    //Determines location of instance based on project name
                    if (instance.Project == projectOneName) {
                        rows.push(["", instanceVersion, instance.path, "", ""]);
                    } else {
                        rows.push(["", "", "", instanceVersion, instance.path]);
                    }
                } else { //fill any missing Project Two instances
                    if (!projectTwoName) { //sets the name of Project 2 if previously undefined
                        projectTwoName = instance.Project;
                        table.options.head[4] = projectTwoName;
                        table.options.head[5] = projectTwoName + " Path";
                    }
					if (rows[i - rowSpan].length == 6){
						rows[i - rowSpan][4] = instanceVersion;
						rows[i - rowSpan][5] = instance.path;
					} else if (rows[i - rowSpan].length == 4){
						rows[i - rowSpan][2] = instanceVersion;
						rows[i - rowSpan][3] = instance.path;
					}
                }
            }
            for (r in rows) { //Pushes each row into the table
                table.push(rows[r]);
            }
		});
        console.log(table.toString()); //prints the table
    } else { //prints simple error message is there is no dependency array
        console.log("Undefined dependencies parameter.");
    }
	return table;
}

/**
 * Compares and matches dependencies from two arrays of dependencies from projects.
 * Must be edited for comparing with depth.
 *
 * @param {Object} projectOne Dependencies from project 1
 * @param {Object} projectTwo Dependencies from project 2
 */
function compareAndMatch(projectOne, projectTwo, done) {
    //Create new object, ordered by dependencies
    var projectOneDep = projectOne.dependencies;
    var projectTwoDep = projectTwo.dependencies;
    var dependencies = [];
	
    // Checks
    for(var dep in projectOneDep){
        if(projectTwoDep[dep]){
            var matchedDeps = [];
            for(var instance in projectOneDep[dep]){
                matchedDeps[matchedDeps.length] = {
                    version: projectOneDep[dep][instance].version,
                    Project: projectOne.name,
                    path: projectOneDep[dep][instance].path,
                    color: "white"
                };
            }
            for(var instance in projectTwoDep[dep]){
                matchedDeps[matchedDeps.length] = {
                    version: projectTwoDep[dep][instance].version,
                    Project: projectTwo.name,
                    path: projectTwoDep[dep][instance].path,
                    color: "white"
                };
            }
			
			dependencies[dependencies.length] = {
                name: dep,
                maxinstances: Math.max(projectOneDep[dep].length, projectTwoDep[dep].length),
                instances: matchedDeps
            };
			
			delete projectTwoDep[dep];
			delete projectOneDep[dep];
        }
    }
    for(var dep in projectOneDep){
		var matchedDeps = [];
        for (var instance in projectOneDep[dep]) {
            matchedDeps[matchedDeps.length] = {
                version: projectOneDep[dep][instance].version,
                Project: projectOne.name,
                path: projectOneDep[dep][instance].path,
                color: "white"
            };
            totals.unmatched++;
        }
			
		dependencies[dependencies.length] = {
            name: dep,
            maxinstances: projectOneDep[dep].length,
            instances: matchedDeps
        };
    }
    for(var dep in projectTwoDep){
        var matchedDeps = [];
        for (var instance in projectTwoDep[dep]) {
            matchedDeps[matchedDeps.length] = {
                version: projectTwoDep[dep][instance].version,
                Project: projectTwo.name,
                path: projectTwoDep[dep][instance].path,
                color: "white"
            };
            totals.unmatched++;
        }
			
		dependencies[dependencies.length] = {
            name: dep,
            maxinstances: projectTwoDep[dep].length,
            instances: matchedDeps
        };
    }
	var bar = new ProgressBar('pulling npm versions [:bar] :percent', {
			complete: '=',
			incomplete: ' ',
			width: 40,
			total: dependencies.length,
			clear: true
		});
	bar.tick();	
	async.each(dependencies, function(dependency, callback){
		var name = dependency.name;
		child_process.exec("npm view " + name + " version", function(error, stdout, stderr){
			assignColor(dependency.instances, stdout.trim(), function(coloredVersion){
				dependency.npmVersion = coloredVersion;
				bar.tick();
				return callback();
			});
		});
	}, function(err){
		return done(dependencies);
	});
	return;
}

 /**
 * Takes in the location of the root file of the project and outputs an object with the
 * name, path, and dependencies of the project.
 *
 * @param {File} file Location of the root file of the project
 * @param depth
 * @returns {Object} {{name: Project Name, path: Project Path, dependencies: Array of Dependencies}}
 */
function parseDependencies(file, depth) {
    //Get the package.json for the project
    var filePackage = require(file + "/package.json");
    //Get the dependencies of the project
    //var fileDep = filePackage.dependencies;
    //Store the name and path of the project
    var fileParsedDependencies = {
        name: filePackage.name.toString(),
        path: file.toString(),
        dependencies: []
    };
    //Iterate through dependencies and save them in the specified format
    parseDependenciesRecursively(file,depth,fileParsedDependencies.dependencies,".");

    //Return the completed and parsed json object with the dependencies
    return fileParsedDependencies;
}

function parseDependenciesRecursively(file,depth,dependencies,previousDependencyPath){

    //Get the package.json for the project
    var filePackage = require(file + "/package.json");
    //Get the dependencies of the project
    var fileDep = filePackage.dependencies;
    if(commander.all) {
        for (devDep in filePackage.devDependencies) {
            if (!fileDep[devDep]) {
                fileDep[devDep] = devDep.version;
            }
        }
    }
    //Iterate through dependencies and save them in the specified format
    for (dep in fileDep) {
        try {
            if (!dependencies[dep]) {
                dependencies[dep] = [];
            }
            var dependency = require(file + "\\node_modules\\" + dep + "\\package.json");
            dependencies[dep][dependencies[dep].length] =
            {
                version: dependency.version,
                path: previousDependencyPath + "\\node_modules\\" + dep
            };

            if (depth - 1 >= 0) {
                parseDependenciesRecursively(file + "\\node_modules\\" + dep, depth - 1, dependencies, previousDependencyPath + "\\node_modules\\" + dep);
            }
        }catch(err){
            // No node_modules after a certain depth so module not found and is skipped
        }
    }
	return;
}

/**
 * Method that runs when the user enters the 'compare' command.
 * Will compare the versions of the dependencies of two projects
 * and print out the differences.
 *
 * @author Chris Farrow
 * @param {File} projectOne The first project that will be compared
 * @param {File} projectTwo The second project that will be compared
 */
function compare(projectOne, projectTwo) {
    var filesExist = true;
    //Check to see if file one exists
    if (projectOne) {
        fs.access(projectOne + "/package.json", fs.F_OK, function(err) {
            if (err) {
                filesExist = false;
                console.log("Can't find file one: " + projectOne + "/package.json");
            }
        });
    } else {
        console.log("First project is undefined.");
        filesExist = false;
    }
    
    //Check to see if file two exists
    if (projectTwo) {
        fs.access(projectTwo + "/package.json", fs.F_OK, function(err) {
            if (err) {
                filesExist = false;
                console.log("Can't find file two: " + projectTwo + "/package.json");
            }
        });
    } else {
        console.log("Second project is undefined.");
        filesExist = false;
    }

    //If the files exist, parse them
    if (filesExist == true) {
        //var depth = 0;
        if(commander.depth>=1) { // for 1 indexed  -  commander.depth>0
            var depth = commander.depth-1;
            //Parse project one
            var fileOneParsedDependencies = parseDependencies(projectOne,depth);
            //Parse project two
            var fileTwoParsedDependencies = parseDependencies(projectTwo,depth);
            //Combine the parsed projects
            var combined = {
                project1: fileOneParsedDependencies,
                project2: fileTwoParsedDependencies
            };
            //Here we will compare the dependencies
			compareAndMatch(combined.project1,combined.project2, function(matchedDependencies){
				if ((process.argv[2] === "compare" || process.argv[1] === "compare")){
					createTable(matchedDependencies);
				}else if(commander.commands[1].showTable &&
					(process.argv[2] === "summary" || process.argv[1] === "summary")) {
					createTable(matchedDependencies);
				}
				return;
			});
        }else{
            console.log("Invalid depth given.");
        }
    }
}

/**
 * Prints out a table of the total occurrences of major, minor,
 * patch, and unmatched modules found.
 */
function generateSummaryTable(projectOne, projectTwo){
    console.log("I am here...");
    compare(projectOne, projectTwo);
    console.log("major: " + totals.major);
    console.log("minor: " + totals.minor);
    console.log("patch: " + totals.patch);
    console.log("unmatched: " + totals.unmatched);
}

//Commander lines go below this comment
commander
	.version(pjson.version)
    .option("-d, --depth [depth]", "Compare by looking at " +
        "dependencies' dependencies down to a certain 'depth'", "1")
    .option("-a, --all", "Includes devDependencies during " +
        "comparison");

//All commands need a command, description, alias, and action component
commander
	.command("compare [fileOne] [fileTwo]")
        .alias("cmp")
		.description("Compare the dependencies of two projects")
        .option("-s, --hideSummary", "Hide the summary from the" +
            " compare.")
		.action(compare);

commander
    .command("summary [fileOne] [fileTwo]")
        .alias("sum")
        .description("Display the summary of the dependencies" +
            " being compared.")
        .option("-t, --showTable", "Shows the table.")
        .action(generateSummaryTable);

commander.parse(process.argv);

#!/usr/bin/env node
/*
 * Command line application that compares the dependency versions of two projects
 */

/*Begin 'require' Import Statements*/
var cliTable = require("cli-table2");
var chalk = require("chalk");
var commander = require("commander");
var fs = require("fs");
var pjson = require("../package.json");
var exec = require("child_process").exec;
var clc = require('cli-color');
/*End 'require' Import Statements*/

/*Begin Global Variables*/
var customColorsSupported = true;

var colorScheme = {
    patch : clc.yellowBright,
    minor : clc.magentaBright,
    major : clc.redBright,
    upToDate : clc.greenBright,
    unmatched : clc.whiteBright
};

/*End Global Variables*/
//For Testing
module.exports = {
	createTable: createTable,
    compare: compare
};

function checkForXterm(){
    var orange = clc.xterm(202);
    var red = clc.redBright;
    customColorsSupported = !(orange("A")===red("A"))
    return customColorsSupported;
}

/**
 * Selects which colors to load from the config
 * @param typeOfColors {String} A string that is the name of the area of the config that should be loaded
 */
function loadConfigColors(typeOfColors){
    if(checkForXterm()) {
        switch (typeOfColors) {
            case "Standard":
                loadStandardConfigColors();
                break;
            case "ColorBlind":
                loadColorBlindConfigColors();
                break;
            default:
                loadStandardConfigColors();
                break;
        }
    }
}

/**
 * Sets the colors in the standard section of the color config as the current color scheme
 */
function loadStandardConfigColors(){
    if(checkForXterm()) {
        try {
            var colorConfig = require("colorConfig.json");
            if(colorConfig.standard.major) {
                colorScheme.major = clc.xterm(colorConfig.Standard.major);
            }
            if(colorConfig.standard.minor) {
                colorScheme.minor = clc.xterm(colorConfig.Standard.minor);
            }
            if(colorConfig.standard.patch) {
                colorScheme.patch = clc.xterm(colorConfig.Standard.patch);
            }
            if(colorConfig.standard.upToDate) {
                colorScheme.upToDate = clc.xterm(colorConfig.Standard.upToDate);
            }
            if(colorConfig.standard.unmatched) {
                colorScheme.unmatched = clc.xterm(colorConfig.Standard.unmatched);
            }
        } catch (err) {
            throw Error("colorConfig is missing or syntax is incorrect.");
        }
    }

}

/**
 * Sets the colors in the color blind section of the color config as the current color scheme
 */
function loadColorBlindConfigColors(){
    if(checkForXterm()) {
        try {
            var colorConfig = require("colorConfig.json");
            if(colorConfig.colorBlind.major) {
                colorScheme.major = clc.xterm(colorConfig.ColorBlind.major);
            }
            if(colorConfig.colorBlind.minor) {
                colorScheme.minor = clc.xterm(colorConfig.ColorBlind.minor);
            }
            if(colorConfig.colorBlind.patch) {
                colorScheme.patch = clc.xterm(colorConfig.ColorBlind.patch);
            }
            if(colorConfig.colorBlind.upToDate) {
                colorScheme.upToDate = clc.xterm(colorConfig.ColorBlind.upToDate);
            }
            if(colorConfig.colorBlind.unmatched) {
                colorScheme.unmatched = clc.xterm(colorConfig.ColorBlind.unmatched);
            }
        } catch (err) {
            throw Error("colorConfig is missing or syntax is incorrect.");
        }
    }

}

/**
 * Finds the maximum version of an array of instances of dependencies.
 *
 * @param {Array} instances an array of dependencies
 * @returns  {{major: number, minor: number, patch: number}}
 * an object that is the max version that contains the major, minor,
 * and patch components
 */
function findMaxVersion(instances, callback) {
    //Initialize the max version, default is 0.0.0
    var maxVersion = {
        major: 0,
        minor: 0,
        patch: 0
    };
    for (var instance in instances) {
        //Initialize the version of this instance
        var splitVersion = instances[instance].version.split(".");
        var version = [0,0,0];

        //Set the version to the version of this instance
        version[0] = Number(splitVersion[0]);
        if (splitVersion.length > 0) {
            version[1] = Number(splitVersion[1]);
            if (splitVersion.length > 1) {
                version[2] = Number(splitVersion[2]);
            }
        }

        //Compare the version of this instance with the current max version
        if (version[0] > maxVersion.major) {
            maxVersion.major = version[0];
            maxVersion.minor = version[1];
            maxVersion.patch = version[2];
        }else if (version[0] == maxVersion.major && version[1] > maxVersion.minor) {
            maxVersion.minor = version[1];
            maxVersion.patch = version[2];
        }else if (version[0] == maxVersion.major && version[1] == maxVersion.minor && version[2] > maxVersion.patch) {
            maxVersion.patch = version[2];
        }
    }
    return callback(maxVersion);
}

/**
 * Assigns colors to instances in an array of instances of a dependency based off of the version of that instance and the
 * max version found.
 *
 * @param {Array} instances An array of instances of the dependency
 * @param {JSON} maxVersion The most up-to-date instance's version found
 */
function assignColor(instances, maxVersion) {
    for (var instance in instances) {
        //Initialize the version of this instance
        var splitVersion = instances[instance].version.split(".");
        var version = [0,0,0];

        //Set the version to the version of this instance
        version[0] = Number(splitVersion[0]);
        if (splitVersion.length > 0) {
            version[1] = Number(splitVersion[1]);
            if (splitVersion.length > 1) {
                version[2] = Number(splitVersion[2]);
            }
        }
        //Compare the version of this instance with the current max version
        if (version[0] < maxVersion.major) {
            instances[instance].color = "major";
        }else if (version[0] == maxVersion.major && version[1] < maxVersion.minor) {
            instances[instance].color = "minor";
        }else if (version[0] == maxVersion.major && version[1] == maxVersion.minor && version[2] < maxVersion.patch) {
            instances[instance].color = "patch";
        }else {
            instances[instance].color = "upToDate";
        }
    }
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
		dependencies.forEach(function(dependency){
			var dependencyName = dependency.name;
            var rowSpan = dependency.maxinstances;
            var instances = dependency.instances;
            var rows = [];

            for (i in instances) { //loops through each instance of the dependency
                var instance = instances[i];
                if (instances.length > 1) {
					findMaxVersion(instances, function(maxVersion){
						return assignColor(instances,maxVersion);
					});
                    if (instance.color == "upToDate") {
                        var instanceVersion = colorScheme.upToDate(instance.version);
                    } else if (instance.color == "minor") {
                        var instanceVersion = colorScheme.minor(instance.version);
                    } else if (instance.color == "patch") {
                        var instanceVersion = colorScheme.patch(instance.version);
                    } else if (instance.color == "major") {
                        var instanceVersion = colorScheme.major(instance.version);
                    } else {
						var instanceVersion = colorScheme.unmatched(instance.version);
					}
                } else {
					var instanceVersion = chalk.white(instance.version);
				}

                if (i == 0) { //the first instance fills in the Module column of the table
                    //the very first instance will set the Project One name
                    //NOTE: this assumes the very first instanse is part of Project one
                    if (!projectOneName) {
                        projectOneName = instance.Project;
                        table.options.head[1] = projectOneName;
                        table.options.head[2] = projectOneName + " Path";
                    }
                    //Determines location of instance based on project name
                    if (instance.Project == projectOneName) {
                        rows.push([{rowSpan: rowSpan, content: dependencyName}, instanceVersion, instance.path, "", ""]);
                    } else {
                        rows.push([{rowSpan: rowSpan, content: dependencyName}, "", "", instanceVersion, instance.path]);
                    }
                } else if (i < rowSpan) { //based on the dependency format, this will fill the left most instance
                    //Determines location of instance based on project name
                    if (instance.Project == projectOneName) {
                        rows.push([instanceVersion, instance.path, "", ""]);
                    } else {
                        rows.push(["", "", instanceVersion, instance.path]);
                    }
                } else { //fill any missing Project Two instances
                    if (!projectTwoName) { //sets the name of Project 2 if previously undefined
                        projectTwoName = instance.Project;
                        table.options.head[3] = projectTwoName;
                        table.options.head[4] = projectTwoName + " Path";
                    }
					if (rows[i - rowSpan].length == 5){
						rows[i - rowSpan][3] = instanceVersion;
						rows[i - rowSpan][4] = instance.path;
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
        for (var dependency in dependencies) { //loops through each dependency
            //Grab info about the dependency
			
        }
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
function compareAndMatch(projectOne, projectTwo) {
    //Create new object, ordered by dependencies
    var projectOneDep = projectOne.dependencies;
    var projectTwoDep = projectTwo.dependencies;
    var dependencies = [];
    var unmatchedDependencies = [];

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
            projectTwoDep[dep] = undefined;
            projectOneDep[dep] = undefined;

        }else{
            var matchedDeps = [];
            for (var instance in projectOneDep[dep]) {
                matchedDeps[matchedDeps.length] = {
                    version: projectOneDep[dep][instance].version,
                    Project: projectOne.name,
                    path: projectOneDep[dep][instance].path,
                    color: "white"
                };
            }
        }
    }
    if(!commander.hide_unmatched) {
        for (var dep in projectOneDep) {
            if (projectOneDep[dep]) {
                var matchedDeps = [];
                for (var instance in projectOneDep[dep]) {
                    matchedDeps[matchedDeps.length] = {
                        version: projectOneDep[dep][instance].version,
                        Project: projectOne.name,
                        path: projectOneDep[dep][instance].path,
                        color: "white"
                    };
                }
                dependencies[dependencies.length] = {
                    name: dep,
                    maxinstances: projectOneDep[dep].length,
                    instances: matchedDeps,
                };
            }
        }
        for (var dep in projectTwoDep) {
            if (projectTwoDep[dep]) {
                var matchedDeps = [];
                for (var instance in projectTwoDep[dep]) {
                    matchedDeps[matchedDeps.length] = {
                        version: projectTwoDep[dep][instance].version,
                        Project: projectTwo.name,
                        path: projectTwoDep[dep][instance].path,
                        color: "white"
                    };
                }
                dependencies[dependencies.length] = {
                    name: dep,
                    maxinstances: projectTwoDep[dep].length,
                    instances: matchedDeps,
                };
            }
        }
    }
    return dependencies;
}

/**
 *
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

}

function displayColorLegend(){

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
    checkForXterm();
    if(customColorsSupported){
        colorScheme.minor=clc.xterm(202);
        //Load the color config
        loadConfigColors(commander.colorType);
    }
    //Check to see if file one exists

    //If the files exist, parse them
    try {
        //var depth = 0;
        if (commander.depth >= 1) { // for 1 indexed  -  commander.depth>0
            var depth = commander.depth - 1;
            //Parse project one
            var fileOneParsedDependencies = parseDependencies(projectOne, depth);
            //Parse project two
            var fileTwoParsedDependencies = parseDependencies(projectTwo, depth);
            //Combine the parsed projects
            var combined = {
                project1: fileOneParsedDependencies,
                project2: fileTwoParsedDependencies
            };
            //Here we will compare the dependencies
            var matchedDependencies = compareAndMatch(combined.project1, combined.project2);
            createTable(matchedDependencies);
        } else {
            console.log("Invalid depth given.");
            return 1;
        }
    }catch(err){
        console.log("File not found");
        return 1;
    }
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

commander
    .option("-d, --depth [depth]", "Compare by looking at dependencies' dependencies down to a certain 'depth'", "1")
    .option("-a, --all", "Includes devDependencies during comparison")
    .option("-u, --hide_unmatched","Hides unmatched dependencies")
    .option("-c, --colorConfig [colorType]","Loads the entered color scheme from the color config.", "'Standard'");

commander.parse(process.argv);

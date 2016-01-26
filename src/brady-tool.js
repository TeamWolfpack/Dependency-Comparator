/*
 * Command line application that compares the dependency versions of two projects
 */
var cliTable = require("cli-table2");
var chalk = require("chalk");
var commander = require("commander");
var fs = require("fs");
var pjson = require("../package.json");

/**
 * Finds the maximum version of an array of instances of dependencies.
 *
 * @param {Array} instances an array of dependencies
 * @returns  {{major: number, minor: number, patch: number}}
 * an object that is the max version that contains the major, minor,
 * and patch components
 */
function findMaxVersion(instances) {
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
    return maxVersion;
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
            instances[instance].color = "red";
        }else if (version[0] == maxVersion.major && version[1] < maxVersion.minor) {
            instances[instance].color = "magenta";
        }else if (version[0] == maxVersion.major && version[1] == maxVersion.minor && version[2] < maxVersion.patch) {
            instances[instance].color = "yellow";
        }else {
            instances[instance].color = "green";
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
            var depName = index;
            var rowSpan = dependencies[index].maxinstances;
            var instances = dependencies[index].instances;
            var rows = [];
            var maxVersion = findMaxVersion(instances);
            assignColor(instances,maxVersion);
            for (i in instances) { //loops through each instance of the dependency
                var instance = instances[i];
                var instanceVersion = chalk.white(instance.version);
                if (instances.length > 1) {
                    if (instance.color == "green") {
                        var instanceVersion = chalk.green(instance.version);
                    } else if (instance.color == "magenta") {
                        var instanceVersion = chalk.magenta(instance.version);
                    } else if (instance.color == "yellow") {
                        var instanceVersion = chalk.yellow(instance.version);
                    } else if (instance.color == "red") {
                        var instanceVersion = chalk.red(instance.version);
                    }
                }

                if (i == 0) { //the first instance fills in the Module column of the table
                    //the very first instance will set the Project One name
                    //NOTE: this assumes the very first instanse is part of Project one
                    if (!pOneName) {
                        pOneName = instance.Project;
                        table.options.head[1] = pOneName;
                        table.options.head[2] = pOneName + " Path";
                    }
                    //Determines location of instance based on project name
                    if (instance.Project == pOneName) {
                        rows.push([{rowSpan: rowSpan, content: depName}, instanceVersion, instance.path, "", ""]);
                    } else {
                        rows.push([{rowSpan: rowSpan, content: depName}, "", "", instanceVersion, instance.path]);
                    }
                } else if (i < rowSpan) { //based on the dependency format, this will fill the left most instance
                    //Determines location of instance based on project name
                    if (instance.Project == pOneName) {
                        rows.push([instanceVersion, instance.path, "", ""]);
                    } else {
                        rows.push(["", "", instanceVersion, instance.path]);
                    }
                } else { //fill any missing Project Two instances
                    if (!pTwoName) { //sets the name of Project 2 if previously undefined
                        pTwoName = instance.Project;
                        table.options.head[3] = pTwoName;
                        table.options.head[4] = pTwoName + " Path";
                    }
                    rows[i - rowSpan][3] = instanceVersion;
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
 * Compares and matches dependencies from two arrays of dependencies from projects.
 * Must be edited for comparing with depth.
 *
 * @param {JSON} projectOne Dependencies from project 1
 * @param {JSON} projectTwo Dependencies from project 2
 */
function compareAndMatch(projectOne, projectTwo) {
    //Create new object, ordered by dependencies
    var projectOneDep = projectOne.dependencies;
    var projectTwoDep = projectTwo.dependencies;
    var dependencies = [];

    //Iterate through the first project's dependencies
    for (var p1dep in projectOneDep) {
        //The array we will be storing matched dependencies in
        var matchedDeps = [];
        //Match dependencies by checking to see if it exists in the second project
        if (projectTwoDep[p1dep]) {
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
        dependencies[p1dep] = {
            maxinstances: 1,
            instances: matchedDeps
        };
    }

    //Iterate through what remains in the first project, adding it to the end.
    for (var p1dep in projectOneDep) {
        if (projectOneDep[p1dep]) {
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
    for (var p2dep in projectTwoDep) {
        if (projectTwoDep[p2dep]) {
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
 *
 * @param {File} file Location of the root file of the project
 * @returns {JSON} {{name: Project Name, path: Project Path, dependencies: Array of Dependencies}}
 */
function parseDependencies(file) {
    //Get the package.json for the project
    var filePackage = require(file + "/package.json");
    //Get the dependencies of the project
    var fileDep = filePackage.dependencies;
    //Store the name and path of the project
    var fileParsedDependencies = {
        name: filePackage.name.toString(),
        path: file.toString(),
        dependencies: []
    };
    //Iterate through dependencies and save them in the specified format
    for (dep in fileDep) {
		var depenendency = require(file + "\\node_modules\\" + dep + "\\package.json");
        fileParsedDependencies.dependencies[dep] =
		{
			version: depenendency.version,
			path: ".\\node_modules\\" + dep
		};
        if (isNaN(fileDep[dep][0])) {
            fileParsedDependencies.dependencies[dep].version = fileDep[dep].substring(1,fileDep[dep].length);
        }
    }
    //Return the completed and parsed json object with the dependencies
    return fileParsedDependencies;
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
	if (projectOne){
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
	if (projectTwo){
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
        //Parse project one
        var fileOneParsedDependencies = parseDependencies(projectOne);
        //Parse project two
        var fileTwoParsedDependencies = parseDependencies(projectTwo);
        //Combine the parsed projects
        var combined = {
            project1: fileOneParsedDependencies,
            project2: fileTwoParsedDependencies
        };
		//Here we will compare the dependencies
		var matchedDependencies = compareAndMatch(combined.project1,combined.project2);
		createTable(matchedDependencies);
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
	
commander.parse(process.argv);

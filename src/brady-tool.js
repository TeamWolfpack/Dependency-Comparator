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
        for (var dependency in dependencies) { //loops through each dependency
            //Grab info about the dependency
            var rowSpan = dependencies[dependency].maxinstances;
            var instances = dependencies[dependency].instances;
            var rows = [];

            for (i in instances) { //loops through each instance of the dependency
                var instance = instances[i];
                if (instances.length > 1) {
					var maxVersion = findMaxVersion(instances);
					assignColor(instances,maxVersion);
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
                        rows.push([{rowSpan: rowSpan, content: dependencies[dependency].name}, instanceVersion, instance.path, "", ""]);
                    } else {
                        rows.push([{rowSpan: rowSpan, content: dependencies[dependency].name}, "", "", instanceVersion, instance.path]);
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
                //console.log("Matched1:    matchedDeps.length: " + matchedDeps.length); //TODO
                matchedDeps[matchedDeps.length] = {
                    version: projectOneDep[dep][instance].version,
                    Project: projectOne.name,
                    path: projectOneDep[dep][instance].path,
                    color: "white"
                };
            }
            for(var instance in projectTwoDep[dep]){
                //console.log("Matched2:    matchedDeps.length: " + matchedDeps.length); //TODO
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
            //console.log("dependencies.length: " + dependencies); //TODO
            projectTwoDep[dep] = undefined;
            projectOneDep[dep] = undefined;

        }else{
            var matchedDeps = [];
            for (var instance in projectOneDep[dep]) {
                //console.log("Unmatched:    matchedDeps.length: " + matchedDeps.length); //TODO
                matchedDeps[matchedDeps.length] = {
                    version: projectOneDep[dep][instance].version,
                    Project: projectOne.name,
                    path: projectOneDep[dep][instance].path,
                    color: "white"
                };
            }
        }
    }
    for(var dep in projectOneDep){
        if(projectOneDep[dep]) {
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
            //console.log("unmatchedDependencies.length: " + unmatchedDependencies.length); //TODO
        }
    }
    for(var dep in projectTwoDep){
        if(projectTwoDep[dep]) {
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
                maxinstances: projectTwoDep[dep],
                instances: matchedDeps,
            };
        }
    }
    //for(var dep in projectOneDep){
    //    if(projectOneDep[dep]) {
    //        var matchedDeps = [];
    //        for (var instance in projectOneDep[dep]) {
    //            matchedDeps[matchedDeps.length] = {
    //                version: projectOneDep[dep][instance].version,
    //                Project: projectOne.name,
    //                path: projectOneDep[dep][instance].path,
    //                color: "white"
    //            };
    //        }
    //        unmatchedDependencies[dep] = {
    //            maxinstances: projectOneDep[dep].length,
    //            instances: matchedDeps
    //        };
    //    }
    //}
    //for(var dep in projectTwoDep){
    //    if(projectTwoDep[dep]) {
    //        var matchedDeps = [];
    //        for (var instance in projectTwoDep[dep]) {
    //            matchedDeps[matchedDeps.length] = {
    //                version: projectTwoDep[dep][instance].version,
    //                Project: projectTwo.name,
    //                path: projectTwoDep[dep][instance].path,
    //                color: "white"
    //            };
    //        }
    //        unmatchedDependencies[dep] = {
    //            maxinstances: projectTwoDep[dep].length,
    //            instances: matchedDeps
    //        };
    //    }
    //}
    //for (unmatched in unmatchedDependencies) {
    //    //console.log("JSON.stringify(unmatched): " + JSON.stringify(unmatched));
    //    //console.log("JSON.stringify(unmatched.maxinstances): " + JSON.stringify(unmatched.maxinstances)); //TODO
    //    //console.log("JSON.stringify(unmatched.instances): " + JSON.stringify(unmatched.instances));
    //    dependencies.push(unmatched);
    //}
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
    if(commander.devDependencies) {
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
        if(commander.depth>=0) { // for 1 indexed  -  commander.depth>0
            var depth = commander.depth;
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
            var matchedDependencies = compareAndMatch(combined.project1,combined.project2);
            createTable(matchedDependencies);
        }else{
            console.log("Invalid depth given.");
        }
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
    .option("-d, --depth [depth]", "Compare by looking at dependencies' dependencies down to a certain 'depth'", "0") // check if want 1 or 0
    .option("-a, --devDependencies", "Includes devDependencies during comparison");

commander.parse(process.argv);

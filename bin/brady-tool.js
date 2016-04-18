#!/usr/bin/env node

/*
 * Command line application that compares the dependency versions
 * of two projects.
 */

/*Begin 'require' Import Statements*/
var cliTable = require("cli-table2");
var commander = require("commander");
var async = require("async");
var ProgressBar = require("progress");
var path = require("path");
var fs = require("fs");
var latestVersion = require("latest-version");
var pjson = require(path.normalize("../package.json"));
var logger = require(path.normalize("../modules/logger"));
var color = require(path.normalize("../modules/colors"));
var summarizer = require(path.normalize("../modules/summary"));
var parse = require(path.normalize("../modules/parse"));
var htmlOpener = require(path.normalize("../modules/html"));
/*End 'require' Import Statements*/

/*Begin Global Variables*/
var globalProjectOne;
var globalProjectTwo;

var globalProjects = [];
/*End Global Variables*/

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
    var projectOneName = globalProjectOne;
    var projectTwoName = globalProjectTwo;

    var table = new cliTable({
        head: ["Module Name", "NPM Version", projectOneName, projectOneName + " Path", projectTwoName, projectTwoName + " Path"],
        style: {
            head: [] //disable colors in header cells
        },
        wordWrap: true
    });

    if (dependencies) {
        dependencies.forEach(function(dependency) {
            var dependencyName = dependency.name;
            var rowSpan = dependency.maxinstances;
            var npmVersion = color.colorVersion(dependency.npmVersion);
            var instances = dependency.instances;
            var rows = [];

            for (i in instances) {
                var instance = instances[i];
                var instanceVersion = color.colorVersion(instance);

                if (i == 0) { //first instance fills in Module name
                    //Determines location based on project name
                    if (instance.Project == projectOneName) {
                        rows.push([{rowSpan: rowSpan,
                            content: dependencyName}, npmVersion,
                            instanceVersion, instance.path, "", ""]);
                    } else {
                        rows.push([{rowSpan: rowSpan,
                            content: dependencyName}, npmVersion, "",
                            "", instanceVersion, instance.path]);
                    }
                } else if (i < rowSpan) { //fills left most instances
                    if (instance.Project == projectOneName) {
                        rows.push(["", instanceVersion, instance.path
                            , "", ""]);
                    } else {
                        rows.push(["", "", "", instanceVersion,
                            instance.path]);
                    }
                } else { //fill any missing Project Two instances
                    if (rows[i - rowSpan].length == 6) {
                        rows[i - rowSpan][4] = instanceVersion;
                        rows[i - rowSpan][5] = instance.path;
                    } else if (rows[i - rowSpan].length == 4) {
                        rows[i - rowSpan][2] = instanceVersion;
                        rows[i - rowSpan][3] = instance.path;
                    }
                }
            }
            for (r in rows) {
                table.push(rows[r]);
            }
        });
        console.log(table.toString());
    } else {
        console.log("Undefined dependencies parameter.");
    }
    return table;
}

/**
 * Creates cli table based on the list of dependencies.
 * Starts with only two columns, Dependency Name and NPM version.
 * After that, two columns are added for each project (version and path).
 *
 * @param {Array} dependencies - Array of all dependencies and their instances
 */
function createCliTable(dependencies) {
    var table = new cliTable({
        head: ["Module Name", "NPM Version"],
        style: {
            head: [] //disable colors in header cells
        },
        wordWrap: true
    });
	
    //Add each project to the header
    for (p in globalProjects) {
        table.options.head.push(globalProjects[p]);
        table.options.head.push(globalProjects[p] + " Path");
    }
	
    dependencies.forEach(function(dependency) {
        var dependencyName = dependency.name;
        var rowSpan = dependency.maxinstances;
        var npmVersion = color.colorVersion(dependency.npmVersion);
        var instances = dependency.instances;
        var rows = [];
		
        //Fill the first two columns: Dependency Name | Npm version
        rows.push([{rowSpan: rowSpan, content: dependencyName}, npmVersion]);
        while (rows.length < rowSpan) {
            rows.push([""]);
        }

        for (p in globalProjects) {
            //Filter all instances from first project, then second, third, etc.
            var projectInstances = instances.filter(function(i) {
                return i.projectNumber == p;
            });
            
            //Concat two colums to the table: Project Version | Project Path
            for (var i = 0; i < rowSpan; i++) {
                if (projectInstances[i]) {
                    var instance = projectInstances[i];
                    var version = color.colorVersion(instance);
                    rows[i] = rows[i].concat([version, instance.path]);
                } else {
                    rows[i] = rows[i].concat(["", ""]);
                }
            }
        }
        //Add each row to the table
        for (r in rows) {
            table.push(rows[r]);
        }
    });
    console.log(table.toString());
}

/**
 * Compares and matches dependencies from two arrays of dependencies
 * from projects.
 *
 * @param {Object} projectOne Dependencies from project 1
 * @param {Object} projectTwo Dependencies from project 2
 * @param {function} done callback
 */
function compareAndMatch(projectOne, projectTwo, done) {
    globalProjectOne = projectOne.name; //needed to seperate totals
    globalProjectTwo = projectTwo.name;
	
    //Create new object, ordered by dependencies
    var projectOneDep = projectOne.dependencies;
    var projectTwoDep = projectTwo.dependencies;
    var dependencies = [];
    // Checks
    for (var dep in projectOneDep) {
        if (projectTwoDep[dep]) {
            var matchedDeps = [];
            for (var instance in projectOneDep[dep]) {
                matchedDeps[matchedDeps.length] = {
                    version: projectOneDep[dep][instance].version,
                    Project: projectOne.name,
                    projectNumber: 1,
                    path: projectOneDep[dep][instance].path,
                    color: "white"
                };
            }
            for (var instance in projectTwoDep[dep]) {
                matchedDeps[matchedDeps.length] = {
                    version: projectTwoDep[dep][instance].version,
                    Project: projectTwo.name,
                    projectNumber: 2,
                    path: projectTwoDep[dep][instance].path,
                    color: "white"
                };
            }
            dependencies[dependencies.length] = {
                name: dep,
                maxinstances: Math.max(projectOneDep[dep].length,
                    projectTwoDep[dep].length),
                instances: matchedDeps
            };
            delete projectTwoDep[dep];
            delete projectOneDep[dep];
        }
    }
    if (!commander.hideUnmatched) {
        for (var dep in projectOneDep) {
            var matchedDeps = [];
            for (var instance in projectOneDep[dep]) {
                matchedDeps[matchedDeps.length] = {
                    version: projectOneDep[dep][instance].version,
                    Project: projectOne.name,
                    projectNumber: 1,
                    path: projectOneDep[dep][instance].path,
                    color: "white"
                };
                summarizer.totals.projectOne.unmatched++;
            }
            dependencies[dependencies.length] = {
                name: dep,
                maxinstances: projectOneDep[dep].length,
                instances: matchedDeps
            };
        }
        for (var dep in projectTwoDep) {
            var matchedDeps = [];
            for (var instance in projectTwoDep[dep]) {
                matchedDeps[matchedDeps.length] = {
                    version: projectTwoDep[dep][instance].version,
                    Project: projectTwo.name,
                    projectNumber: 2,
                    path: projectTwoDep[dep][instance].path,
                    color: "white"
                };
                summarizer.totals.projectTwo.unmatched++;
            }

            dependencies[dependencies.length] = {
                name: dep,
                maxinstances: projectTwoDep[dep].length,
                instances: matchedDeps
            };
        }
    }
    getNPMVersions(dependencies, function() {
        return done(dependencies);
    });
}

/**
 * Tries to tick the progress bar
 * NOTE: Progress is not supported on some terminals
 *
 * @param {Object} bar progress bar for pulling version
 */
function tick(bar) {
    try {
        bar.tick();
    } catch (err) {
        //progress bar not supported
    }
}

/**
 * Ensures file path support to relative file paths and cross-platform
 * support.
 *
 * @param {string} project path to project directory
 * @returns {string} path valid path to directory
 */
function validatePath(project) {
    try {
        project = path.normalize(project);
        fs.accessSync(project, fs.F_OK);
    } catch (err) {
        throw Error("Project path is invalid: " + project);
    }
    return path.resolve(project);
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
    color.initializeColors(commander.colorConfig);
    //If the files exist, parse them
    try {
        projectOne = validatePath(projectOne);
        projectTwo = validatePath(projectTwo);
		
        //var depth = 0;
        if (commander.depth >= 1) { //for 1 indexed-commander.depth>0
            var depth = commander.depth - 1;
            var includeDev = commander.all;
            var fileOneParsedDependencies;
            var fileTwoParsedDependencies;

            try {
                fileOneParsedDependencies =
                                    parse.parseDependencies(projectOne,
                                        depth, includeDev);
            } catch (err) {
                throw Error(err.message + " in " + projectOne);
            }

            try {
                fileTwoParsedDependencies =
                                    parse.parseDependencies(projectTwo,
                                        depth, includeDev);
            } catch (err) {
                throw Error(err.message + " in " + projectTwo);
            }
			
            //Here we will compare the dependencies
            compareAndMatch(fileOneParsedDependencies, fileTwoParsedDependencies,
                    function(matchedDependencies) {
                if (process.argv[2] === "compare" ||
                        process.argv[1] === "compare" ||
                        process.argv[2] === "cmp" ||
                        process.argv[1] === "cmp") {
                    createTable(matchedDependencies);
                    if (!commander.commands[0].hideSummary) {
                        summarizer.printSummaryTable(globalProjectOne,
                            globalProjectTwo);
                    }
                    if (commander.commands[0].colorLegend) {
                        color.displayColorLegend();
                    }
                } else if (process.argv[2] === "summary" ||
                        process.argv[1] === "summary" ||
                        process.argv[2] === "sum" ||
                        process.argv[1] === "sum") {
                    if (commander.commands[1].showTable) {
                        createTable(matchedDependencies);
                    }
                    summarizer.printSummaryTable(globalProjectOne,
                        globalProjectTwo);
                }
                logger.logDependencies(matchedDependencies);
                htmlOpener.openHTML(matchedDependencies);
            });
        }else {
            console.log("Invalid depth given.");
            return;
        }
    }catch (err) {
        console.log(err);
        return;
    }
}

/**
 * Parses each project to find all dependencies based on the depth.
 * Each list is then pushed to a 'master' list that contains each
 * dependency from every project
 *
 * @param {Array} projects Array of each node project
 */
function compareProjects(projects) {
    color.initializeColors(commander.colorConfig);
	
    if (commander.depth < 1) {
        console.log("Depth must be greater than 0.");
        return;
    }
	
    var allDependenciesFound = [];
    var depth = commander.depth - 1; //0-index
    var includeDev = commander.all;
	
    for (p in projects) {
        var project = projects[p];
		
        var dependencies;
        try {
            dependencies = parse.parseDependencies(project, depth, includeDev);
        } catch (err) {
            throw Error(err.message + " in " + project);
        }
        if (dependencies) {
            allDependenciesFound.push(dependencies);
        }
    }
	
    matchDependencies(allDependenciesFound, function(matchedDependencies) {
        //Do whatever with the list of dependencies
        //Print cli table for now
        createCliTable(matchedDependencies);
    });
}

/**
 * Matches each dependency found in each project to compile a
 * list of instances in while that dependency occurs. The final
 * JSON object will be in this format:
 *  {
 *		name: NameOfDependency,
 *		maxinstances: maxinstances,
 *		instances: [
 *			{
 *				version: '0.0.0',
 *				Project: NameOfProject,
 *				projectNumber: 1,
 *				path: path/to/instance
 *				color: upToDate
 *			}, {...}
 *		],
 *		npmVersion: { version: '0.0.0', color: upToDate }
 *	}
 *
 * @param {Array} allDependencies The 'master' list containing
 *				  each dependency from each project
 * @param {function} done Callback
 */
function matchDependencies(allDependencies, done) {
    var dependencies = [];
	
    //Create JSON representation in parallel
    async.each(allDependencies, function(project, projectCallback) {
        var projectName = project.name;
        var projectNumber = allDependencies.indexOf(project);
        globalProjects[projectNumber] = projectName; //Add project to global list
        for (d in project.dependencies) {
            var dependencyName = d;
            var dependency = project.dependencies[d];
            var maxinstances = dependency.length;
			
            //Searches the array for an existing object
            var index = dependencies.find(function(a) {
                return a.name === dependencyName;
            });
			
            var instances = [];
            for (i in dependency) {
                var instance = {
                    version: dependency[i].version,
                    Project: projectName,
                    projectNumber: projectNumber,
                    path: dependency[i].path,
                    color: "white"
                };
                instances.push(instance);
            }
            if (!index) {
                var item = {
                    name: dependencyName,
                    maxinstances: maxinstances,
                    instances: instances
                };
                dependencies.push(item);
            } else {
                index.instances = index.instances.concat(instances);
                if (maxinstances > index.maxinstances) {
                    index.maxinstances = maxinstances;
                }
            }
        }
        return projectCallback();
    }, function(err) { //Called when every dependency is finished
        getNPMVersions(dependencies, function() {
            return done(dependencies);
        });
    });
}

/**
 * Uses 'latest-version' to pull the most-up-to-date version
 * of each dependency from the NPM registery. Then each version
 * is colored based on the latest version.
 *
 * A progress bar is displayed during the look-up.
 *
 * @param {Array} dependencies Array of each dependency
 * @param {function} done Callback with the dependency array when done
 */
function getNPMVersions(dependencies, done) {
    var bar = new ProgressBar("pulling npm versions [:bar] :percent",{
        complete: "=",
        incomplete: " ",
        width: 40,
        total: dependencies.length + 1,
        clear: true
    });
    tick(bar); //start the progress bar
	
    //Lookup each version in parallel
    async.each(dependencies, function(dependency, callback) {
        var name = dependency.name;
        latestVersion(name).then(function(version) {
            color.assignColor(dependency.instances, version.trim(),
				summarizer, function(coloredVersion) {
    dependency.npmVersion = coloredVersion;
    tick(bar);
    return callback();
			});
        });
    }, function(err) { //Called when every dependency is finished
        tick(bar);
        return done(dependencies);
    });
}

/**
 * Prints out a table of the total occurrences of major, minor,
 * patch, and unmatched modules found.
 */
function generateSummaryTable(projectOne, projectTwo) {
    compare(projectOne, projectTwo);
}

/**
 * Takes the directory from the command and checks
 * for Node projects.
 *
 * @param {string} directory String representation of a directory
 */
function parseDirectory(directory) {
    if (!directory) {
        directory = ".";
    }
    parse.getNodeProjects(directory, function(projects) {
        if (projects) {
            compareProjects(projects);
        }
    });
}

//Commander lines go below this comment
commander
    .version(pjson.version)
    .option("-d, --depth [depth]", "Compare by looking at " +
        "dependencies' dependencies down to a certain 'depth'", "1")
    .option("-a, --all", "Includes devDependencies during " +
        "comparison")
    .option("-c, --colorConfig [colorConfig]",
        "Loads the entered color scheme from the color config.",
        "'Standard'")
    .option("-u, --hideUnmatched","Hides unmatched dependencies");

//All commands need a command, description, alias, and action
commander
    .command("compare [fileOne] [fileTwo]")
    .alias("cmp")
    .description("Compare the dependencies of two projects")
    .option("-l, --colorLegend",
        "Display a table that shows what each of the colors mean.")
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

commander
	.command("topDir [topDirectory]")
	.alias("dir")
	.description("Parses through the directory for node projects.")
	.action(parseDirectory);

commander.parse(process.argv);

module.exports = {
    compare: compare
};

if (!process.argv.slice(2).length) {
    parseDirectory(path.normalize("."));
}

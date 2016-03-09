#!/usr/bin/env node

/*
 * Command line application that compares the dependency versions
 * of two projects.
 */

/*Begin 'require' Import Statements*/
var cliTable = require("cli-table2");
var textTable = require("text-table");
var commander = require("commander");
var exec = require("child_process").exec;
var async = require("async");
var deasync = require("deasync");
var ProgressBar = require("progress");
var clc = require("cli-color");
var path = require("path");
var osUtils = require("os-utils");
var pjson = require(path.normalize("../package.json"));
var logger = require(path.normalize("../modules/logger"));
var color = require(path.normalize("../modules/colors"));
var summarizer = require(path.normalize("../modules/summary"));
var parse = require(path.normalize("../modules/parse"));
/*End 'require' Import Statements*/

/*Begin Global Variables*/
var globalProjectOne;
var globalProjectTwo;
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
    var projectOneName;
    var projectTwoName;

    var table = new cliTable({
        head: ["Module Name", "NPM Version", "", "", "", ""],
        style: {
            head: [] //disable colors in header cells
        },
        wordWrap: true
    });

    if (dependencies) {
        dependencies.forEach(function(dependency) {
            var dependencyName = dependency.name;
            var rowSpan = dependency.maxinstances;
            var npmVersion = dependency.npmVersion;
            var instances = dependency.instances;
            var rows = [];

            for (i in instances) {
                var instance = instances[i];
                if (instance.color == "upToDate") {
                    var instanceVersion
                        = color.colorScheme.upToDate(instance.version);
                } else if (instance.color == "minor") {
                    var instanceVersion
                        = color.colorScheme.minor(instance.version);
                } else if (instance.color == "patch") {
                    var instanceVersion
                        = color.colorScheme.patch(instance.version);
                } else if (instance.color == "major") {
                    var instanceVersion
                        = color.colorScheme.major(instance.version);
                } else {
                    var instanceVersion
                        = color.colorScheme.unmatched(instance.version);
                }
                if (i == 0) { //first instance fills in Module name
                    if (!projectOneName) {
                        projectOneName = instance.Project;
                        table.options.head[2] = projectOneName;
                        table.options.head[3] = projectOneName +
                            " Path";
                    }
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
                    if (!projectTwoName) { //sets the name of
                        // Project 2 if previously undefined
                        projectTwoName = instance.Project;
                        table.options.head[4] = projectTwoName;
                        table.options.head[5] = projectTwoName +
                            " Path";
                    }
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
 * Compares and matches dependencies from two arrays of dependencies
 * from projects.
 * **Must be edited for comparing with depth.
 *
 * @param {Object} projectOne Dependencies from project 1
 * @param {Object} projectTwo Dependencies from project 2
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
                    path: projectOneDep[dep][instance].path,
                    color: "white"
                };
            }
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
    var bar = new ProgressBar("pulling npm versions [:bar] :percent",{
        complete: "=",
        incomplete: " ",
        width: 40,
        total: dependencies.length,
        clear: true
    });
    try {
        bar.tick();
    } catch (err) {
        //progress bar not supported
    }
    var processCount = 0;
    async.each(dependencies, function(dependency, callback) {
        var name = dependency.name;
        processCount++;
        exec("npm view " + name + " version",
                function(error, stdout, stderr) {
            processCount--;
            color.assignColor(dependency.instances, stdout.trim(),
                    function(coloredVersion, globalProjectOne,
                    globalProjectTwo) {
                dependency.npmVersion = coloredVersion;
                try {
                    bar.tick();
                } catch (err) {
                    //progress bar not supported
                }
                return callback();
            });
        });
        deasync.loopWhile(function() {
            return (processCount > 30 || osUtils.freememPercentage() < 0.35);
        });
    }, function(err) {
        return done(dependencies);
    });
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
    if (true) {
        color.colorScheme.minor = clc.xterm(202);
        color.loadConfigColors(commander.colorConfig);
    }

    //If the files exist, parse them
    try {
        try {
            projectOne = path.normalize(projectOne);
        } catch (err) {
            throw Error("First project path is invalid: " + projectOne);
        }
        try {
            projectTwo = path.normalize(projectTwo);
        } catch (err) {
            throw Error("Second project path is invalid: " + projectTwo);
        }
		
        //var depth = 0;
        if (commander.depth >= 1) { //for 1 indexed-commander.depth>0
            var depth = commander.depth - 1;
            var includeDev = commander.all;
            var fileOneParsedDependencies;
            var fileTwoParsedDependencies;

            try {
                fileOneParsedDependencies
                                    = parse.parseDependencies(projectOne, depth, includeDev);
            } catch (err) {
                throw Error(err.message + " in " + projectOne);
            }

            try {
                fileTwoParsedDependencies
                                    = parse.parseDependencies(projectTwo, depth, includeDev);
            } catch (err) {
                throw Error(err.message + " in " + projectTwo);
            }

            //Combine the parsed projects
            var combined = {
                project1: fileOneParsedDependencies,
                project2: fileTwoParsedDependencies
            };
            //Here we will compare the dependencies
            compareAndMatch(combined.project1,combined.project2,
                    function(matchedDependencies) {
                if (process.argv[2] === "compare" ||
                        process.argv[1] === "compare" ||
                        process.argv[2] === "cmp" ||
                        process.argv[1] === "cmp") {
                    createTable(matchedDependencies);
                    if (!commander.commands[0].hideSummary) {
                        summarizer.printSummaryTable(globalProjectOne,globalProjectTwo);
                    }
                    if (commander.commands[0].colorLegend) {
                        color.displayColorLegend();
                    }
                    logger.logDependencies(matchedDependencies,
                        commander.commands[0].output);
                }else if (process.argv[2] === "summary" ||
                        process.argv[1] === "summary" ||
                        process.argv[2] === "sum" ||
                        process.argv[1] === "sum") {
                    if (commander.commands[1].showTable) {
                        createTable(matchedDependencies);
                    }
                    summarizer.printSummaryTable(globalProjectOne,globalProjectTwo);
                }
            });
        }else {
            console.log("Invalid depth given.");
            return 1;
        }
    }catch (err) {
        console.log(err);
        return 1;
    }
}

/**
 * Prints out a table of the total occurrences of major, minor,
 * patch, and unmatched modules found.
 */
function generateSummaryTable(projectOne, projectTwo) {
    compare(projectOne, projectTwo);
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

commander.parse(process.argv);

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
var logger = require(path.normalize("../logger/depLogger"));
/*End 'require' Import Statements*/

/*Begin Global Variables*/
var customColorsSupported = true;

var globalProjectOne;
var globalProjectTwo;

/*
 Numbers used are xterm color numbers.
 They can be found here:
 https://en.wikipedia.org/wiki/File:Xterm_256color_chart.svg
 */
var colorScheme = {
    patch: clc.yellowBright,
    minor: clc.magentaBright,
    major: clc.redBright,
    upToDate: clc.greenBright,
    unmatched: clc.whiteBright
};

var totals = {
    projectOne: {
        major: 0,
        minor: 0,
        patch: 0,
        unmatched: 0
    },
    projectTwo: {
        major: 0,
        minor: 0,
        patch: 0,
        unmatched: 0
    }
};
/*End Global Variables*/

/**
 * Checks for xterm compatibility.
 *
 * @returns {boolean} true if console supports xterm colors
 */
function checkForXterm() {
    var orange = clc.xterm(202);
    var red = clc.redBright;
    customColorsSupported = !(orange("A") === red("A"));
    return customColorsSupported;
}

/**
 * Selects which colors to load from the config.
 *
 * @param {String} typeOfColors A string that is the name of the area
 * of the config that should be loaded
 */
function loadConfigColors(typeOfColors) {
    if (checkForXterm()) {
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
 * Sets the colors in the standard section of the color config as the
 * current color scheme.
 */
function loadStandardConfigColors() {
    if (checkForXterm()) {
        try {
            var colorConfig = require(
                path.normalize("../colorConfig.json"));
            if (colorConfig.Standard.major) {
                colorScheme.major = clc.xterm(
                    colorConfig.Standard.major);
            }
            if (colorConfig.Standard.minor) {
                colorScheme.minor = clc.xterm(
                    colorConfig.Standard.minor);
            }
            if (colorConfig.Standard.patch) {
                colorScheme.patch = clc.xterm(
                    colorConfig.Standard.patch);
            }
            if (colorConfig.Standard.upToDate) {
                colorScheme.upToDate = clc.xterm(
                    colorConfig.Standard.upToDate);
            }
            if (colorConfig.Standard.unmatched) {
                colorScheme.unmatched = clc.xterm(
                    colorConfig.Standard.unmatched);
            }
        } catch (err) {
            throw Error(err.message);
        }
    }

}

/**
 * Sets the colors in the color blind section of the color config as
 * the current color scheme.
 */
function loadColorBlindConfigColors() {
    if (checkForXterm()) {
        try {
            var colorConfig = require(
                path.normalize("../colorConfig.json"));
            if (colorConfig.ColorBlind.major) {
                colorScheme.major = clc.xterm(
                    colorConfig.ColorBlind.major);
            }
            if (colorConfig.ColorBlind.minor) {
                colorScheme.minor = clc.xterm(
                    colorConfig.ColorBlind.minor);
            }
            if (colorConfig.ColorBlind.patch) {
                colorScheme.patch = clc.xterm(
                    colorConfig.ColorBlind.patch);
            }
            if (colorConfig.ColorBlind.upToDate) {
                colorScheme.upToDate = clc.xterm(
                    colorConfig.ColorBlind.upToDate);
            }
            if (colorConfig.ColorBlind.unmatched) {
                colorScheme.unmatched = clc.xterm(
                    colorConfig.ColorBlind.unmatched);
            }
        } catch (err) {
            throw Error("colorConfig is missing or syntax is" +
                " incorrect.");
        }
    }

}

/**
 * Turns the string representation of a version into a
 * JSON object with major, minor, and patch elements
 *
 * @param {string} stringVersion String representation of a version
 */
function parseVersion(stringVersion) {
    var splitVersion = stringVersion.split(".");
    var version = {
        major: Number(splitVersion[0]),
        minor: splitVersion.length > 0 ? Number(splitVersion[1]) : 0,
        patch: splitVersion.length > 1 ? Number(splitVersion[2]) : 0
    };
    return version;
}

/**
 * Assigns colors to instances in an array of instances of a
 * dependency based off of the version of that instance and the
 * max version found.
 *
 * @param {Array} instances An array of instances of the dependency
 * @param {JSON} npmVersion The instance's version on npm
 */
function assignColor(instances, npmVersion, callback) {
    parsedNPMVersion = parseVersion(npmVersion);
    for (var i in instances) {
        var instance = instances[i];
        var version = parseVersion(instance.version);
        var lowestColor = 0; //green

        //Compare the version of this instance with the npm version
        if (JSON.stringify(version) === JSON.stringify(parsedNPMVersion)) {
            instance.color = "upToDate";
        } else if (version.major > parsedNPMVersion.major ||
            (version.major == parsedNPMVersion.major &&
            version.minor > parsedNPMVersion.minor) ||
            (version.major == parsedNPMVersion.major &&
            version.minor == parsedNPMVersion.minor &&
            version.patch > parsedNPMVersion.patch)) {
            instance.color = "upToDate";
        }else if (version.major < parsedNPMVersion.major) {
            instance.color = "major";
            if (instance.Project == globalProjectOne) {
                totals.projectOne.major++;
            } else if (instance.Project == globalProjectTwo) {
                totals.projectTwo.major++;
            }
            totals.major++;
            if (lowestColor < 3) {
                lowestColor = 3; //red
            }
        }else if (version.minor < parsedNPMVersion.minor) {
            instance.color = "minor";
            if (instance.Project == globalProjectOne) {
                totals.projectOne.minor++;
            } else if (instance.Project == globalProjectTwo) {
                totals.projectTwo.minor++;
            }
            if (lowestColor < 2) {
                lowestColor = 2; //magenta
            }
        }else if (version.patch < parsedNPMVersion.patch) {
            instance.color = "patch";
            if (instance.Project == globalProjectOne) {
                totals.projectOne.patch++;
            } else if (instance.Project == globalProjectTwo) {
                totals.projectTwo.patch++;
            }
            if (lowestColor < 1) {
                lowestColor = 1; //yellow
            }
        }
    }
    if (lowestColor == 3) {
        npmVersion = colorScheme.major(npmVersion);
    } else if (lowestColor == 2) {
        npmVersion = colorScheme.minor(npmVersion);
    } else if (lowestColor == 1) {
        npmVersion = colorScheme.patch(npmVersion);
    } else {
        npmVersion = colorScheme.upToDate(npmVersion);
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
                        = colorScheme.upToDate(instance.version);
                } else if (instance.color == "minor") {
                    var instanceVersion
                        = colorScheme.minor(instance.version);
                } else if (instance.color == "patch") {
                    var instanceVersion
                        = colorScheme.patch(instance.version);
                } else if (instance.color == "major") {
                    var instanceVersion
                        = colorScheme.major(instance.version);
                } else {
                    var instanceVersion
                        = colorScheme.unmatched(instance.version);
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
                totals.projectOne.unmatched++;
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
                totals.projectTwo.unmatched++;
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
            assignColor(dependency.instances, stdout.trim(),
                    function(coloredVersion) {
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
 * Takes in the location of the root file of the project and outputs
 * an object with the name, path, and dependencies of the project.
 *
 * @param {File} file Location of the root file of the project
 * @param {int} depth Layers of dependencies to look at
 * @returns {Object} {{name: Project Name, path: Project Path,
 * dependencies: Array of Dependencies}}
 */
function parseDependencies(file, depth) {
    //Get the package.json for the project
    var filePackage = require(path.normalize(file + "/package.json"));
    //Get the dependencies of the project
    //var fileDep = filePackage.dependencies;
    //Store the name and path of the project
    var fileParsedDependencies = {
        name: filePackage.name.toString(),
        path: file.toString(),
        dependencies: []
    };
    //Iterate through dependencies and save them in the
    // specified format
    parseDependenciesRecursively(file,depth,
        fileParsedDependencies.dependencies,".");

    //Return the completed and parsed json object with the
    // dependencies
    return fileParsedDependencies;
}

function parseDependenciesRecursively(file, depth, dependencies,
		previousDependencyPath) {
    //Get the package.json for the project
    var filePackage = require(path.normalize(file + "/package.json"));
    //Get the dependencies of the project
    var fileDep = filePackage.dependencies;
    if (commander.all) {
        for (devDep in filePackage.devDependencies) {
            if (!fileDep[devDep]) {
                fileDep[devDep] = devDep.version;
            }
        }
    }
    //Iterate through dependencies and save them in the specified
    // format
    for (dep in fileDep) {
        try {
            if (!dependencies[dep]) {
                dependencies[dep] = [];
            }
            var dependency = require(path.normalize(file +
                "/node_modules/" + dep + "/package.json"));
            dependencies[dep][dependencies[dep].length] =
            {
                version: dependency.version,
                path: path.normalize(previousDependencyPath +
                    "/node_modules/" + dep)
            };

            if (depth - 1 >= 0) {
                parseDependenciesRecursively(path.normalize(file +
                    "/node_modules/" + dep), depth - 1, dependencies,
                    path.normalize(previousDependencyPath +
                        "/node_modules/" + dep));

            }
        } catch (err) {
            // No node_modules after a certain depth so module not
            // found and is skipped
        }
    }
}
/**
 * Displays a legend that shows what each of the colors mean.
 */
function displayColorLegend() {
    var colorLegendTable = new cliTable();
    colorLegendTable.push([colorScheme.major("Major Difference"),
        colorScheme.minor("Minor Difference"),
        colorScheme.patch("Patch Difference")]);
    colorLegendTable.push([colorScheme.upToDate("Up to Date"),
        colorScheme.unmatched("Unmatched")]);

    console.log(colorLegendTable.toString());
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
    if (customColorsSupported) {
        colorScheme.minor = clc.xterm(202);
        loadConfigColors(commander.colorConfig);
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
            //Parse project one
            try {
                var fileOneParsedDependencies
                                    = parseDependencies(projectOne, depth);
            } catch (err) {
                throw Error(err.message + " in " + projectOne);
            }
            
            //Parse project two
            try {
                var fileTwoParsedDependencies
                                    = parseDependencies(projectTwo, depth);
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
                        printSummaryTable();
                    }
                    if (commander.commands[0].colorLegend) {
                        displayColorLegend();
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
                    printSummaryTable();
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
 * Prints the summary table.
 */
function printSummaryTable() {
    if (globalProjectOne == globalProjectTwo) {
        totals.projectOne.major /= 2;
        totals.projectOne.minor /= 2;
        totals.projectOne.patch /= 2;
        totals.projectTwo = totals.projectOne;
    }
    var summaryTable = textTable([
    ["", "Project One", "Project Two"],
    ["major", totals.projectOne.major, totals.projectTwo.major],
    ["minor", totals.projectOne.minor, totals.projectTwo.minor],
    ["patch", totals.projectOne.patch, totals.projectTwo.patch],
    ["unmatched", totals.projectOne.unmatched, totals.projectTwo.unmatched]
    ], {align: ["l", "l", "l"]});
    console.log(summaryTable);
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

/**
 * Created by farrowc on 3/7/2016.
 */

var clc = require("cli-color");
var path = require("path");
var parse = require(path.normalize("../modules/parse"));
var cliTable = require("cli-table2");



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

/**
 * Checks for xterm compatibility.
 *
 * @returns {boolean} true if console supports xterm colors
 */
function checkForXterm() {
    var orange = clc.xterm(202);
    var red = clc.redBright;
    return !(orange("A") === red("A"));;
}

/**
 * Selects which colors to load from the config.
 *
 * @param {String} typeOfColors A string that is the name of the area
 * of the config that should be loaded
 */
function loadConfigColors(typeOfColors) {
    if (true) {
        var colorConfig = require(
            path.normalize("../colorConfig.json"));
        if(colorConfig[typeOfColors]!=undefined) {
            if (colorConfig[typeOfColors].major) {
                colorScheme.major = clc.xterm(
                    colorConfig.Standard.major);
            }
            if (colorConfig[typeOfColors].minor) {
                colorScheme.minor = clc.xterm(
                    colorConfig.Standard.minor);
            }
            if (colorConfig[typeOfColors].patch) {
                colorScheme.patch = clc.xterm(
                    colorConfig.Standard.patch);
            }
            if (colorConfig[typeOfColors].upToDate) {
                colorScheme.upToDate = clc.xterm(
                    colorConfig.Standard.upToDate);
            }
            if (colorConfig[typeOfColors].unmatched) {
                colorScheme.unmatched = clc.xterm(
                    colorConfig.Standard.unmatched);
            }
        }
        else{
            if (colorConfig["Standard"].major) {
                colorScheme.major = clc.xterm(
                    colorConfig.Standard.major);
            }
            if (colorConfig["Standard"].minor) {
                colorScheme.minor = clc.xterm(
                    colorConfig.Standard.minor);
            }
            if (colorConfig["Standard"].patch) {
                colorScheme.patch = clc.xterm(
                    colorConfig.Standard.patch);
            }
            if (colorConfig["Standard"].upToDate) {
                colorScheme.upToDate = clc.xterm(
                    colorConfig.Standard.upToDate);
            }
            if (colorConfig["Standard"].unmatched) {
                colorScheme.unmatched = clc.xterm(
                    colorConfig.Standard.unmatched);
            }
        }
    }
}

/**
 * Assigns colors to instances in an array of instances of a
 * dependency based off of the version of that instance and the
 * max version found.
 *
 * @param {Array} instances An array of instances of the dependency
 * @param {JSON} npmVersion The instance's version on npm
 */
function assignColor(instances, npmVersion, callback, globalProjectOne,
                     globalProjectTwo) {
    parsedNPMVersion = parse.parseVersion(npmVersion);
    for (var i in instances) {
        var instance = instances[i];
        var version = parse.parseVersion(instance.version);
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
                summarizer.totals.projectOne.major++;
            } else if (instance.Project == globalProjectTwo) {
                summarizer.totals.projectTwo.major++;
            }
            summarizer.totals.major++;
            if (lowestColor < 3) {
                lowestColor = 3; //red
            }
        }else if (version.minor < parsedNPMVersion.minor) {
            instance.color = "minor";
            if (instance.Project == globalProjectOne) {
                summarizer.totals.projectOne.minor++;
            } else if (instance.Project == globalProjectTwo) {
                summarizer.totals.projectTwo.minor++;
            }
            if (lowestColor < 2) {
                lowestColor = 2; //magenta
            }
        }else if (version.patch < parsedNPMVersion.patch) {
            instance.color = "patch";
            if (instance.Project == globalProjectOne) {
                summarizer.totals.projectOne.patch++;
            } else if (instance.Project == globalProjectTwo) {
                summarizer.totals.projectTwo.patch++;
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

module.exports = {colorScheme: colorScheme,
    checkForXterm: checkForXterm,
    loadConfigColors: loadConfigColors,
    assignColor: assignColor,
    displayColorLegend: displayColorLegend};
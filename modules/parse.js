var path = require("path");
var fs = require("fs");
var allDependencies;

/**
 * Turns the string representation of a version into a
 * JSON object with major, minor, and patch elements
 *
 * @param {string} stringVersion String representation of a version
 */
function parseVersion(stringVersion) {
    var version;
    if (stringVersion) {
        if (/^(\d+\.)?(\d+\.)?(\*|\d+).*$/.test(stringVersion)){
            var splitVersion = stringVersion.split(".");
            var version = {
                major: Number(splitVersion[0]),
                minor: splitVersion.length > 1 ? Number(splitVersion[1]) : 0,
                patch: splitVersion.length > 2 ? Number(splitVersion[2].charAt(0)) : 0
            };
            if (splitVersion[2] && splitVersion[2].length > 1){
                version.stage = splitVersion[2].substr(2);
            }
        }
    }
    return version;
}

/**
 * Returns all the node projects in the given directory
 *
 * @param {string} directory String representation of a directory
 */
function getNodeProjects(directory) {
	var projects = [];
	try {
		directory = path.normalize(directory);
		var content = fs.readdirSync(directory);
		for (d in content){
			var dir = path.join(directory, content[d]);
			var stats = fs.statSync(dir);
			if (stats && stats.isDirectory()){
				var project = fs.readdirSync(dir);
				if (project && project.indexOf("package.json") > -1){
					projects.push(content[d]);
				}
			}
		}
	} catch (err) {
		var message = err.code === "ENOENT" ? 
			"Error: Directory not found \'" + directory + "\'" :
			"Error: Failure reading directory \'" + directory + "\'";
		console.log(message);
		return;
	}
	if (projects.length < 1){
		console.log("No projects in directory: \'" + directory + "\'");
		return;
	}
	return projects;
}

/**
 * Takes in the location of the root file of the project and outputs
 * an object with the name, path, and dependencies of the project.
 *
 * @param {string} project Location of the root file of the project
 * @param {int} depth Layers of dependencies to look at
 * @param {bool} includeDev Includes devDependencies
 * @returns {Object} {{name: Project Name, path: Project Path,
 * dependencies: Array of Dependencies}}
 */
function parseDependencies(project, depth, includeDev) {
    allDependencies = includeDev;
    var packageJSON = require(path.normalize(project + "/package.json"));

    var fileParsedDependencies = {
        name: packageJSON.name.toString(),
        path: project.toString(),
        dependencies: []
    };

    parseDependenciesRecursively(project, depth,
        fileParsedDependencies.dependencies, ".");

    return fileParsedDependencies;
}

function parseDependenciesRecursively(project, depth, dependencies,
                                      previousDependencyPath) {
    //Get the package.json for the project
    var packageJSON = require(path.normalize(project + "/package.json"));
    //Get the dependencies of the project
    var fileDep = packageJSON.dependencies;
    if (allDependencies) {
        for (devDep in packageJSON.devDependencies) {
            if (!fileDep[devDep]) {
                fileDep[devDep] = devDep.version;
            }
        }
    }
    for (dep in fileDep) {
        try {
            if (!dependencies[dep]) {
                dependencies[dep] = [];
            }
            var dependency = require(path.normalize(project +
                "/node_modules/" + dep + "/package.json"));
            dependencies[dep][dependencies[dep].length] =
            {
                version: dependency.version,
                path: path.normalize(previousDependencyPath +
                    "/node_modules/" + dep)
            };

            if (depth - 1 >= 0) {
                parseDependenciesRecursively(path.normalize(project +
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

module.exports = {
    parseVersion: parseVersion,
    parseDependencies: parseDependencies,
	getNodeProjects: getNodeProjects
}
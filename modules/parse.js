var path = require("path");
var allDependencies;

/**
 * Turns the string representation of a version into a
 * JSON object with major, minor, and patch elements
 *
 * @param {string} stringVersion String representation of a version
 */
function parseVersion(stringVersion) {
    if (stringVersion) {
        var splitVersion = stringVersion.split(".");
        var version = {
            major: Number(splitVersion[0]),
            minor: splitVersion.length > 1 ? Number(splitVersion[1]) : 0,
            patch: splitVersion.length > 2 ? Number(splitVersion[2]) : 0
        };
        return version;
    }
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
    parseDependencies: parseDependencies
}
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

module.exports = {
    parseVersion: parseVersion
}
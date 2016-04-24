/**
 * Created by farrowc on 3/23/2016.
 */
var chai = require("chai");
var sinon = require("mocha-sinon");
var expect = chai.expect;
var assert = chai.assert;
var cliTable = require("cli-table2");
var childProcess = require("child_process");
var clc = require("cli-color");
var path = require("path");
var summarizer = require(path.normalize("../../modules/summary"));
var colors = require(path.normalize("../../modules/colors"));

describe("Color Tests", function() {
    describe("Check for Custom Color Support Tests", function() {
        it("Should properly return false if custom colors aren't supported and True if they are", function() {
            var orange = clc.xterm(202);
            var red = clc.redBright;
            var customColorsSupported =  !(orange("A") === red("A"));
            assert.equal(customColorsSupported,colors.checkForXterm());
        });
    });
    describe("colorVersion Tests", function() {
        it("Should give the up to date color when an instance is up to date", function() {
            var instance = {
                version: "poopInstance",
                color: "upToDate"
            };
            var versionedInstance = colors.colorScheme.upToDate(instance.version);
            assert.equal(colors.colorVersion(instance),versionedInstance);
        });
        it("Should give the patch update color when an instance is behind by a patch", function() {
            var instance = {
                version: "poopInstance",
                color: "patch"
            };
            var versionedInstance = colors.colorScheme.patch(instance.version);
            assert.equal(colors.colorVersion(instance),versionedInstance);
        });
        it("Should give the minor update color when an instance is behind by a minor update", function() {
            var instance = {
                version: "poopInstance",
                color: "minor"
            };
            var versionedInstance = colors.colorScheme.minor(instance.version);
            assert.equal(colors.colorVersion(instance),versionedInstance);
        });
        it("Should give the major update color when an instance is behind by a major update", function() {
            var instance = {
                version: "poopInstance",
                color: "major"
            };
            var versionedInstance = colors.colorScheme.major(instance.version);
            assert.equal(colors.colorVersion(instance),versionedInstance);
        });
        it("Should give the unmatched color when an instance is unmatched", function() {
            var instance = {
                version: "poopInstance",
                color: "unmatched"
            };
            var versionedInstance = colors.colorScheme.unmatched(instance.version);
            assert.equal(colors.colorVersion(instance),versionedInstance);
        });
        it("Should give the unmatched color when an instance does not have a color", function() {
            var colors = require("../../modules/colors");
            var instance = {
                version: "poopInstance"
            };
            var versionedInstance = colors.colorScheme.unmatched(instance.version);
            assert.equal(colors.colorVersion(instance),versionedInstance);
        });
        it("Should give the unmatched color when an instance has an incorrect color assignment", function() {
            var colors = require("../../modules/colors");
            var instance = {
                version: "poopInstance",
                color: "poopColor"
            };
            var versionedInstance = colors.colorScheme.unmatched(instance.version);
            assert.equal(colors.colorVersion(instance),versionedInstance);
        });
    });
    describe("assignColor Tests", function() {
        var instances = [{
            "version": "2.0.0", //ahead
            "Project": "dependency-comparator",
            "projectNumber": 0,
            "path": "node_modules/jenkins",
            "color": "upToDate"
        }, {
            "version": "1.13.1", //up to date
            "Project": "sample-webservice",
            "projectNumber": 0,
            "path": "node_modules/jenkins",
            "color": "upToDate"
        }, {
            "version": "1.13.0", //patch
            "Project": "sample-webservice",
            "projectNumber": 1,
            "path": "node_modules/jenkins",
            "color": "upToDate"
        }, {
            "version": "1.10.0", //minor
            "Project": "sample-webservice",
            "projectNumber": 1,
            "path": "node_modules/jenkins",
            "color": "upToDate"
        }, {
            "version": "0.10.0", //major
            "Project": "sample-webservice",
            "projectNumber": 1,
            "path": "node_modules/jenkins",
            "color": "upToDate"
        }];
        var npmVersion = "1.13.1";

        beforeEach(function() {
            var totals = [{
                name: "Project1",
                major: 0,
                minor: 0,
                patch: 0,
                unmatched: 0
            }, {
                name: "Project2",
                major: 0,
                minor: 0,
                patch: 0,
                unmatched: 0
            }];
            summarizer.totals.length = 0;
            summarizer.totals.push(totals[0]);
            summarizer.totals.push(totals[1]);
			
            for (i in instances) {
                instances[i].color = "upToDate";
            }
        });

        it("should apply the appropiate colors to each instance and npmversion", function() {
            colors.assignColor(instances, npmVersion,
                summarizer, function(coloredVersion) {
                    assert.equal(instances[0].color, "upToDate");
                    assert.equal(instances[1].color, "upToDate");
                    assert.equal(instances[2].color, "patch");
                    assert.equal(instances[3].color, "minor");
                    assert.equal(instances[4].color, "major");
                    assert.equal(coloredVersion.version, npmVersion, "npmVersion");
                    assert.equal(coloredVersion.color, "major", "npmVersion colored to the most outdated version");
                    assert.equal(summarizer.totals[0].major, 0, "no major changes in P1");
                    assert.equal(summarizer.totals[0].minor, 0, "no minor changes in P1");
                    assert.equal(summarizer.totals[0].patch, 0, "no patch changes in P1");
                    assert.equal(summarizer.totals[0].unmatched, 0, "same dependency");
                    assert.equal(summarizer.totals[1].major, 1, "no major changes in P1");
                    assert.equal(summarizer.totals[1].minor, 1, "no minor changes in P1");
                    assert.equal(summarizer.totals[1].patch, 1, "no patch changes in P1");
                    assert.equal(summarizer.totals[1].unmatched, 0, "same dependency");
                });
        });
        it("should color the npmversion to match the lowest version: aheadOfDate", function() {
            var subInstances = [instances[0]];
            colors.assignColor(subInstances, npmVersion,
                summarizer, function(coloredVersion) {
                    assert.equal(subInstances[0].color, "upToDate");
                    assert.equal(coloredVersion.version, npmVersion, "npmVersion");
                    assert.equal(coloredVersion.color, "upToDate", "npmVersion color matches most outdated version");
                });
        });
        it("should color the npmversion to match the lowest version: upToDate", function() {
            var subInstances = [instances[1]];
            colors.assignColor(subInstances, npmVersion,
                summarizer, function(coloredVersion) {
                    assert.equal(subInstances[0].color, "upToDate");
                    assert.equal(coloredVersion.version, npmVersion, "npmVersion");
                    assert.equal(coloredVersion.color, "upToDate", "npmVersion color matches most outdated version");
                });
        });
        it("should color the npmversion to match the lowest version: patch", function() {
            var subInstances = [instances[2]];
            colors.assignColor(subInstances, npmVersion,
                summarizer, function(coloredVersion) {
                    assert.equal(subInstances[0].color, "patch");
                    assert.equal(coloredVersion.version, npmVersion, "npmVersion");
                    assert.equal(coloredVersion.color, "patch", "npmVersion color matches most outdated version");
                    assert.equal(summarizer.totals[1].patch, 1, "patch increased by one");
                });
        });
        it("should color the npmversion to match the lowest version: minor", function() {
            var subInstances = [instances[3]];
            colors.assignColor(subInstances, npmVersion,
                summarizer, function(coloredVersion) {
                    assert.equal(subInstances[0].color, "minor");
                    assert.equal(coloredVersion.version, npmVersion, "npmVersion");
                    assert.equal(coloredVersion.color, "minor", "npmVersion color matches most outdated version");
                    assert.equal(summarizer.totals[1].minor, 1, "minor increased by one");
                });
        });
        it("should color the npmversion to match the lowest version: major", function() {
            var subInstances = [instances[4]];
            colors.assignColor(subInstances, npmVersion,
                summarizer, function(coloredVersion) {
                    assert.equal(subInstances[0].color, "major");
                    assert.equal(coloredVersion.version, npmVersion, "npmVersion");
                    assert.equal(coloredVersion.color, "major", "npmVersion color matches most outdated version");
                    assert.equal(summarizer.totals[1].major, 1, "major increased by one");
                });
        });
        it("should not change color if npmVersion unavaliable or not found", function() {
            var badVersion;
            colors.assignColor(instances, badVersion,
                summarizer, function(coloredVersion) {
                    assert.equal(instances[0].color, "upToDate");
                    assert.equal(instances[1].color, "upToDate");
                    assert.equal(instances[2].color, "upToDate");
                    assert.equal(instances[3].color, "upToDate");
                    assert.equal(instances[4].color, "upToDate");
                    assert.equal(coloredVersion.version, badVersion, "npmVersion is blank");
                    assert.equal(coloredVersion.color, "upToDate", "upToDate is default color");
                });
        });
        it("should not change color scheme if empty instances", function() {
            var noInstances = [];
            colors.assignColor(noInstances, npmVersion,
                summarizer, function(coloredVersion) {
                    assert.deepEqual(noInstances, [], "no instances, nothing to do");
                    assert.equal(coloredVersion.version, npmVersion, "npmVersion");
                    assert.equal(coloredVersion.color, "upToDate", "upToDate is default color");
                });
        });
        it("should not change color scheme if undefined instances", function() {
            var badInstances;
            colors.assignColor(badInstances, npmVersion,
                summarizer, function(coloredVersion) {
                    assert.isUndefined(badInstances, "Nothing gets added to undefined");
                    assert.equal(coloredVersion.version, npmVersion, "npmVersion");
                    assert.equal(coloredVersion.color, "upToDate", "upToDate is default color");
                });
        });
        it("should not apply any coloring if undefined instances and npmVersion", function() {
            var badInstances;
            var badVersion;
            colors.assignColor(badInstances, badVersion,
                summarizer, function(coloredVersion) {
                    assert.isUndefined(badInstances, "Nothing gets added to undefined");
                    assert.equal(coloredVersion.version, badVersion, "npmVersion is blank");
                    assert.equal(coloredVersion.color, "upToDate", "upToDate is default color");
                });
        });
    });
    describe("Initialize Colors Tests", function() {
        it("Should not initialize Colors if the terminal does not support xterm colors and should if it is supported", function() {
            var colorScheme = colors.colorScheme.upToDate;
            colors.initializeColors("ColorBlind");
            if (colors.checkForXterm()) {
                assert.notEqual(colors.colorScheme.upToDate("TestString"),colorScheme("TestString"));
            } else {
                assert.equal(colors.colorScheme.upToDate("TestString"),colorScheme("TestString"));
            }
        });
    });
    describe("Load Color Config Tests", function() {
        it("Should Load Standard Colors", function() {
            var colorConfig = require(path.normalize("../../colorConfig.json"));
            var colorConfigSection = colorConfig.Standard;

            var colorScheme = {
                patch: clc.xterm(colorConfigSection.patch),
                minor: clc.xterm(colorConfigSection.minor),
                major: clc.xterm(colorConfigSection.major),
                upToDate: clc.xterm(colorConfigSection.upToDate),
                unmatched: clc.xterm(colorConfigSection.unmatched)
            };

            colors.loadConfigColors("Standard");
            assert.equal(colorScheme.patch("TestString"),colors.colorScheme.patch("TestString"));
            assert.equal(colorScheme.minor("TestString"),colors.colorScheme.minor("TestString"));
            assert.equal(colorScheme.major("TestString"),colors.colorScheme.major("TestString"));
            assert.equal(colorScheme.upToDate("TestString"),colors.colorScheme.upToDate("TestString"));
            assert.equal(colorScheme.unmatched("TestString"),colors.colorScheme.unmatched("TestString"));
        });
        it("Should Load Color Blind Colors", function() {
            var colorConfig = require(path.normalize("../../colorConfig.json"));
            var colorConfigSection = colorConfig.ColorBlind;

            var colorScheme = {
                patch: clc.xterm(colorConfigSection.patch),
                minor: clc.xterm(colorConfigSection.minor),
                major: clc.xterm(colorConfigSection.major),
                upToDate: clc.xterm(colorConfigSection.upToDate),
                unmatched: clc.xterm(colorConfigSection.unmatched)
            };

            colors.loadConfigColors("ColorBlind");
            assert.equal(colorScheme.patch("TestString"),colors.colorScheme.patch("TestString"));
            assert.equal(colorScheme.minor("TestString"),colors.colorScheme.minor("TestString"));
            assert.equal(colorScheme.major("TestString"),colors.colorScheme.major("TestString"));
            assert.equal(colorScheme.upToDate("TestString"),colors.colorScheme.upToDate("TestString"));
            assert.equal(colorScheme.unmatched("TestString"),colors.colorScheme.unmatched("TestString"));
        });
        it("Should Load Standard Colors if an Invalid Color Scheme is Given", function() {
            var colorConfig = require(path.normalize("../../colorConfig.json"));
            var colorConfigSection = colorConfig.Standard;

            var colorScheme = {
                patch: clc.xterm(colorConfigSection.patch),
                minor: clc.xterm(colorConfigSection.minor),
                major: clc.xterm(colorConfigSection.major),
                upToDate: clc.xterm(colorConfigSection.upToDate),
                unmatched: clc.xterm(colorConfigSection.unmatched)
            };

            colors.loadConfigColors("Invalid Scheme");
            assert.equal(colorScheme.patch("TestString"),colors.colorScheme.patch("TestString"));
            assert.equal(colorScheme.minor("TestString"),colors.colorScheme.minor("TestString"));
            assert.equal(colorScheme.major("TestString"),colors.colorScheme.major("TestString"));
            assert.equal(colorScheme.upToDate("TestString"),colors.colorScheme.upToDate("TestString"));
            assert.equal(colorScheme.unmatched("TestString"),colors.colorScheme.unmatched("TestString"));
        });
    });
});

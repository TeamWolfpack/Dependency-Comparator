/**
 * Created by farrowc on 3/23/2016.
 */
var chai = require("chai");
var expect = chai.expect;
var assert = chai.assert;
var textTable = require("text-table");
var clc = require("cli-color");

describe("Color Tests", function() {
    describe("Check for Custom Color Support Tests", function() {
        it("Should properly return false if custom colors aren't supported and True if they are", function() {
            var colors = require("../../modules/colors");
            var orange = clc.xterm(202);
            var red = clc.redBright;
            var customColorsSupported =  !(orange("A") === red("A"));
            assert.equal(customColorsSupported,colors.checkForXterm());
        });
    });
    describe("colorVersion Tests", function(){
        it("Should give the up to date color when an instance is up to date", function() {
            var colors = require("../../modules/colors");
            var instance = {
                version: "poopInstance",
                color: "upToDate"
            };
            var versionedInstance = colors.colorScheme.upToDate(instance.version);
            assert.equal(colors.colorVersion(instance),versionedInstance);
        });
        it("Should give the patch update color when an instance is behind by a patch", function() {
            var colors = require("../../modules/colors");
            var instance = {
                version: "poopInstance",
                color: "patch"
            };
            var versionedInstance = colors.colorScheme.patch(instance.version);
            assert.equal(colors.colorVersion(instance),versionedInstance);
        });
        it("Should give the minor update color when an instance is behind by a minor update", function() {
            var colors = require("../../modules/colors");
            var instance = {
                version: "poopInstance",
                color: "minor"
            };
            var versionedInstance = colors.colorScheme.minor(instance.version);
            assert.equal(colors.colorVersion(instance),versionedInstance);
        });
        it("Should give the major update color when an instance is behind by a major update", function() {
            var colors = require("../../modules/colors");
            var instance = {
                version: "poopInstance",
                color: "major"
            };
            var versionedInstance = colors.colorScheme.major(instance.version);
            assert.equal(colors.colorVersion(instance),versionedInstance);
        });
        it("Should give the unmatched color when an instance is unmatched", function() {
            var colors = require("../../modules/colors");
            var instance = {
                version: "poopInstance",
                color: "unmatched"
            };
            var versionedInstance = colors.colorScheme.unmatched(instance.version);
            assert.equal(colors.colorVersion(instance),versionedInstance);
        });
    });
});
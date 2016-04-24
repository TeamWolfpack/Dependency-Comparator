/**
 * Created by farrowc on 3/9/2016.
 */
var chai = require("chai");
var expect = chai.expect;
var assert = chai.assert;
var textTable = require("text-table");

var summary = require("../../modules/summary");

describe("Summary Tests", function() {
    describe("Create Summary Table", function() {
		afterEach(function(done) {
		   summary.totals.length = 0;
		   done();
		});
        it("createSummaryTable should be a function", function() {
            assert.isFunction(summary.printSummaryTable, "true");
        });
        it("Should create a table with proper input", function() {
			var totals = [{
				name: "Project1",
				major: 2,
				minor: 4,
				patch: 1,
				unmatched: 0
			}, {
				name: "Project2",
				major: 1,
				minor: 3,
				patch: 2,
				unmatched: 0
            }];
			summary.totals.push(totals[0]);
			summary.totals.push(totals[1]);
						
            var summaryTable = summary.printSummaryTable();
            assert.isDefined(summaryTable, "Summary table is defined");
            assert.isString(summaryTable, "Summary table is a string");
            var correctSummaryTable = textTable([
                ["", "Project1", "Project2"],
                ["major", totals[0].major, totals[1].major],
                ["minor", totals[0].minor, totals[1].minor],
                ["patch", totals[0].patch, totals[1].patch],
                ["unmatched", totals[0].unmatched, totals[1].unmatched]
            ], {align: ["l", "l", "l"]});
            expect(summaryTable).to.equal(correctSummaryTable);
        });
        it("Should not create a table with only project 1 input", function() {
            var totals = [{
					name: "Project1",
                    major: 1,
                    minor: 3,
                    patch: 2,
                    unmatched: 0
                }];
            summary.totals.push(totals[0]);
						
            var summaryTable = summary.printSummaryTable();
            assert.isDefined(summaryTable, "Summary table is defined");
            assert.isString(summaryTable, "Summary table is a string");
            var correctSummaryTable = textTable([
                ["", "Project1"],
                ["major", totals[0].major],
                ["minor", totals[0].minor],
                ["patch", totals[0].patch],
                ["unmatched", totals[0].unmatched]
            ], {align: ["l", "l", "l"]});
            expect(summaryTable).to.equal(correctSummaryTable);
        });
        it("Should not create a table with undefined input", function() {
            assert.throws(function() {summary.printSummaryTable();}
                ,"Summary table error: " +
                "Dependency Totals is empty");
        });
        it("Should throw an error with a negative input in project 1 major", function() {
			var totals = [{
					name: "Project1",
                    major: -1,
                    minor: 3,
                    patch: 2,
                    unmatched: 0
                }];
            summary.totals.push(totals[0]);
            assert.throws(function() {summary.printSummaryTable();}
                ,"Summary table error: Project1 " +
                "major difference count is negative");
        });
        it("Should throw an error with a negative input in project 1 minor", function() {
            var totals = [{
					name: "Project1",
                    major: 1,
                    minor: -3,
                    patch: 2,
                    unmatched: 0
                }];
            summary.totals.push(totals[0]);
            assert.throws(function() {summary.printSummaryTable();}
                ,"Summary table error: Project1 " +
                "minor difference count is negative");
        });
        it("Should throw an error with a negative input in project 1 patch", function() {
            var totals = [{
					name: "Project1",
                    major: 1,
                    minor: 3,
                    patch: -2,
                    unmatched: 0
                }];
            summary.totals.push(totals[0]);
            assert.throws(function() {summary.printSummaryTable();}
                ,"Summary table error: Project1 " +
                "patch difference count is negative");
        });
        it("Should throw an error with a negative input in project 1 unmatched", function() {
            var totals = [{
					name: "Project1",
                    major: 1,
                    minor: 3,
                    patch: 2,
                    unmatched: -1
                }];
            summary.totals.push(totals[0]);
            assert.throws(function() {summary.printSummaryTable();}
                ,"Summary table error: Project1 " +
                "unmatched difference count is negative");
        });
        it("Should throw an error with project 1 major missing", function() {
            var totals = [{
					name: "Project1",
                    minor: 3,
                    patch: 2,
                    unmatched: 0
                }];
            summary.totals.push(totals[0]);
            assert.throws(function() {summary.printSummaryTable();}
                ,"Summary table error: Project1 " +
                "major difference count is missing");
        });
        it("Should throw an error with project 1 minor missing", function() {
            var totals = [{
					name: "Project1",
                    major: 1,
                    patch: 2,
                    unmatched: 0
                }];
            summary.totals.push(totals[0]);
            assert.throws(function() {summary.printSummaryTable();}
                ,"Summary table error: Project1 " +
                "minor difference count is missing");
        });
        it("Should throw an error with project 1 patch missing", function() {
            var totals = [{
					name: "Project1",
                    major: 1,
                    minor: 3,
                    unmatched: 0
                }];
            summary.totals.push(totals[0]);
            assert.throws(function() {summary.printSummaryTable();}
                ,"Summary table error: Project1 " +
                "patch difference count is missing");
        });
        it("Should throw an error with project 1 unmatched missing", function() {
            var totals = [{
					name: "Project1",
                    major: 1,
                    minor: 3,
                    patch: 2,
                }];
            summary.totals.push(totals[0]);
            assert.throws(function() {summary.printSummaryTable();}
                ,"Summary table error: Project1 " +
                "unmatched difference count is missing");
        });
    });
});

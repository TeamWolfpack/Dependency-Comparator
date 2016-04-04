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
        it("createSummaryTable should be a function", function() {
            assert.isFunction(summary.createSummaryTable, "true");
        });
        it("Should create a table with proper input", function() {
            var totals = {
                projectOne: {
                    major: 2,
                    minor: 4,
                    patch: 1,
                    unmatched: 0
                },
                projectTwo: {
                    major: 1,
                    minor: 3,
                    patch: 2,
                    unmatched: 0
                }
            };
            var summaryTable = summary.createSummaryTable(totals);
            assert.isDefined(summaryTable, "Summary table is defined");
            assert.isString(summaryTable, "Summary table is a string");
            var correctSummaryTable = textTable([
                ["", "Project One", "Project Two"],
                ["major", totals.projectOne.major, totals.projectTwo.major],
                ["minor", totals.projectOne.minor, totals.projectTwo.minor],
                ["patch", totals.projectOne.patch, totals.projectTwo.patch],
                ["unmatched", totals.projectOne.unmatched, totals.projectTwo.unmatched]
            ], {align: ["l", "l", "l"]});
            expect(summaryTable).to.equal(correctSummaryTable);
        });
        it("Should not create a table with undefined project 1 input", function() {
            var totals = {
                projectTwo: {
                    major: 1,
                    minor: 3,
                    patch: 2,
                    unmatched: 0
                }
            };
            assert.throws(function() {summary.createSummaryTable(totals);}
                          ,"Summary table error: " +
                          "Project One Totals is undefined");
        });
        it("Should not create a table with undefined project 2 input", function() {
            var totals = {
                projectOne: {
                    major: 1,
                    minor: 3,
                    patch: 2,
                    unmatched: 0
                }
            };
            assert.throws(function() {summary.createSummaryTable(totals);}
                          ,"Summary table error: " +
                          "Project Two Totals is undefined");
        });
        it("Should not create a table with undefined input", function() {
            var totals = undefined;
            assert.throws(function() {summary.createSummaryTable(totals);}
                ,"Summary table error: " +
                "Dependency Totals is undefined");
        });
        it("Should throw an error with a negative input in project 1 major", function() {
            var totals = {
                projectOne: {
                    major: -1,
                    minor: 3,
                    patch: 2,
                    unmatched: 0
                },
                projectTwo: {
                    major: 2,
                    minor: 2,
                    patch: 2,
                    unmatched: 0
                }
            };
            assert.throws(function() {summary.createSummaryTable(totals);}
                ,"Summary table error: Project One " +
                "major difference count is negative");
        });
        it("Should throw an error with a negative input in project 1 minor", function() {
            var totals = {
                projectOne: {
                    major: 1,
                    minor: -3,
                    patch: 2,
                    unmatched: 0
                },
                projectTwo: {
                    major: 2,
                    minor: 2,
                    patch: 2,
                    unmatched: 0
                }
            };
            assert.throws(function() {summary.createSummaryTable(totals);}
                ,"Summary table error: Project One " +
                "minor difference count is negative");
        });
        it("Should throw an error with a negative input in project 1 patch", function() {
            var totals = {
                projectOne: {
                    major: 1,
                    minor: 3,
                    patch: -2,
                    unmatched: 0
                },
                projectTwo: {
                    major: 2,
                    minor: 2,
                    patch: 2,
                    unmatched: 0
                }
            };
            assert.throws(function() {summary.createSummaryTable(totals);}
                ,"Summary table error: Project One " +
                "patch difference count is negative");
        });
        it("Should throw an error with a negative input in project 1 unmatched", function() {
            var totals = {
                projectOne: {
                    major: 1,
                    minor: 3,
                    patch: 2,
                    unmatched: -1
                },
                projectTwo: {
                    major: 2,
                    minor: 2,
                    patch: 2,
                    unmatched: 0
                }
            };
            assert.throws(function() {summary.createSummaryTable(totals);}
                ,"Summary table error: Project One " +
                "unmatched difference count is negative");
        });
        it("Should throw an error with a negative input in project 2 major", function() {
            var totals = {
                projectOne: {
                    major: 1,
                    minor: 3,
                    patch: 2,
                    unmatched: 0
                },
                projectTwo: {
                    major: -2,
                    minor: 2,
                    patch: 2,
                    unmatched: 0
                }
            };
            assert.throws(function() {summary.createSummaryTable(totals);}
                ,"Summary table error: Project Two " +
                "major difference count is negative");
        });
        it("Should throw an error with a negative input in project 2 minor", function() {
            var totals = {
                projectOne: {
                    major: 1,
                    minor: 3,
                    patch: 2,
                    unmatched: 0
                },
                projectTwo: {
                    major: 2,
                    minor: -2,
                    patch: 2,
                    unmatched: 0
                }
            };
            assert.throws(function() {summary.createSummaryTable(totals);}
                ,"Summary table error: Project Two " +
                "minor difference count is negative");
        });
        it("Should throw an error with a negative input in project 2 patch", function() {
            var totals = {
                projectOne: {
                    major: 1,
                    minor: 3,
                    patch: 2,
                    unmatched: 0
                },
                projectTwo: {
                    major: 2,
                    minor: 2,
                    patch: -2,
                    unmatched: 0
                }
            };
            assert.throws(function() {summary.createSummaryTable(totals);}
                ,"Summary table error: Project Two " +
                "patch difference count is negative");
        });
        it("Should throw an error with a negative input in project 2 unmatched", function() {
            var totals = {
                projectOne: {
                    major: 1,
                    minor: 3,
                    patch: 2,
                    unmatched: 0
                },
                projectTwo: {
                    major: 2,
                    minor: 2,
                    patch: 2,
                    unmatched: -1
                }
            };
            assert.throws(function() {summary.createSummaryTable(totals);}
                ,"Summary table error: Project Two " +
                "unmatched difference count is negative");
        });
        it("Should throw an error with project 1 major missing", function() {
            var totals = {
                projectOne: {
                    minor: 3,
                    patch: 2,
                    unmatched: 0
                },
                projectTwo: {
                    major: 2,
                    minor: 2,
                    patch: 2,
                    unmatched: 0
                }
            };
            assert.throws(function() {summary.createSummaryTable(totals);}
                ,"Summary table error: Project One " +
                "major difference count is missing");
        });
        it("Should throw an error with project 1 minor missing", function() {
            var totals = {
                projectOne: {
                    major: 1,
                    patch: 2,
                    unmatched: 0
                },
                projectTwo: {
                    major: 2,
                    minor: 2,
                    patch: 2,
                    unmatched: 0
                }
            };
            assert.throws(function() {summary.createSummaryTable(totals);}
                ,"Summary table error: Project One " +
                "minor difference count is missing");
        });
        it("Should throw an error with project 1 patch missing", function() {
            var totals = {
                projectOne: {
                    major: 1,
                    minor: 3,
                    unmatched: 0
                },
                projectTwo: {
                    major: 2,
                    minor: 2,
                    patch: 2,
                    unmatched: 0
                }
            };
            assert.throws(function() {summary.createSummaryTable(totals);}
                ,"Summary table error: Project One " +
                "patch difference count is missing");
        });
        it("Should throw an error with project 1 unmatched missing", function() {
            var totals = {
                projectOne: {
                    major: 1,
                    minor: 3,
                    patch: 2
                },
                projectTwo: {
                    major: 2,
                    minor: 2,
                    patch: 2,
                    unmatched: 0
                }
            };
            assert.throws(function() {summary.createSummaryTable(totals);}
                ,"Summary table error: Project One " +
                "unmatched difference count is missing");
        });
        it("Should throw an error with project 2 major missing", function() {
            var totals = {
                projectOne: {
                    major: 1,
                    minor: 3,
                    patch: 2,
                    unmatched: 0
                },
                projectTwo: {
                    minor: 2,
                    patch: 2,
                    unmatched: 0
                }
            };
            assert.throws(function() {summary.createSummaryTable(totals);}
                ,"Summary table error: Project Two " +
                "major difference count is missing");
        });
        it("Should throw an error with project 2 minor missing", function() {
            var totals = {
                projectOne: {
                    major: 1,
                    minor: 3,
                    patch: 2,
                    unmatched: 0
                },
                projectTwo: {
                    major: 2,
                    patch: 2,
                    unmatched: 0
                }
            };
            assert.throws(function() {summary.createSummaryTable(totals);}
                ,"Summary table error: Project Two " +
                "minor difference count is missing");
        });
        it("Should throw an error with project 2 patch missing", function() {
            var totals = {
                projectOne: {
                    major: 1,
                    minor: 3,
                    patch: 2,
                    unmatched: 0
                },
                projectTwo: {
                    major: 2,
                    minor: 2,
                    unmatched: 0
                }
            };
            assert.throws(function() {summary.createSummaryTable(totals);}
                ,"Summary table error: Project Two " +
                "patch difference count is missing");
        });
        it("Should throw an error with project 2 unmatched missing", function() {
            var totals = {
                projectOne: {
                    major: 1,
                    minor: 3,
                    patch: 2,
                    unmatched: 0
                },
                projectTwo: {
                    major: 2,
                    minor: 2,
                    patch: 2
                }
            };
            assert.throws(function() {summary.createSummaryTable(totals);}
                ,"Summary table error: Project Two " +
                "unmatched difference count is missing");
        });
    });
});

var expect = require("chai").expect;
var sinon = require("mocha-sinon");
var childProcess = require("child_process");
var path = require("path");

/**
 Simple unit test for testing in the CI
 @author Josh Leonard
 */
describe("Simple Test", function() {
    it("one should equal one", function() {
        expect(1).to.equal(1);
    });
});

describe("Test Paths", function() {
    describe("No project paths", function() {
        var capturedStdout;
        before(function(done) {
            childProcess.exec("node bin/brady-tool compare", function(error, stdout, stderr) {
                if (error) { console.log(error); } // Handle errors.
                capturedStdout = stdout;
                return done();
            });
        });
        it("should log file was not found", function() {
            expect(capturedStdout).to.contain("Project path is invalid: undefined");
        });
    });
    describe("Only one project path entered", function() {
        var capturedStdout;
        before(function(done) {
            childProcess.exec("node bin/brady-tool compare ..", function(error, stdout, stderr) {
                if (error) { console.log(error); } // Handle errors.
                capturedStdout = stdout;
                return done();
            });
        });
        it("should log file was not found", function() {
            expect(capturedStdout).to.contain("Project path is invalid: undefined");
        });
    });
    describe("Relative paths should work", function() {
        var capturedStdout;
        before(function(done) {
            childProcess.exec("node bin/brady-tool compare . .", function(error, stdout, stderr) {
                if (error) { console.log(error); } // Handle errors.
                capturedStdout = stdout;
                return done();
            });
        });
        it("should compare itself and log the table", function() {
            expect(capturedStdout).to.contain("dependency-comparator");
        });
    });
});

describe("Test Compare", function() {
    this.timeout(0);
    describe("devDependencies", function() {
        var capturedStdout;
        before(function(done) {
            childProcess.exec("node bin/brady-tool compare . . -a", function(error, stdout, stderr) {
                if (error) { console.log(error); } // Handle errors.
                capturedStdout = stdout;
                return done();
            });
        });
        it("should log a table that includes devDeps", function() {
            expect(capturedStdout).to.contain("mocha");
            expect(capturedStdout).to.contain("major");
            expect(capturedStdout).to.contain("minor");
            expect(capturedStdout).to.contain("patch");
            expect(capturedStdout).to.contain("unmatched");
            expect(capturedStdout).to.not.contain("Major Difference");
        });
    });
    describe("Hide Summary", function() {
        var capturedStdout;
        before(function(done) {
            childProcess.exec("node bin/brady-tool compare . . -s", function(error, stdout, stderr) {
                if (error) { console.log(error); } // Handle errors.
                capturedStdout = stdout;
                return done();
            });
        });
        it("should hide the summary", function() {
            expect(capturedStdout).to.not.contain("major");
            expect(capturedStdout).to.not.contain("minor");
            expect(capturedStdout).to.not.contain("patch");
            expect(capturedStdout).to.not.contain("unmatched");
            expect(capturedStdout).to.not.contain("Major Difference");
        });
    });
    describe("Color Legend", function() {
        var capturedStdout;
        before(function(done) {
            childProcess.exec("node bin/brady-tool compare . . -l", function(error, stdout, stderr) {
                if (error) { console.log(error); } // Handle errors.
                capturedStdout = stdout;
                return done();
            });
        });
        it("should log the color legend", function() {
            expect(capturedStdout).to.contain("major");
            expect(capturedStdout).to.contain("minor");
            expect(capturedStdout).to.contain("patch");
            expect(capturedStdout).to.contain("unmatched");
            expect(capturedStdout).to.contain("Major Difference");
            expect(capturedStdout).to.contain("Minor Difference");
            expect(capturedStdout).to.contain("Patch Difference");
        });
    });
    describe("Depth", function() {
        var capturedStdout;
        before(function(done) {
            childProcess.exec("node bin/brady-tool compare . . -d 2", function(error, stdout, stderr) {
                if (error) { console.log(error); } // Handle errors.
                capturedStdout = stdout;
                return done();
            });
        });
        it("should log a table that is a depth of two", function() {
            expect(capturedStdout).to.contain(path.normalize("/node_modules/minimist"));
            expect(capturedStdout).to.contain("major");
            expect(capturedStdout).to.contain("minor");
            expect(capturedStdout).to.contain("patch");
            expect(capturedStdout).to.contain("unmatched");
            expect(capturedStdout).to.not.contain("Major Difference");
        });
    });
});

describe("Test Summary", function() {
    this.timeout(0);
    describe("Print Summary", function() {
        var capturedStdout;
        before(function(done) {
            childProcess.exec("node bin/brady-tool summary . .", function(error, stdout, stderr) {
                if (error) { console.log(error); } // Handle errors.
                capturedStdout = stdout;
                return done();
            });
        });
        it("should include color legend", function() {
            expect(capturedStdout).to.contain("major");
            expect(capturedStdout).to.contain("minor");
            expect(capturedStdout).to.contain("patch");
            expect(capturedStdout).to.contain("unmatched");
        });
    });
});

describe("Compare and Summary", function() {
    var capturedCompare;
    var capturedSummary;
    before(function(done) {
        childProcess.exec("node bin/brady-tool compare . . -a", function(error, stdout, stderr) {
            if (error) { console.log(error); } // Handle errors.
            capturedCompare = stdout;
            return done();
        });
    });
    before(function(done) {
        childProcess.exec("node bin/brady-tool summary . . -at", function(error, stdout, stderr) {
            if (error) { console.log(error); } // Handle errors.
            capturedSummary = stdout;
            return done();
        });
    });
    it("should log a table that is a depth of two", function() {
        expect(capturedCompare).to.equal(capturedSummary);
    });
});

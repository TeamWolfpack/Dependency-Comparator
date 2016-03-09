var expect = require("chai").expect;
var sinon = require("mocha-sinon");
var child_process = require("child_process");
var bradyTool = require("../bin/brady-tool");

/**
 Simple unit test fr testing in the CI
 @author Josh Leonard
 */
describe("Simple Test", function() {
    it("one should equal one", function() {
        expect(1).to.equal(1);
    });
});

describe("Test Summary", function() {
    describe("No project paths", function() {
        var capturedStdout;
        before(function(done) {
            child_process.exec("node bin/brady-tool summary", function(error, stdout, stderr) {
                if (error) console.log(error); // Handle errors.
                capturedStdout = stdout;
                return done();
            });
        });
        it("should log file was not found", function() {
            expect(capturedStdout).to.contain("First project path is invalid");
        });
    });
    describe("Only one project path entered", function() {
        var capturedStdout;
        before(function(done) {
            child_process.exec("node bin/brady-tool summary ..", function(error, stdout, stderr) {
                if (error) console.log(error); // Handle errors.
                capturedStdout = stdout;
                return done();
            });
        });
        it("should log file was not found", function() {
            expect(capturedStdout).to.contain("Second project path is invalid");
        });
    });
});

describe("Test Compare", function() {
    this.timeout(0);
    describe("No project paths", function() {
        var capturedStdout;
        before(function(done) {
            child_process.exec("node bin/brady-tool compare", function(error, stdout, stderr) {
                if (error) console.log(error); // Handle errors.
                capturedStdout = stdout;
                return done();
            });
        });
        it("should log file was not found", function() {
            expect(capturedStdout).to.contain("First project path is invalid");
        });
    });
    describe("Only one project path entered", function() {
        var capturedStdout;
        before(function(done) {
            child_process.exec("node bin/brady-tool compare ..", function(error, stdout, stderr) {
                if (error) console.log(error); // Handle errors.
                capturedStdout = stdout;
                return done();
            });
        });
        it("should log file was not found", function() {
            expect(capturedStdout).to.contain("Second project path is invalid");
        });
    });
    describe("devDependencies", function() {
        var capturedStdout;
        before(function(done) {
            child_process.exec("node bin/brady-tool compare .. .. -as", function(error, stdout, stderr) {
                if (error) console.log(error); // Handle errors.
                capturedStdout = stdout;
                return done();
            });
        });
        it("should log a table that includes devDeps and no summary", function() {
            expect(capturedStdout).to.contain("mocha");
            expect(capturedStdout).to.not.contain("major");
            expect(capturedStdout).to.not.contain("minor");
            expect(capturedStdout).to.not.contain("patch");
            expect(capturedStdout).to.not.contain("unmatched");
            expect(capturedStdout).to.not.contain("Major Difference");
        });
    });
    describe("depth", function() {
        var capturedStdout;
        before(function(done) {
            child_process.exec("node bin/brady-tool compare .. .. -ld 2", function(error, stdout, stderr) {
                if (error) console.log(error); // Handle errors.
                capturedStdout = stdout;
                return done();
            });
        });
        it("should log a table that is a depth of two and shows color legend", function() {
            expect(capturedStdout).to.contain("\\node_modules\\strip-ansi");
            expect(capturedStdout).to.contain("major");
            expect(capturedStdout).to.contain("minor");
            expect(capturedStdout).to.contain("patch");
            expect(capturedStdout).to.contain("unmatched");
            expect(capturedStdout).to.contain("Major Difference");
        });
    });
});

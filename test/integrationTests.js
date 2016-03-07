var expect = require("chai").expect;
var sinon = require('mocha-sinon');
var child_process = require('child_process');
var bradyTool = require("../bin/brady-tool");

/**
 Simple unit test fr testing in the CI
 @author Josh Leonard
 */
describe("Simple Test", function(){
    it("one should equal one", function(){
        expect(1).to.equal(1);
    });
});

describe("Test Summary", function(){
    describe("No project paths", function(){
        var captured_stdout;
        before(function (done) {
            child_process.exec('node bin/brady-tool summary', function (error, stdout, stderr) {
                if (error) console.log(error); // Handle errors.
                captured_stdout = stdout;
                return done();
            });
        });
        it('should log file was not found', function() {
            expect(captured_stdout).to.contain('First project path is invalid');
        });
    });
    describe("Only one project path entered", function(){
        var captured_stdout;
        before(function (done) {
            child_process.exec("node bin/brady-tool summary ..", function (error, stdout, stderr) {
                if (error) console.log(error); // Handle errors.
                captured_stdout = stdout;
                return done();
            });
        });
        it('should log file was not found', function() {
            expect(captured_stdout).to.contain('Second project path is invalid');
        });
    });
});

describe("Test Compare", function(){
    this.timeout(0);
    describe("No project paths", function(){
        var captured_stdout;
        before(function (done) {
            child_process.exec('node bin/brady-tool compare', function (error, stdout, stderr) {
                if (error) console.log(error); // Handle errors.
                captured_stdout = stdout;
                return done();
            });
        });
        it('should log file was not found', function() {
            expect(captured_stdout).to.contain('First project path is invalid');
        });
    });
    describe("Only one project path entered", function(){
        var captured_stdout;
        before(function (done) {
            child_process.exec("node bin/brady-tool compare ..", function (error, stdout, stderr) {
                if (error) console.log(error); // Handle errors.
                captured_stdout = stdout;
                return done();
            });
        });
        it('should log file was not found', function() {
            expect(captured_stdout).to.contain('Second project path is invalid');
        });
    });
    describe("devDependencies", function(){
        var captured_stdout;
        before(function (done) {
            child_process.exec("node bin/brady-tool compare .. .. -as", function (error, stdout, stderr) {
                if (error) console.log(error); // Handle errors.
                captured_stdout = stdout;
                return done();
            });
        });
        it('should log a table that includes devDeps and no summary', function() {
            expect(captured_stdout).to.contain('mocha');
            expect(captured_stdout).to.not.contain('major');
            expect(captured_stdout).to.not.contain('minor');
            expect(captured_stdout).to.not.contain('patch');
            expect(captured_stdout).to.not.contain('unmatched');
            expect(captured_stdout).to.not.contain("Major Difference");
        });
    });
    describe("depth", function(){
        var captured_stdout;
        before(function (done) {
            child_process.exec("node bin/brady-tool compare .. .. -ld 2", function (error, stdout, stderr) {
                if (error) console.log(error); // Handle errors.
                captured_stdout = stdout;
                return done();
            });
        });
        it('should log a table that is a depth of two and shows color legend', function() {
            expect(captured_stdout).to.contain('\\node_modules\\strip-ansi');
            expect(captured_stdout).to.contain('major');
            expect(captured_stdout).to.contain('minor');
            expect(captured_stdout).to.contain('patch');
            expect(captured_stdout).to.contain('unmatched');
            expect(captured_stdout).to.contain("Major Difference");
        });
    });
});
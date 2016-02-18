var expect = require("chai").expect;
var sinon = require('mocha-sinon');
var cliTable = require("cli-table2");
var chalk = require("chalk");
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
			expect(captured_stdout).to.contain('File not found');
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
			expect(captured_stdout).to.contain('File not found');
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
			expect(captured_stdout).to.contain('File not found');
		});
	});
	describe("legend and hide summary", function(){
		var captured_stdout;
		before(function (done) {
			child_process.exec("node bin/brady-tool compare .. .. -ls", function (error, stdout, stderr) {
				if (error) console.log(error); // Handle errors.
				captured_stdout = stdout;
				return done();
			});
		});
		it('should log a table that includes devDependenies', function() {
			expect(captured_stdout).to.contain("commander");
			expect(captured_stdout).to.contain("Major Difference");
			expect(captured_stdout).to.not.contain("major:");
		});
	});
	describe("depth and devDependencies", function(){
		var captured_stdout;
		before(function (done) {
			child_process.exec("node bin/brady-tool compare .. .. -ad 2", function (error, stdout, stderr) {
				if (error) console.log(error); // Handle errors.
				captured_stdout = stdout;
				return done();
			});
		});
		it('should log a table that is a depth of two and includes devDeps', function() {
			expect(captured_stdout).to.contain('mocha\\node_modules\\glob');
			expect(captured_stdout).to.contain('major: ');
			expect(captured_stdout).to.contain('minor: ');
			expect(captured_stdout).to.contain('patch: ');
			expect(captured_stdout).to.not.contain("Major Difference");
		});
	});
});
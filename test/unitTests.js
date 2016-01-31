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

describe("Create Table", function(){
	beforeEach(function() {
		this.sinon.stub(console, 'log');
	});
	it("should log dependencies table", function(){
		var gulp = {
			name: "gulp",
			maxinstances: 2,
			instances: [{
				version: "1.0.0",
				Project: "project1",
				path: "a/b/c",
				color: "white"
			}, {
				version: "1.0.0",
				Project: "project2",
				path: "a/b/c",
				color: "white"
			}, {
				version: "1.0.0",
				Project: "project2",
				path: "a/b/c",
				color: "white"
			}]
		};
		var mocha = {
			name: "mocha",
			maxinstances: 2,
			instances: [{
				version: "1.0.0",
				Project: "project1",
				path: "a/b/c",
				color: "white"
			}, {
				version: "1.0.0",
				Project: "project1",
				path: "a/b/c",
				color: "white"
			}, {
				version: "1.0.0",
				Project: "project2",
				path: "a/b/c",
				color: "white"
			}]
		};
		var chai = {
			name: "chai",
			maxinstances: 2,
			instances: [{
				version: "1.0.0",
				Project: "project1",
				path: "a/b/c",
				color: "white"
			}, {
				version: "1.0.0",
				Project: "project1",
				path: "a/b/c",
				color: "white"
			}, {
				version: "1.0.0",
				Project: "project2",
				path: "a/b/c",
				color: "white"
			}, {
				version: "1.0.0",
				Project: "project2",
				path: "a/b/c",
				color: "white"
			}]
		};
		var dependencies = [gulp, mocha, chai];
		var table = bradyTool.createTable(dependencies);
		
		var expectedTable = new cliTable({
			head: ["Module Name", "project1", "project1 Path", "project2", "project2 Path"],
			style: {
				head: [] //disable colors in header cells
			},
			wordWrap: true,
			colWidths: [13, 10, 15, 10, 15],
			rowHeights: [1, 1, 1, 1, 1, 1, 1]
		});
		expectedTable.push([{rowSpan: 2, content: "gulp", style: {}}, chalk.green("1.0.0"), "a/b/c", chalk.green("1.0.0"), "a/b/c"]);
		expectedTable.push(["", "", chalk.green("1.0.0"), "a/b/c"]);
		expectedTable.push([{rowSpan: 2, content: "mocha", style: {}}, chalk.green("1.0.0"), "a/b/c", chalk.green("1.0.0"), "a/b/c"]);
		expectedTable.push([chalk.green("1.0.0"), "a/b/c", "", ""]);
		expectedTable.push([{rowSpan: 2, content: "chai", style: {}}, chalk.green("1.0.0"), "a/b/c", chalk.green("1.0.0"), "a/b/c"]);
		expectedTable.push([chalk.green("1.0.0"), "a/b/c", chalk.green("1.0.0"), "a/b/c"]);
		expect(table).to.eql(expectedTable);
		expect(console.log.calledOnce).to.be.true;
		expect(console.log.calledWith(expectedTable.toString())).to.be.true;
	});
	it("should log \"Undefined dependencies parameter.\"", function(){
		var dependencies;
		bradyTool.createTable(dependencies);
		expect(console.log.calledOnce).to.be.true;
		expect(console.log.calledWith("Undefined dependencies parameter.")).to.be.true;
	});
	it("should log \"Undefined dependencies parameter.\"", function(){
		var dependencies = "";
		bradyTool.createTable(dependencies);
		expect(console.log.calledOnce).to.be.true;
		expect(console.log.calledWith("Undefined dependencies parameter.")).to.be.true;
	});
});

describe("Highlight Versions", function(){
	beforeEach(function() {
		this.sinon.stub(console, 'log');
	});
	it("should highlight each version a different color", function(){
		var gulp = {
			name: "gulp",
			maxinstances: 2,
			instances: [{
				version: "3.7.8",
				Project: "project1",
				path: "a/b/c",
				color: "white"
			}, {
				version: "3.7.5",
				Project: "project1",
				path: "a/b/c",
				color: "white"
			}, {
				version: "3.5.5",
				Project: "project2",
				path: "a/b/c",
				color: "white"
			}, {
				version: "1.0.0",
				Project: "project2",
				path: "a/b/c",
				color: "white"
			}]
		};
		var dependencies = [gulp];
		var table = bradyTool.createTable(dependencies);

		var expectedTable = new cliTable({
			head: ["Module Name", "project1", "project1 Path", "project2", "project2 Path"],
			style: {
				head: [] //disable colors in header cells
			},
			wordWrap: true,
			colWidths: [13, 10, 15, 10, 15],
			rowHeights: [1, 1, 1]
		});
		expectedTable.push([{rowSpan: 2, content: "gulp", style: {}}, chalk.green("3.7.8"), "a/b/c", chalk.magenta("3.5.5"), "a/b/c"]);
		expectedTable.push([chalk.yellow("3.7.5"), "a/b/c", chalk.red("1.0.0"), "a/b/c"]);
		expect(table).to.eql(expectedTable);
		expect(console.log.calledOnce).to.be.true;
		expect(console.log.calledWith(expectedTable.toString())).to.be.true;
	});
	it("should highlight the pair green and the others white", function(){
		var gulp = {
			name: "gulp",
			maxinstances: 1,
			instances: [{
				version: "3.7.8",
				Project: "project1",
				path: "a/b/c",
				color: "white"
			}, {
				version: "3.7.8",
				Project: "project2",
				path: "a/b/c",
				color: "white"
			}]
		};
		var mocha = {
			name: "mocha",
			maxinstances: 1,
			instances: [{
				version: "1.0.0",
				Project: "project1",
				path: "a/b/c",
				color: "white"
			}]
		};
		var chai = {
			name: "chai",
			maxinstances: 1,
			instances: [{
				version: "1.0.0",
				Project: "project2",
				path: "a/b/c",
				color: "white"
			}]
		};
		var dependencies = [gulp, mocha, chai];
		var table = bradyTool.createTable(dependencies);

		var expectedTable = new cliTable({
			head: ["Module Name", "project1", "project1 Path", "project2", "project2 Path"],
			style: {
				head: [] //disable colors in header cells
			},
			wordWrap: true,
			colWidths: [13, 10, 15, 10, 15],
			rowHeights: [1, 1, 1, 1]
		});
		expectedTable.push([{rowSpan: 1, content: "gulp", style: {}}, chalk.green("3.7.8"), "a/b/c", chalk.green("3.7.8"), "a/b/c"]);
		expectedTable.push([{rowSpan: 1, content: "mocha", style: {}}, chalk.white("1.0.0"), "a/b/c", "", ""]);
		expectedTable.push([{rowSpan: 1, content: "chai", style: {}}, "", "", chalk.white("1.0.0"), "a/b/c"]);
		expect(table).to.eql(expectedTable);
		expect(console.log.calledOnce).to.be.true;
		expect(console.log.calledWith(expectedTable.toString())).to.be.true;
	});
});

describe("Test Commander", function(){
	describe("No project paths", function(){
		var captured_stdout;
		before(function (done) {
			child_process.exec('node bin/brady-tool compare', function (error, stdout, stderr) {
				if (error) console.log(error); // Handle errors.
				captured_stdout = stdout;
				return done();
			});
		});
		it('should log there are two undefined projects', function() {
			expect(captured_stdout).to.contain('First project is undefined');
			expect(captured_stdout).to.contain('Second project is undefined');
		});
	});
	describe("Only one project path entered", function(){
		var captured_stdout;
		var bradyPath = __dirname.replace("\\test", "");
		before(function (done) {
			child_process.exec("node bin/brady-tool compare " + bradyPath, function (error, stdout, stderr) {
				if (error) console.log(error); // Handle errors.
				captured_stdout = stdout;
				return done();
			});
		});
		it('should log project two as undefined', function() {
			expect(captured_stdout).to.contain('Second project is undefined');
		});
	});
	describe("devDependenies", function(){
		var captured_stdout;
		var bradyPath = __dirname.replace("\\test", "");
		before(function (done) {
			child_process.exec("node bin/brady-tool compare " + bradyPath + " " + bradyPath + " -a", function (error, stdout, stderr) {
				if (error) console.log(error); // Handle errors.
				captured_stdout = stdout;
				return done();
			});
		});
		it('should log a table that includes devDependenies', function() {
			expect(captured_stdout).to.contain('gulp');
		});
	});
	describe("no depth set", function(){
		var no_depth_stdout;
		var no_depth_num_stdout;
		var bradyPath = __dirname.replace("\\test", "");
		before(function (done) {
			child_process.exec("node bin/brady-tool compare " + bradyPath + " " + bradyPath, function (error, stdout, stderr) {
				if (error) console.log(error); // Handle errors.
				no_depth_stdout = stdout;
				child_process.exec("node bin/brady-tool compare " + bradyPath + " " + bradyPath + " -d", function (error, stdout, stderr) {
					if (error) console.log(error); // Handle errors.
					no_depth_num_stdout = stdout;
					return done();
				});
			});
		});
		it('should log a table that includes devDependenies', function() {
			expect(no_depth_stdout).to.eql(no_depth_num_stdout);
		});
	});
	describe("depth", function(){
		var captured_stdout;
		var bradyPath = __dirname.replace("\\test", "");
		before(function (done) {
			child_process.exec("node bin/brady-tool compare " + bradyPath + " " + bradyPath + " -d 2", function (error, stdout, stderr) {
				if (error) console.log(error); // Handle errors.
				captured_stdout = stdout;
				return done();
			});
		});
		it('should log a table that is a depth of two', function() {
			expect(captured_stdout).to.contain('npm\\node_modules\\read');
		});
	});
	describe("depth and devDependencies", function(){
		var captured_stdout;
		var bradyPath = __dirname.replace("\\test", "");
		before(function (done) {
			child_process.exec("node bin/brady-tool compare " + bradyPath + " " + bradyPath + " -ad 2", function (error, stdout, stderr) {
				if (error) console.log(error); // Handle errors.
				captured_stdout = stdout;
				return done();
			});
		});
		it('should log a table that is a depth of two', function() {
			expect(captured_stdout).to.contain('mocha\\node_modules\\glob');
		});
	});
});
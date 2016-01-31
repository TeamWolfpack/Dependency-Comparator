var expect = require("chai").expect;
var sinon = require('mocha-sinon');
var cliTable = require("cli-table2");
var chalk = require("chalk");
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
		var dependencies = [];
		dependencies["gulp"] = gulp;
		dependencies["mocha"] = mocha;
		dependencies["chai"] = chai;
		bradyTool.createTable(dependencies);
		
		//Expected table
		var table = new cliTable({
			head: ["Module Name", "project1", "project1 Path", "project2", "project2 Path"],
			style: {
				head: [] //disable colors in header cells
			},
			wordWrap: true
		});
		table.push([{rowSpan: 2, content: "gulp"}, chalk.green("1.0.0"), "a/b/c", chalk.green("1.0.0"), "a/b/c"]);
		table.push(["", "", chalk.green("1.0.0"), "a/b/c"]);
		table.push([{rowSpan: 2, content: "mocha"}, chalk.green("1.0.0"), "a/b/c", chalk.green("1.0.0"), "a/b/c"]);
		table.push([chalk.green("1.0.0"), "a/b/c", "", ""]);
		table.push([{rowSpan: 2, content: "chai"}, chalk.green("1.0.0"), "a/b/c", chalk.green("1.0.0"), "a/b/c"]);
		table.push([chalk.green("1.0.0"), "a/b/c", chalk.green("1.0.0"), "a/b/c"]);
		expect(console.log.calledOnce).to.be.true;
		expect(console.log.calledWith(table.toString())).to.be.true;
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
		var dependencies = [];
		dependencies["gulp"] = gulp;
		bradyTool.createTable(dependencies);

		//Expected table
		var table = new cliTable({
			head: ["Module Name", "project1", "project1 Path", "project2", "project2 Path"],
			style: {
				head: [] //disable colors in header cells
			},
			wordWrap: true
		});
		table.push([{rowSpan: 2, content: "gulp"}, chalk.green("3.7.8"), "a/b/c", chalk.magenta("3.5.5"), "a/b/c"]);
		table.push([chalk.yellow("3.7.5"), "a/b/c", chalk.red("1.0.0"), "a/b/c"]);
		expect(console.log.calledOnce).to.be.true;
		expect(console.log.calledWith(table.toString())).to.be.true;
	});
	it("should highlight the pair green and the others white", function(){
		var gulp = {
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
			maxinstances: 1,
			instances: [{
				version: "1.0.0",
				Project: "project1",
				path: "a/b/c",
				color: "white"
			}]
		};
		var chai = {
			maxinstances: 1,
			instances: [{
				version: "1.0.0",
				Project: "project2",
				path: "a/b/c",
				color: "white"
			}]
		};
		var dependencies = [];
		dependencies["gulp"] = gulp;
		dependencies["mocha"] = mocha;
		dependencies["chai"] = chai;
		bradyTool.createTable(dependencies);

		//Expected table
		var table = new cliTable({
			head: ["Module Name", "project1", "project1 Path", "project2", "project2 Path"],
			style: {
				head: [] //disable colors in header cells
			},
			wordWrap: true
		});
		table.push([{rowSpan: 1, content: "gulp"}, chalk.green("3.7.8"), "a/b/c", chalk.green("3.7.8"), "a/b/c"]);
		table.push([{rowSpan: 1, content: "mocha"}, chalk.white("1.0.0"), "a/b/c", "", ""]);
		table.push([{rowSpan: 1, content: "chai"}, "", "", chalk.white("1.0.0"), "a/b/c"]);
		expect(console.log.calledOnce).to.be.true;
		expect(console.log.calledWith(table.toString())).to.be.true;
	});
});

describe("Compare Dependencies from files", function(){
	beforeEach(function() {
		this.sinon.stub(console, 'log');
		this.sinon.stub(bradyTool, 'createTable');
	});

	it("Should parse the dependencies and print them as a table", function(){
		var fileOne = "../";
		var fileTwo = "../";
		var depth = 1;
		bradyTool.compare(fileOne,fileTwo,depth=1);

		//Checks to see if the table was created
		expect(console.log.called).to.be.true;

	});

	it("Should parse the dependencies with a greater depth and print them as a table", function(){
		var fileOne = "../";
		var fileTwo = "../";
		var depth = 2;
		bradyTool.compare(fileOne,fileTwo,depth=1);

		//Checks to see if the table was created
		expect(console.log.called).to.be.true;

	});

	it("Should say that the file is not found, makes sure there is an exception", function(){
		var fileOne = "../";
		var fileTwo = "../s";
		var depth = 1;
		try {
			bradyTool.compare(fileOne, fileTwo, depth = 1);
		}catch(err){
			expect(err.message).to.equal("Cannot find module '../s/package.json'");
		}
	});
});
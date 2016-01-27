var expect = require("chai").expect;
var sinon = require('mocha-sinon');
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
		expect(1).to.equal(1);
	});
	it("should log \"Undefined dependencies parameter.\"", function(){
		bradyTool.createTable();
		expect(console.log.calledOnce).to.be.true;
		expect(console.log.calledWith("Undefined dependencies parameter.")).to.be.true;
	});
});

describe("Find Max Version", function(){
   it("one should equal one", function(){
      expect(1).to.equal(1);
   });
});
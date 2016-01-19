var expect = require("chai").expect,
		sinon = require('mocha-sinon'),
    bradyTool = require("../src/brady-tool");

/**
	Unit test for the function that creates the table
	@author Josh Leonard
*/
describe("Create Table", function(){
	 beforeEach(function() { //Sets up sinon for testing prints
     this.sinon.stub(console, 'log');
   });
	
   it("should display an empty table", function(){
			var emptyTable = {
				project1 : {
						name : 'project1',
						path : 'path/to/project1',
						dependencies : []
				},
				project2 : {
						name : 'project2',
						path : 'path/to/project2',
						dependencies : []
				}
			}
      bradyTool.createTable(emptyTable);
      expect( console.log.calledOnce ).to.be.true;
   });
});
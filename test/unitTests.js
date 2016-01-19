var expect = require("chai").expect;
var sinon = require('mocha-sinon');
var bradyTool = require("../src/brady-tool");

describe("Create Table", function(){
	 beforeEach(function() {
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
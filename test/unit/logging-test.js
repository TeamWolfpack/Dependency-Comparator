var chai = require("chai");
chai.use(require("chai-fs"));
var path = require("path");
var fs = require("fs");
var extfs = require("extfs");
var expect = chai.expect;
var assert = chai.assert;

var logger = require("../../modules/logger");

var testJSON = [{
		  "name": "jenkins",
		  "maxinstances": 1,
		  "instances": [
		   {
		    "version": "0.13.0",
		    "Project": "dependency-comparator",
		    "projectNumber": 1,
		    "path": "node_modules/jenkins",
		    "color": "minor"
		   },
		   {
		    "version": "0.10.1",
		    "Project": "sample-webservice",
		    "projectNumber": 2,
		    "path": "node_modules/jenkins",
		    "color": "minor"
		   }
		  ],
		  "npmVersion": {
		   "version": "npmVersion",
		   "color": "minor",
		  }
		 },
		 {
		  "name": "async",
		  "maxinstances": 1,
		  "instances": [
		   {
		    "version": "1.5.2",
		    "Project": "dependency-comparator",
		    "projectNumber": 1,
		    "path": "node_modules/async",
		    "color": "major"
		   }
		  ],
		  "npmVersion": {
		   "version": "npmVersion",
		   "color": "major",
		  }
		 }]

describe("Logger", function() {
    it("logDependencies should be a function", function() {
        assert.isFunction(logger.logDependencies, "true");
    });
    it("should log properly", function() {
        var loc = path.normalize(__dirname+"/../../logfiles");
        var sizeBefore;
        try{
        	sizeBefore = fs.readdirSync(loc).length;
        }catch(err){
        	sizeBefore = 0;
        }
    	var project = logger.logDependencies(testJSON);
    	var sizeAfter = fs.readdirSync(loc).length;
        assert.isDirectory(loc, "directory found");
        assert.equal(sizeAfter-1, sizeBefore, "log file added");
    });
    it("can make folder", function() {
    	var loc = path.normalize(__dirname+"/../../logfiles");
        extfs.removeSync(loc, function(err){
        	console.log("Folder removed.");
        });
    	var project = logger.logDependencies(testJSON);
        assert.isDirectory(loc, "directory found");
    });
});
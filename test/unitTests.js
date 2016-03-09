var chai = require("chai");
var expect = chai.expect;
var assert = chai.assert;

var parse = require("../modules/parse");

describe("Parse Tests", function(){
	describe("Version parsing", function(){
		it("parseVersion should be a function", function(){
			assert.isFunction(parse.parseVersion, "true")
		});
		it("should not parse undefined", function(){
			var parsedVersion = parse.parseVersion();
			assert.isUndefined(parsedVersion, 'Version must be defined');
		});
		it("should parse 1 into 1.0.0", function(){
			var parsedVersion = parse.parseVersion("1");
			expect(Object.keys(parsedVersion).length).to.equal(3);
			assert.isDefined(parsedVersion.major, 'major is defined');
			assert.isDefined(parsedVersion.minor, 'minor is defined');
			assert.isDefined(parsedVersion.patch, 'patch is defined');
			expect(parsedVersion.major).to.equal(1);
			expect(parsedVersion.minor).to.equal(0);
			expect(parsedVersion.patch).to.equal(0);
		});
		it("should parse 1.1 into 1.1.0", function(){
			var parsedVersion = parse.parseVersion("1.1");
			expect(Object.keys(parsedVersion).length).to.equal(3);
			assert.isDefined(parsedVersion.major, 'major is defined');
			assert.isDefined(parsedVersion.minor, 'minor is defined');
			assert.isDefined(parsedVersion.patch, 'patch is defined');
			expect(parsedVersion.major).to.equal(1);
			expect(parsedVersion.minor).to.equal(1);
			expect(parsedVersion.patch).to.equal(0);
		});
		it("should parse 1.1.1 into 1.1.1", function(){
			var parsedVersion = parse.parseVersion("1.1.1");
			expect(Object.keys(parsedVersion).length).to.equal(3);
			assert.isDefined(parsedVersion.major, 'major is defined');
			assert.isDefined(parsedVersion.minor, 'minor is defined');
			assert.isDefined(parsedVersion.patch, 'patch is defined');
			expect(parsedVersion.major).to.equal(1);
			expect(parsedVersion.minor).to.equal(1);
			expect(parsedVersion.patch).to.equal(1);
		});
	});
});
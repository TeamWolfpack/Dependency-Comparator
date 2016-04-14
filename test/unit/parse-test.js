var chai = require("chai");
var expect = chai.expect;
var assert = chai.assert;

var parse = require("../../modules/parse");

// look into sinon mocking
// look into proxyquire
describe("Parse Tests", function() {
    describe("Parse Version", function() {
        it("parseVersion should be a function", function() {
            assert.isFunction(parse.parseVersion, "true");
        });
        it("should not parse undefined", function() {
            var parsedVersion = parse.parseVersion();
            assert.isUndefined(parsedVersion, "Version must be defined");
        });
        it("should not parse letters", function() {
            var parsedVersion = parse.parseVersion("a.b.c");
            assert.isUndefined(parsedVersion, "Version must be defined");
        });
        it("should parse 1 into 1.0.0", function() {
            var parsedVersion = parse.parseVersion("1");
            expect(Object.keys(parsedVersion).length).to.equal(3);
            assert.isDefined(parsedVersion.major, "major is defined");
            assert.isDefined(parsedVersion.minor, "minor is defined");
            assert.isDefined(parsedVersion.patch, "patch is defined");
            expect(parsedVersion.major).to.equal(1);
            expect(parsedVersion.minor).to.equal(0);
            expect(parsedVersion.patch).to.equal(0);
        });
        it("should parse 1.1 into 1.1.0", function() {
            var parsedVersion = parse.parseVersion("1.1");
            expect(Object.keys(parsedVersion).length).to.equal(3);
            assert.isDefined(parsedVersion.major, "major is defined");
            assert.isDefined(parsedVersion.minor, "minor is defined");
            assert.isDefined(parsedVersion.patch, "patch is defined");
            expect(parsedVersion.major).to.equal(1);
            expect(parsedVersion.minor).to.equal(1);
            expect(parsedVersion.patch).to.equal(0);
        });
        it("should parse 1.1.1 into 1.1.1", function() {
            var parsedVersion = parse.parseVersion("1.1.1");
            expect(Object.keys(parsedVersion).length).to.equal(3);
            assert.isDefined(parsedVersion.major, "major is defined");
            assert.isDefined(parsedVersion.minor, "minor is defined");
            assert.isDefined(parsedVersion.patch, "patch is defined");
            expect(parsedVersion.major).to.equal(1);
            expect(parsedVersion.minor).to.equal(1);
            expect(parsedVersion.patch).to.equal(1);
        });
        it("should parse beta and alpha versions", function() {
            var parsedVersion = parse.parseVersion("1.1.1-beta2");
            expect(Object.keys(parsedVersion).length).to.equal(4);
            assert.isDefined(parsedVersion.major, "major is defined");
            assert.isDefined(parsedVersion.minor, "minor is defined");
            assert.isDefined(parsedVersion.patch, "patch is defined");
            assert.isDefined(parsedVersion.stage, "stage is defined");
            expect(parsedVersion.major).to.equal(1);
            expect(parsedVersion.minor).to.equal(1);
            expect(parsedVersion.patch).to.equal(1);
            expect(parsedVersion.stage).to.contain("beta");
        });
    });
    describe("Parse Dependencies", function() {
        it("parseVersion should be a function", function() {
            assert.isFunction(parse.parseDependencies, "true");
        }); // might not be needed
        it("should parse dependencies", function() {
            var project = parse.parseDependencies(".", 1, false);
            assert.isArray(project.dependencies, "Array of dependencies is made");
            assert.isDefined(project.dependencies.async, "Async is in the list");
            assert.isUndefined(project.dependencies.mocha, "Mocha is a devDep");
        });
        it("should parse all dependencies including dev", function() {
            var project = parse.parseDependencies(".", 1, true);
            assert.isArray(project.dependencies, "Array of dependencies is made");
            assert.isDefined(project.dependencies.async, "Async is in the list");
            assert.isDefined(project.dependencies.mocha, "Mocha is included");
        });
        it("should parse all dependencies depth 2", function() {
            var project = parse.parseDependencies(".", 2, true);
            assert.isArray(project.dependencies, "Array of dependencies is made");
            assert.isDefined(project.dependencies.async, "Async is in the list");
            assert.isDefined(project.dependencies.mocha, "Mocha is included");
            assert.isDefined(project.dependencies.glob, "Glob is a dep of npm");
        });
    });
});

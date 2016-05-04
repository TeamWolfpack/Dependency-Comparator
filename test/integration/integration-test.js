var expect = require("chai").expect;
var sinon = require("mocha-sinon");
var childProcess = require("child_process");
var path = require("path");

/**
 Simple unit test for testing in the CI
 @author Josh Leonard
 */
describe("Simple Test", function() {
    it("one should equal one", function() {
        expect(1).to.equal(1);
    });
});

describe("Test Paths", function() {
    describe("No project paths", function() {
        var capturedStdout;
        before(function(done) {
            childProcess.exec("node bin/brady-tool compare", function(error, stdout, stderr) {
                if (error) { capturedStdout = "error: missing required argument"; } else { capturedStdout = stdout; }
                return done();
            });
        });
        it("should log file was not found", function() {
            expect(capturedStdout).to.contain("error: missing required argument");
        });
    });
    describe("invalid project path entered", function() {
        var capturedStdout;
        before(function(done) {
            childProcess.exec("node bin/brady-tool compare .jkbkjnkj", function(error, stdout, stderr) {
                if (error) { console.log(error); } // Handle errors.
                capturedStdout = stdout;
                return done();
            });
        });
        it("should log project was not found", function() {
            expect(capturedStdout).to.contain("Project path is invalid: .jkbkjnkj");
            expect(capturedStdout).to.contain("No projects found");
        });
    });
    describe("Relative paths should work", function() {
        var capturedStdout;
        before(function(done) {
            var child = childProcess.spawn("node", ["bin/brady-tool.js", "compare", ".", "."]);
            child.stdout.on("data", function(stdout) {
                capturedStdout += stdout;
                if (capturedStdout.indexOf("Listening on localhost:") > -1) {
                    child.kill();
                    return done();
                }
            });
        });
        it("should compare itself and log the table", function() {
            expect(capturedStdout).to.contain("dependency-comparator");
        });
    });
});

describe("Test Compare", function() {
    describe("devDependencies", function() {
        var capturedStdout;
        before(function(done) {
            var child = childProcess.spawn("node", ["bin/brady-tool.js", "compare", ".", ".", "-a"]);
            child.stdout.on("data", function(stdout) {
                capturedStdout += stdout;
                if (capturedStdout.indexOf("Listening on localhost:") > -1) {
                    child.kill();
                    return done();
                }
            });
        });
        it("should log a table that includes devDeps", function() {
            expect(capturedStdout).to.contain("mocha");
            expect(capturedStdout).to.contain("major");
            expect(capturedStdout).to.contain("minor");
            expect(capturedStdout).to.contain("patch");
            expect(capturedStdout).to.contain("unmatched");
            expect(capturedStdout).to.not.contain("Major Difference");
        });
    });
    describe("Hide Summary", function() {
        var capturedStdout;
        before(function(done) {
            var child = childProcess.spawn("node", ["bin/brady-tool.js", "compare", ".", ".", "-s"]);
            child.stdout.on("data", function(stdout) {
                capturedStdout += stdout;
                if (capturedStdout.indexOf("Listening on localhost:") > -1) {
                    child.kill();
                    return done();
                }
            });
        });
        it("should hide the summary", function() {
            expect(capturedStdout).to.not.contain("major");
            expect(capturedStdout).to.not.contain("minor");
            expect(capturedStdout).to.not.contain("patch");
            expect(capturedStdout).to.not.contain("unmatched");
            expect(capturedStdout).to.not.contain("Major Difference");
        });
    });
    describe("Color Legend", function() {
        var capturedStdout;
        before(function(done) {
            var child = childProcess.spawn("node", ["bin/brady-tool.js", "compare", ".", ".", "-l"]);
            child.stdout.on("data", function(stdout) {
                capturedStdout += stdout;
                if (capturedStdout.indexOf("Listening on localhost:") > -1) {
                    child.kill();
                    return done();
                }
            });
        });
        it("should log the color legend", function() {
            expect(capturedStdout).to.contain("major");
            expect(capturedStdout).to.contain("minor");
            expect(capturedStdout).to.contain("patch");
            expect(capturedStdout).to.contain("unmatched");
            expect(capturedStdout).to.contain("Major Difference");
            expect(capturedStdout).to.contain("Minor Difference");
            expect(capturedStdout).to.contain("Patch Difference");
        });
    });
    describe("Depth", function() {
        var capturedStdout;
        before(function(done) {
            var child = childProcess.spawn("node", ["bin/brady-tool.js", "compare", ".", ".", "-d", "2"]);
            child.stdout.on("data", function(stdout) {
                capturedStdout += stdout;
                if (capturedStdout.indexOf("Listening on localhost:") > -1) {
                    child.kill();
                    return done();
                }
            });
        });
        it("should log a table that is a depth of two", function() {
            expect(capturedStdout).to.contain(path.normalize("/node_modules/minimist"));
            expect(capturedStdout).to.contain("major");
            expect(capturedStdout).to.contain("minor");
            expect(capturedStdout).to.contain("patch");
            expect(capturedStdout).to.contain("unmatched");
            expect(capturedStdout).to.not.contain("Major Difference");
        });
    });
});

describe("Test Summary", function() {
    this.timeout(0);
    describe("Print Summary", function() {
        var capturedStdout;
        before(function(done) {
            var child = childProcess.spawn("node", ["bin/brady-tool.js", "summary", ".", "."]);
            child.stdout.on("data", function(stdout) {
                capturedStdout += stdout;
                if (capturedStdout.indexOf("Listening on localhost:") > -1) {
                    child.kill();
                    return done();
                }
            });
        });
        it("should include color legend", function() {
            expect(capturedStdout).to.contain("major");
            expect(capturedStdout).to.contain("minor");
            expect(capturedStdout).to.contain("patch");
            expect(capturedStdout).to.contain("unmatched");
        });
    });
});

describe("Compare and Summary", function() {
    var capturedCompare;
    var capturedSummary;
    before(function(done) {
        var child = childProcess.spawn("node", ["bin/brady-tool.js", "compare", ".", "."]);
        child.stdout.on("data", function(stdout) {
            capturedCompare += stdout;
            if (capturedCompare.indexOf("Listening on localhost:") > -1) {
                child.kill();
                return done();
            }
        });
    });
    before(function(done) {
        var child = childProcess.spawn("node", ["bin/brady-tool.js", "summary", ".", ".", "-t"]);
        child.stdout.on("data", function(stdout) {
            capturedSummary += stdout;
            if (capturedSummary.indexOf("Listening on localhost:") > -1) {
                child.kill();
                return done();
            }
        });
    });
    it("should log a table that is a depth of two", function() {
        expect(capturedCompare.length).to.equal(capturedSummary.length);
    });
});

describe("Test topDir", function() {
	describe("Valid Directory", function() {
		var capturedOutput;
		before(function(done) {
			var child = childProcess.spawn("node", ["bin/brady-tool.js", "topDir", ".."]);
			child.stdout.on("data", function(stdout) {
				capturedOutput += stdout;
				if (capturedOutput.indexOf("Listening on localhost:") > -1) {
					child.kill();
					return done();
				}
			});
		});
		it("should log a table that is a depth of two", function() {
			expect(capturedOutput).to.contain("Listening on localhost:");
		});
	});
	describe("Invalid Directory", function() {
		var capturedOutput;
		before(function(done) {
			var child = childProcess.spawn("node", ["bin/brady-tool.js", "topDir", "jshdasae"]);
			child.stdout.on("data", function(stdout) {
				capturedOutput += stdout;
				if (capturedOutput.indexOf("Error:") > -1) {
					child.kill();
					return done();
				}
			});
		});
		it("should log a table that is a depth of two", function() {
			expect(capturedOutput).to.contain("Error:");
			expect(capturedOutput).to.contain("jshdasae");
		});
	});
	describe("No Projects in Directory", function() {
		var capturedOutput;
		before(function(done) {
			var child = childProcess.spawn("node", ["bin/brady-tool.js", "topDir", "."]);
			child.stdout.on("data", function(stdout) {
				capturedOutput += stdout;
				if (capturedOutput.indexOf("No projects in directory") > -1) {
					child.kill();
					return done();
				}
			});
		});
		it("should log a table that is a depth of two", function() {
			expect(capturedOutput).to.contain("No projects in directory: '.'");
		});
	});
});

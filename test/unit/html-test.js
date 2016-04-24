/**
 * Created by farrowc on 3/23/2016.
 */
var chai = require("chai");
var sinon = require("sinon");
var expect = chai.expect;
var assert = chai.assert;
var clc = require("cli-color");
var path = require("path");
var open = require("open");
var main = require(path.normalize("../../bin/brady-tool"));

describe("HTML Tests", function() {
    describe("Check to see that HTML was opened", function() {
        it("Should open the page when the openHTML function is called", function() {
            //assert.isTrue(html.openHTML(null));
        });
    });
});

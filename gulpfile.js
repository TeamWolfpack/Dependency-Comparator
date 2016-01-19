var gulp = require('gulp');
var eslint = require('gulp-eslint');
var jscs = require('gulp-jscs');
var mocha = require('gulp-mocha');

// File io
var fs = require("fs");
// look into, might use colors at bottom of runMochaTest
var util = require("util");

//directories containing javascript files
var allJSFiles = ["./test/unit/**/*.js", "./src/**/*.js",
    "./test/integration/**/*-test.js", "!./src/**/*.min.js",
    "!./src/public/**/*.js"];
//directories containing unit tests javascript files
var unitTestFiles = ["./test/unit/**/*-test.js"];
//directories containing integration tests javascript files
var integrationTestFiles = ["./test/integration/**/*-test.js"];

/**
 * Default task ran by gulp. Does 'compile' like function. Points gulp
 * destination folder.
 * @command: ''
 * @command: default
 */
gulp.task('default', function() {
    //may use this to perform code compilation
    gulp.src('src/**/*.js')
        .pipe(gulp.dest('dist'));
});

/**
 * Runs unit tests with mocha.
 * @command: Allows for "run tests with mocha".
 * @return see @(var runMochaTest)
 */
gulp.task("unitTests", function(done){
    runMochaTest(unitTestFiles, 120000, true, done);
});

/**
 * Runs integration tests with mocha.
 * @command: Allows for "run tests with mocha".
 * @return see @(var runMochaTest)
 */
gulp.task("integrationTests", function(done){
    runMochaTest(integrationTestFiles, 120000, true, done);
});

/**
 * Run static analysis for 'style' with jscs.
 * Tests style of code with jscs package.
 * @command: Allows for Formatting Code.
 */
gulp.task("jscs", function() {
    return gulp.src(allJSFiles)
        .pipe(jscs({configPath:"./.jscsrc"}))
        .pipe(jscs.reporter());
});

/**
 * Runs jscs with fix flag to format code.
 * Formats code with jscs package.
 * @command: Allows for lint to format code.
 */
gulp.task("format", function(){
    return gulp.src(allJSFiles, {base: "./"})
        .pipe(jscs({fix:true, configPath:"./.jscsrc"}))
        .pipe(gulp.dest("./"));
});

/**
 * Run eslint through gulp.
 * @command: Allows for linting with gulp..
 */
gulp.task("lint", function(){
    return gulp.src(allJSFiles)
        .pipe(eslint({useEslintrc:true}))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

/**
 * Helper method for handling Mocha Tests with Gulp.
 * @param files - files to unit tests with Mocha
 * @param timeoutInMillis - time in milliseconds to timeout tests
 * @param exitOnError - boolean
 * @param done - boolean if reports(success/fail)
 * @returns 0 on all tests pass, 1 on test failure
 */
var runMochaTest = function(files, timeoutInMillis, exitOnError, done) {
    return gulp.src(files)
    .pipe(mocha({
        reporter: "spec", // look into spec
        ui: "bdd", // look into ui: bdd and whether we can run tdd vs bdd
        timeout: timeoutInMillis,
    }))
    .once("error", function(error) {
        /*
         * gehred added this console log, because when there is a
         * runtime error the tests just abort at that spot. It is
         * nice to get information. The whole handler was added
         * because examples of using mocha in gulp said that when
         * mocha does not close correctly on timeouts the gulp
         * task would never end.
         */
        console.log("Error Information -> " + util.inspect(arguments,
                {depth: 2, colors: true}));
        if (exitOnError) {
            done(error);
        }
    });
};
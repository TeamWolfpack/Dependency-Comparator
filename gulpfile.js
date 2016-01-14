var gulp = require('gulp');
var eslint = require('gulp-eslint');
var jscs = require('gulp-jscs');
var mocha = require('gulp-mocha');

// File io
var fs = require("fs");
// look into, might use colors at bottom of runMochaTest
var util = require("util");

gulp.task('default', function() {
    // place code for your default task here
});

/*
 * Alternative default task
 * gulp.task('default', ['array', 'of', 'task', 'names']);
 */

gulp.task("jscs", function() {
    return gulp.src(allJSFiles)
        .pipe(jscs({configPath:"./.jscsrc"}))
        .pipe(jscs.reporter());
});

// Needs editing
var runMochaTest = function(files, timeoutInMillis, exitOnError, done) {
    return gulp.src(files)
    .pipe(mocha({
        reporter: "spec", // look into spec
        ui: "bdd", // look into ui: bdd and whether we can run tdd vs bdd
        timeout: timeoutInMillis,
    }))
    .once("error", function(error) {
        // gehred added this console log, because when there is a runtime error the tests
        // just abort at that spot. It is nice to get information. The whole handler was added
        // because examples of using mocha in gulp said that when mocha does not close correctly
        // on timeouts the gulp task would never end.

        console.log("Error Information -> " + util.inspect(arguments, {depth: 2, colors: true}));
        if (exitOnError) {
            done(error);
        }
    });
};
var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var eslint = require('gulp-eslint');
var istanbul = require('gulp-babel-istanbul');
var jscs = require("gulp-jscs");
var mocha = require("gulp-mocha");
var plumber = require("gulp-plumber");
var sloc = require("gulp-sloc-simply");
var watch = require("gulp-watch");

var fs = require("fs");
var mergeStream = require('merge-stream');
var util = require("util");
var argv = require("yargs").argv;

var babelCompiler = require('babel/register')();

var unitTestFiles = ["./test/unit/**/*-test.js"];
var integrationTestFiles = ["./test/integration/**/*-test.js"];
var srcFiles = ["./src/**/*.js", "!./src/**/*.min.js", "!./src/public/**/*.js"];
var allJSFiles = ["./test/unit/**/*.js", "./src/**/*.js", "./test/integration/**/*-test.js", "!./src/**/*.min.js", "!./src/public/**/*.js"];

var compile = function(){
    gulp.src('src/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(babel({ optional: ['runtime'] }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist'));
};

gulp.task('default', function () {
    compile();
});

gulp.task("watch", function(cb){
    watch(srcFiles, function(){
        compile(cb);
    });
});

gulp.task("integrationTest", function(done) {
    runMochaTest(integrationTestFiles, 120000, true, done);
});

gulp.task("unitTest", function(done) {
    runMochaTest(unitTestFiles, 120000, true, done);
});

gulp.task("jscs", function() {
    return gulp.src(allJSFiles)
        .pipe(jscs({configPath:"./.jscsrc"}))
        .pipe(jscs.reporter());
});

gulp.task("format", function() {
    return gulp.src(allJSFiles, {base: "./"})
        .pipe(jscs({fix:true, configPath:"./.jscsrc"}))
        .pipe(gulp.dest("./"));
});

gulp.task('lint', function () {
    return gulp.src(allJSFiles)
        .pipe(eslint({useEslintrc:true}))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task("utestcov", function(cb){
    var coverageDirectory = "./coverage";
    mergeStream(
        gulp.src(srcFiles).pipe(istanbul({"includeUntested": true})),
        gulp.src(unitTestFiles).pipe(babel())
    ).pipe(istanbul.hookRequire())
    .on("finish", function(){
        gulp.src(unitTestFiles)
            .pipe(mocha({
                compilers: {
                    js: babelCompiler
                }
            }))
            .pipe(istanbul.writeReports({dir: coverageDirectory}))
            .on("end", cb);
    })
});

gulp.task("sloc", function() {
    gulp.src(srcFiles).pipe(sloc());
});

gulp.task("slocAll", function() {
    gulp.src(allJSFiles).pipe(sloc());
});

gulp.task("star", function(cb) {
    var packageJsonPath = path.resolve("./package.json");
    var packageObject = require(packageJsonPath);
    for (var dependency in packageObject.dependencies) {
        packageObject.dependencies[dependency] = "*";
    }
    for (var devDependency in packageObject.devDependencies) {
        packageObject.devDependencies[devDependency] = "*";
    }
    fs.writeFile(packageJsonPath, JSON.stringify(packageObject, null, 2), function(err) {
        cb(err);
    });
});

var runMochaTest = function(files, timeoutInMillis, exitOnError, done) {
    if (argv.testGrep === undefined) {
        console.log("To limit number tests run you can specify gulp unitTest --testGrep [limiter]");
    }

    return gulp.src(files)
    .pipe(mocha({
        compilers: {
            js: babelCompiler
        },
        reporter: "spec",
        ui: "bdd",
        timeout: timeoutInMillis,
        grep: (argv.testGrep !== undefined) ? argv.testGrep : ""
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
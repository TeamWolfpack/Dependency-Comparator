var gulp = require('gulp');
var bump = require('gulp-bump');
var git = require('gulp-git');
var eslint = require('gulp-eslint');
var jscs = require('gulp-jscs');
var mocha = require('gulp-mocha');
var npm = require('npm');// NPM, needed for npm publish
var fs = require('fs');
var util = require('util');
var gulpprompt = require('gulp-prompt');

//directories containing javascript files
var allJSFiles = ["./test/unit/**/*.js", "./bin/**/*.js",
    "./test/integration/**/*-test.js", "!./bin/**/*.min.js",
    "!./bin/public/**/*.js"];
//directories containing unit tests javascript files
var unitTestFiles = ["./test/unitTests.js"];
//directories containing integration tests javascript files
var integrationTestFiles = ["./test/integration/**/*-test.js"];

//Default task ran by gulp. Does 'compile' like function. Points gulp
//destination folder.
//@command: ''
//@command: default
gulp.task('default', function() {
    //may use this to perform code compilation
    gulp.src('bin/**/*.js')
        .pipe(gulp.dest('dist'));
});

//Runs unit tests with mocha.
//@command: Allows for "run tests with mocha".
//@return see @(var runMochaTest)
gulp.task("unitTests", function(done){
    runMochaTest(unitTestFiles, 120000, true, done);
});

//Runs integration tests with mocha.
//@command: Allows for "run tests with mocha".
//@return see @(var runMochaTest)
gulp.task("integrationTests", function(done){
    runMochaTest(integrationTestFiles, 120000, true, done);
});

//Run static analysis for 'style' with jscs.
//Tests style of code with jscs package.
//@command: Allows for Formatting Code.
gulp.task("jscs", function() {
    return gulp.src(allJSFiles)
        .pipe(jscs({configPath:"./.jscsrc"}))
        .pipe(jscs.reporter());
});

//Runs jscs with fix flag to format code.
//Formats code with jscs package.
//@command: Allows for lint to format code.
gulp.task("format", function(){
    return gulp.src(allJSFiles, {base: "./"})
        .pipe(jscs({fix:true, configPath:"./.jscsrc"}))
        .pipe(gulp.dest("./"));
});

//Run eslint through gulp.
//@command: Allows for linting with gulp.
gulp.task("lint", function(){
    return gulp.src(allJSFiles)
        .pipe(eslint({useEslintrc:true}))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

//Run git add; src is the file(s) to add (or ./*)
gulp.task('add', function(callback){
  gulp.src('.')
    .pipe(git.add());
	return callback();
});

//Run git commit; src are the files to commit (or ./*)
gulp.task('commit', function(){
  // just source anything here - we just wan't to call 
  //the prompt for now
    gulp.src('package.json')
    .pipe(gulpprompt.prompt({
        type: 'input',
        name: 'commit',
        message: 'Please enter commit message...'
    },  function(res){
      // now add all files that should be committed
      // but make sure to exclude the .gitignored ones, 
	  //since gulp-git tries to commit them, too
      gulp.src([ '!node_modules/', './*' ], {buffer:false})
	  .pipe(git.commit(res.commit));
	 
    }));
});

//Increments the major version of node module: x.0.0
//@url - https://github.com/stevelacy/gulp-bump
gulp.task('bumpMajor', function () {
  return gulp.src(['./package.json'])
    .pipe(bump({type:'major'}))
    .pipe(gulp.dest('./'));
});

//Increments the minor version of node module: 0.x.0
//@url - https://github.com/stevelacy/gulp-bump
gulp.task('bumpMinor', function () {
  return gulp.src(['./package.json'])
    .pipe(bump({type:'minor'}))
    .pipe(gulp.dest('./'));
});

//Increments the patch version of node module: 0.0.x
//@url - https://github.com/stevelacy/gulp-bump
gulp.task('bumpPatch', function () {
  return gulp.src(['./package.json'])
    .pipe(bump({type:'patch'}))
    .pipe(gulp.dest('./'));
});

//Increments the patch beta version of node module: 0.0.x-beta.0
//@url - https://github.com/stevelacy/gulp-bump
gulp.task('bumpPatchBeta', function () {
  return gulp.src(['./package.json'])
    .pipe(bump({type:'prerelease', preid : 'beta'}))
    .pipe(gulp.dest('./'));
});

//Run git push to the dev branch.
gulp.task('pushDev', function(){
  return git.push('origin', 'dev', function (err) {
    if (err) throw err;
  });
});

// Run git push to the master branch.
gulp.task('pushMaster', function(){
  return git.push('origin', 'master', function (err) {
    if (err) throw err;
  });
});

//Run git pull on the dev branch.
gulp.task('pullDev', function(){
  return git.pull('origin', 'dev', function (err) {
    if (err) throw err;
  });
});

//Run git pull on the master branch.
gulp.task('pullMaster', function(){
  git.pull('origin', 'master', function (err) {
    if (err) throw err;
  });
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
        reporter: "spec",
        ui: "bdd",
        timeout: timeoutInMillis,
    }))
    .once("error", function(error) {
        console.log("Error Information -> " + util.inspect(arguments,
                {depth: 2, colors: true}));
        if (exitOnError) {
            done(error);
        }
    });
};

//Publishes module to npm.
gulp.task('npmPublish', function (callback) {
    var username = "bradyteamstark";
    var password = "1PddAQLjXpWP";
    var email = "kuczynskij@msoe.edu";
    var uri = "http://registry.npmjs.org/";
    npm.load(null, function (loadError) {
        if (loadError) {
            return callback(loadError);
        }
		
		npm.version.patch;
		
        var auth = {
            username: username,
            password: password,
            email: email,
            alwaysAuth: true
        };
        var addUserParams = {
            auth: auth
        };
        npm.registry.adduser(uri, addUserParams, function (addUserError,
		data, raw, res) {
            if (addUserError) {
                return callback(addUserError);
            }
            var metadata = require('./package.json');
            metadata = JSON.parse(JSON.stringify(metadata));
            npm.commands.pack([], function (packError) {
                if (packError) {
                    return callback(packError);
                }
                var fileName = metadata.name + '-' + metadata.version 
					+ '.tgz';
                var bodyPath = require.resolve('./' + fileName);
                var body = fs.createReadStream(bodyPath);
                var publishParams = {
                    metadata: metadata,
                    access: 'public',
                    body: body,
                    auth: auth
                };
                npm.registry.publish(uri, publishParams, function
				(publishError, resp) {
                    fs.unlinkSync(bodyPath);
					if (publishError) {
                        return callback(publishError);
                    }
                    console.log("Publish succesfull: " + 
						JSON.stringify(resp));
                    return callback();
                });
            })
        });
    });
});
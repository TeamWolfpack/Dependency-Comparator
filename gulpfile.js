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

//https://ponyfoo.com/articles/my-first-gulp-adventure

//directories containing javascript files
var allJSFiles = ["./test/unit/**/*.js", "./src/**/*.js",
    "./test/integration/**/*-test.js", "!./src/**/*.min.js",
    "!./src/public/**/*.js"];
//directories containing unit tests javascript files
//var unitTestFiles = ["./test/unit/**/*-test.js"];
var unitTestFiles = ["./test/unitTests.js"];
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

// Run git add
// src is the file(s) to add (or ./*)
gulp.task('add', ['bumpPatch'], function(){
  return gulp.src('.')
    .pipe(git.add());
});

gulp.task('staticcommit', ['add'], function(callback){
  gulp.src('package.json')
    .pipe(git.commit('initial commit'));
  return callback();
});

// Run git commit
// src are the files to commit (or ./*)
/* gulp.task('commit', function(){
    var message;
    gulp.src('./*', {buffer:false})
    .pipe(gulpprompt.prompt({
        type: 'input',
        name: 'commit',
        message: 'Please enter commit message: '
    }, function(res){
        message = res.commit;
		.pipe(git.commit(message));
    }))
}); */
gulp.task('commit', ['add'], function(callback){
  // just source anything here - we just wan't to call the prompt for now
    return gulp.src('package.json')
    .pipe(gulpprompt.prompt({
        type: 'input',
        name: 'commit',
        message: 'Please enter commit message...'
    },  function(res){
      // now add all files that should be committed
      // but make sure to exclude the .gitignored ones, since gulp-git tries to commit them, too
      return gulp.src([ '!node_modules/', './*' ], {buffer:false})
      .pipe(git.commit(res.commit));
    }));
});


//@url - https://github.com/stevelacy/gulp-bump
gulp.task('bumpMajor', function () {
  return gulp.src(['./package.json'])
    .pipe(bump({type:'major'}))
    .pipe(gulp.dest('./'));
});

gulp.task('bumpMinor', function () {
  return gulp.src(['./package.json'])
    .pipe(bump({type:'minor'}))
    .pipe(gulp.dest('./'));
});

gulp.task('bumpPatch', ['pullDev'], function () {
  return gulp.src(['./package.json'])
    .pipe(bump({type:'patch'}))
    .pipe(gulp.dest('./'));
});

// Run git push
// remote is the remote repo
// branch is the remote branch to push to
gulp.task('pushDev', ['commit'], function(callback){
  git.push('origin', 'dev', function (err) {
    if (err) throw err;
  });
  return callback();
});

// Run git push
// remote is the remote repo
// branch is the remote branch to push to
gulp.task('pushMaster', function(){
  return git.push('origin', 'master', function (err) {
    if (err) throw err;
  });
});

// Run git pull
// remote is the remote repo
// branch is the remote branch to pull from
gulp.task('pullDev', function(callback){
  git.pull('origin', 'dev', function (err) {
    if (err) return callback(err);
	return callback();
  });
});

// Run git pull
// remote is the remote repo
// branch is the remote branch to pull from
gulp.task('pullMaster', function(callback){
  git.pull('origin', 'master', {args: '--rebase'}, function (err) {
    if (err) return callback(err);
	return callback();
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

//git pull
//git add .
//git commit -m "something"
//npm version patch
//git push
//git npmPublish -> I'm thinking only to let Jenkins do this
/**
 * Will do everything you would want to do before pushing up to Dev.
 */
gulp.task('ciDev', ['pushDev']);

/**
 * Publishes module to npm.
 */
gulp.task('npmPublish', function (callback) {
    var username = "bradyteamstark";//process.argv.slice(2)[2];
    var password = "1PddAQLjXpWP";//process.argv.slice(2)[4];
    var email = "kuczynskij@msoe.edu";//process.argv.slice(2)[6];
    /* if (!username) {
        var usernameError = new Error("Username is required as an argument --username exampleUsername");
        return callback(usernameError);
    }
    if (!password) {
        var passwordError = new Error("Password is required as an argument --password  examplepassword");
        return callback(passwordError);
    }
    if (!email) {
        var emailError = new Error("Email is required as an argument --email example@email.com");
        return callback(emailError);
    } */
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
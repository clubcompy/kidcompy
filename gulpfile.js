var gulp = require('gulp');
var karma = require('gulp-karma');
var webpack = require('webpack');
var gulpWebpack = require('gulp-webpack');
var runSequence = require("run-sequence");
var FirefoxProfile = require('firefox-profile');
var wd = require("wd");
var selenium = require('selenium-standalone');

gulp.task('default', function () {
  return gulp.src("lib/Main.js")
    .pipe(gulpWebpack({}), webpack)
    .pipe(gulp.dest("build/"));
});

var testFiles = [
  'lib/**/*.spec.js'
];

gulp.task("install-selenium", function(callback) {
  selenium.install({
    logger: function(message) {
      console.log(message);
    }
  }, function(error) {
    if(error) {
      callback(error);
    }
    else {
      callback();
    }
  });
});

gulp.task('test', function () {
  // Be sure to return the stream
  return gulp.src(testFiles)
    .pipe(karma({
      configFile: 'karma.conf.js',
      action: 'run'
    }))
    .on('error', function (err) {
      throw err;
    });
});

gulp.task("launch-karma-watcher", function() {
  return gulp.src(testFiles).pipe(karma({
    configFile: 'karma.conf.js',
    action: 'watch'
  }));
});

gulp.task('dev', function () {
  runSequence("start-selenium",
              ["launch-karma-watcher", "spawn-harness"]);
});

gulp.task("start-selenium", function(callback) {
  selenium.start({
    spawnOptions: {
      detached: false,
      stdio: "inherit"
    }
  }, function(error, childProcess) {
    if(error) {
      console.log("*********************************************************************************");
      console.log("** Error starting selenium, perhaps you need to run 'gulp install-selenium' once?");
      console.log("*********************************************************************************");

      callback(error);
    }
    else {
      callback();
    }
  });
});

gulp.task("spawn-harness", function(callback) {
  // set some userPrefs if needed
  // Note: make sure you call encoded() after setting some userPrefs
  var fp = new FirefoxProfile(),
    browser;

  // activate and open firebug by default for all sites
  fp.setPreference('extensions.firebug.allPagesActivation', 'on');
  // activate the console panel
  fp.setPreference('extensions.firebug.console.enableSites', true);
  // show the console panel
  fp.setPreference('extensions.firebug.defaultPanelName', 'console');

  fp.setPreference("datareporting.healthreport.uploadEnabled", false);
  fp.setPreference("browser.rights.3.shown", true);

  // done with prefs?
  fp.updatePreferences();

  // you can install multiple extensions at the same time
  fp.addExtensions(['./resources/firebug-2.0.9.xpi'], function() {
    fp.encoded(function (zippedProfile) {
      browser = wd.promiseChainRemote();
      browser.init({
        browserName: 'firefox',
        firefox_profile: zippedProfile
      }).
      get('http://en.wikipedia.org');

      // never call the callback, let it hang here so that the selenium browser stays open
      //callback();
    });
  });
});
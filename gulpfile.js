var path = require("path");
var gulp = require('gulp');
var spawn = require('child_process').spawn;
var karma = require('gulp-karma');
var webpack = require('webpack');
var WebpackDevServer = require("webpack-dev-server");
var gulpWebpack = require('gulp-webpack');
var runSequence = require("run-sequence");
var FirefoxProfile = require('firefox-profile');
var wd = require("wd");
var selenium = require('selenium-standalone');
var finalhandler = require('finalhandler');
var http = require('http');
var serveStatic = require('serve-static');


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
  runSequence(["start-selenium", "start-harness-content"],
              ["start-harness-server"],
              ["spawn-harness", "launch-karma-watcher"]);
});

gulp.task('start-selenium', function () {
  spawn('./selenium-standalone', ["start"], {
    cwd: "./node_modules/selenium-standalone/bin",
    detached: false,
    stdio: "inherit"
  });
});

gulp.task("start-harness-content", function() {
  // Serve up harnessContent folder
  var serve = serveStatic('./harnessContent', {'index': ['index.html', 'index.htm']});

  // Create server
  var server = http.createServer(function(req, res){
    var done = finalhandler(req, res);
    serve(req, res, done);
  });

  // Listen
  server.listen(9080);
});

gulp.task("start-harness-server", function(callback) {
  var server = new WebpackDevServer(webpack({
    entry: {
      "harness": ["webpack/hot/dev-server", "./lib/Main.js"]
    },
    output: {
      path: __dirname + "/devBuild",
      filename: "[name].js",
      chunkFilename: "[id].js"
    },

    module: {
      loaders: [
        /* .ejs : precompiled lodash template */
        { test: /\.ejs$/, loader: "ejs" },

        /* .scss : SASS file that is compiled to a named .css file in the css folder */
        {
          test: /\.scss$/,
          loader: "style/url?limit=0!file?name=css/[name].css?[hash]!sass?outputStyle=expanded" +
          "&includePaths[]=" +
          (path.resolve(__dirname, "./node_modules"))
        }
      ]
    },

    dist: {
      cache: false
    },

    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.ProvidePlugin({
        "_": "lodash"                         /* make lodash available to all modules */
      })
    ]
  }), {
    // webpack-dev-server option
    contentBase: "./devBuild",
    // or: contentBase: "http://localhost/",

    hot: true,
    // Enable special support for Hot Module Replacement
    // Page is no longer updated, but a "webpackHotUpdate" message is send to the content
    // Use "webpack/hot/dev-server" as additional module in your entry point
    // Note: this does _not_ add the `HotModuleReplacementPlugin` like the CLI option does.

    // webpack-dev-middleware options
    quiet: false,
    noInfo: false,
    lazy: false,
    watchDelay: 100,
    publicPath: "/",
    //headers: { "X-Custom-Header": "yes" },
    stats: { colors: true },

    // Set this as true if you want to access dev server from arbitrary url.
    // This is handy if you are using a html5 router.
    historyApiFallback: false,

    // Set this if you want webpack-dev-server to delegate a single path to an arbitrary server.
    // Use "*" to proxy all paths to the specified server.
    // This is useful if you want to get rid of 'http://localhost:8080/' in script[src],
    // and has many other use cases (see https://github.com/webpack/webpack-dev-server/pull/127 ).
    proxy: {
      "*": "http://localhost:9080"
    }
  });

  server.listen(8080, "localhost", function() {
    callback();
  });
});

gulp.task("spawn-harness", function() {
  // set some userPrefs if needed
  // Note: make sure you call encoded() after setting some userPrefs
  var fp = new FirefoxProfile(),
    browser;

  browser = wd.promiseChainRemote();

  // activate and open firebug by default for all sites
  fp.setPreference('extensions.firebug.allPagesActivation', 'on');
  // activate the console panel
  fp.setPreference('extensions.firebug.console.enableSites', true);
  // show the console panel
  fp.setPreference('extensions.firebug.defaultPanelName', 'console');
  fp.setPreference('extensions.firebug.showFirstRunPage', false);

  fp.setPreference("datareporting.healthreport.uploadEnabled", false);
  fp.setPreference("browser.rights.3.shown", true);

  // done with prefs?
  fp.updatePreferences();

  // you can install multiple extensions at the same time
  fp.addExtensions(['./harnessContent/firebug-2.0.9.xpi'], function() {
    fp.encoded(function (zippedProfile) {
      browser.init({
        browserName: 'firefox',
        firefox_profile: zippedProfile
      })
        .get('http://localhost:8080/index.html')
        .maximize()
        .setAsyncScriptTimeout(1000)
        .done();
    });
  });
});
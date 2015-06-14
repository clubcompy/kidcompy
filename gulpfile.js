"use strict";

/* jscs: disable */
var path = require("path"),
  gulp = require("gulp"),
  spawn = require("child_process").spawn,
  hostPlatform = require("os").platform(),
  karma = require("karma"),
  webpack = require("webpack"),
  WebpackDevServer = require("webpack-dev-server"),
  webpackStream = require("webpack-stream"),
  runSequence = require("run-sequence"),
  FirefoxProfile = require("firefox-profile"),
  wd = require("wd"),
  selenium = require("selenium-standalone"),
  finalHandler = require("finalhandler"),
  http = require("http"),
  serveStatic = require("serve-static"),
  named = require("vinyl-named"),
  configureWebpack = require("./configureWebpack"),

  moduleEntryPoints = [
    "./lib/Main.js"
  ],

  runningSelenium = null,
  runningHarnessBrowser = null;

gulp.task("default", [ "help" ], function() {
});

gulp.task("help", function() {
  console.log(" ");
  console.log("Gulp build script for Kidcompy");
  console.log("Copyright © Woldrich, Inc")
  console.log("==============================");
  console.log(" ");
  console.log("Gulp tasks:");
  console.log("  build               - Lint, run all tests, and build a production webpack bundle from sources");
  console.log("  dev                 - Run karma watcher for unit tests. Launch hot-reloading code harness page");
  console.log("  integration         - Run karma watcher for all tests w/ coverage. Launch hot-reloading code harness page");
  console.log(" ");
  console.log("Gulp support tasks:");
  console.log("  install-selenium    - Installs selenium. Run at least once prior to 'gulp dev' or 'gulp integration'");
  console.log("  unit-single         - Run unit tests once and then exit");
  console.log("  unit-watcher        - Run unit tests with a watcher");
  console.log("  integration-single  - Run all tests (unit, integration, and system) w/ coverage once and then exit");
  console.log("  integration-watcher - Run all tests (unit, integration, and system) w/ coverage with a watcher");
  console.log("  help                - This help text");
  console.log(" ");
});

gulp.task("build", function() {
  // webpack
  //  jshint and jscs
  //  karma;single on spec and integration tests
  //  build bundles
  //  generate jsdocs

  return runSequence([ "prebundle-checks"],
                     [ "bundle" ]);
});

gulp.task("prebundle-checks", function(done) {
  karma.server.start({
    configFile: __dirname + "/karma.prebundle.conf.js",
    singleRun: true,
    autoWatch: false
  }, done);
});

gulp.task("bundle", function() {
  return gulp.src(moduleEntryPoints)
    // vinyl-named endows each file in the src array with a webpack entry whose key is the filename sans extension
    .pipe(named())
    .pipe(webpackStream(configureWebpack({
      enableSourceMaps: true,
      isProductionBundle: true
    })), webpack)
    .pipe(gulp.dest("dist/"));
});

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

gulp.task("unit-single", function(done) {
  karma.server.start({
    configFile: __dirname + "/karma.unit.conf.js",
    singleRun: true,
    autoWatch: false
  }, done);
});

gulp.task("integration-single", function(done) {
  karma.server.start({
    configFile: __dirname + "/karma.integrationAndCoverage.conf.js",
    singleRun: true,
    autoWatch: false
  }, done);
});

gulp.task("unit-watcher", function(done) {
  karma.server.start({
    configFile: __dirname + "/karma.unit.conf.js",
    singleRun: false,
    autoWatch: true
  }, done);
});

gulp.task("integration-watcher", function(done) {
  karma.server.start({
    configFile: __dirname + "/karma.integrationAndCoverage.conf.js",
    singleRun: false,
    autoWatch: true
  }, done);
});

/* Try to gracefully shutdown the harness browser and selenium server if user hits ctrl-c because
   those things don't appear to happen automatically. */
gulp.task("force-termination-after-sigint", function() {
  function stopHarnessBrowser(onComplete) {
    var chainCompletion = function() {
      stopSeleniumServer(onComplete);
    };

    if(runningHarnessBrowser) {
      try {
        runningHarnessBrowser.quit(chainCompletion);
      }
      catch(e) {
        chainCompletion();
      }
      finally {
        runningHarnessBrowser = null;
      }
    }
    else {
      chainCompletion();
    }
  }

  function stopSeleniumServer(onComplete) {
    if(runningSelenium) {
      try {
        runningSelenium.kill();
      }
      catch(e) {
      }
      finally {
        runningSelenium = null;
      }
    }

    if(onComplete) {
      onComplete();
    }
  }

  function quitHandler(onComplete) {
    // windows does not give us any time to shutdown the harness browser, so we'll just leave it
    // running on that platform.  Sorry Windows devs!
    if(hostPlatform.indexOf("win") !== 0) {
      stopHarnessBrowser(onComplete);
    }
    else {
      stopSeleniumServer(onComplete);
    }
  }

  function sigintHandler() {
    quitHandler(function() {
      process.exit();
    });
  }

  process.on("quit", quitHandler);
  process.on("SIGINT", sigintHandler);
});

gulp.task("dev", function() {
  return runSequence([ "force-termination-after-sigint" ],
                     [ "start-selenium", "start-harness-content" ],
                     [ "start-harness-server" ],
                     [ "spawn-harness-browser", "unit-watcher" ]);
});

gulp.task("integration", function() {
  return runSequence([ "force-termination-after-sigint" ],
                     [ "start-selenium", "start-harness-content" ],
                     [ "start-harness-server" ],
                     [ "spawn-harness-browser", "integration-watcher" ]);
});

gulp.task("start-selenium", function() {
  runningSelenium = spawn("node", [ "./selenium-standalone", "start" ], {
    cwd: "./node_modules/selenium-standalone/bin",
    stdio: "ignore",
    detached: true
  });

  runningSelenium.on("close", function(code) {
    if(code) {
      console.log(" ");
      console.log(" ");
      console.log("    **************************************** README *****************************************");
      console.log("    *                                                                                       *");
      console.log("    * 'gulp start-selenium' failed.  If you haven't already, run 'gulp install-selenium' to *");
      console.log("    * download and install selenium for this project on this computer and try again.        *");
      console.log("    *                                                                                       *");
      console.log("    *****************************************************************************************");
      console.log(" ");
      console.log(" ");
    }

    process.quit();
  });
});

gulp.task("start-harness-content", function() {
  // Serve up harnessContent folder
  var serve = serveStatic("./harnessContent", { index: [ "index.html", "index.htm" ]}),

    // Create server
    server = http.createServer(function(req, res) {
      var done = finalHandler(req, res);

      serve(req, res, done);
    });

  // Listen
  server.listen(9080);
});

gulp.task("start-harness-server", function(callback) {
  var server = new WebpackDevServer(webpack({
    entry: {
      harness: [ "webpack/hot/dev-server" ].concat(moduleEntryPoints)
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
                  path.resolve(__dirname, "./node_modules")
        }
      ]
    },

    dist: {
      cache: false
    },

    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.ProvidePlugin({
        /* make lodash available to all modules */
        _: "lodash"
      })
    ]
  }), {
    // webpack-dev-server option
    // or: contentBase: "http://localhost/",
    contentBase: "./devBuild",

    // Enable special support for Hot Module Replacement
    // Page is no longer updated, but a "webpackHotUpdate" message is send to the content
    // Use "webpack/hot/dev-server" as additional module in your entry point
    // Note: this does _not_ add the `HotModuleReplacementPlugin` like the CLI option does.
    hot: true,

    // webpack-dev-middleware options
    quiet: false,
    noInfo: false,
    lazy: false,
    watchDelay: 100,
    publicPath: "/",
    stats: { colors: true },

    // Set this as true if you want to access dev server from arbitrary url.
    // This is handy if you are using a html5 router.
    historyApiFallback: false,

    // Set this if you want webpack-dev-server to delegate a single path to an arbitrary server.
    // Use "*" to proxy all paths to the specified server.
    // This is useful if you want to get rid of 'http://localhost:8080/' in script[src],
    // and has many other use cases (see https://github.com/webpack/webpack-dev-server/pull/127 ).
    proxy: {
      // port 9080 is the serve-static server that hosts the static harness content
      "*": "http://localhost:9080"
    }
  });

  server.listen(8080, "localhost", function() {
    callback();
  });
});

gulp.task("spawn-harness-browser", function() {
  // set some userPrefs if needed
  // Note: make sure you call encoded() after setting some userPrefs
  var fp = new FirefoxProfile(),
    browser = wd.promiseChainRemote();

  // activate the console, net, and script panels
  fp.setPreference("extensions.firebug.console.enableSites", true);
  fp.setPreference("extensions.firebug.alwaysShowCommandLine", true);
  fp.setPreference("extensions.firebug.script.enableSites", true);

  // activate and open firebug by default for all sites
  fp.setPreference("extensions.firebug.allPagesActivation", "on");

  // show the console panel
  fp.setPreference("extensions.firebug.defaultPanelName", "script");
  fp.setPreference("extensions.firebug.showFirstRunPage", false);
  fp.setPreference("extensions.firebug.delayLoad", false);

  fp.setPreference("datareporting.healthreport.service.firstRun", true);
  fp.setPreference("datareporting.healthreport.uploadEnabled", false);
  fp.setPreference("browser.rights.3.shown", true);

  // done with prefs?
  fp.updatePreferences();

  // you can install multiple extensions at the same time
  fp.addExtensions([ "./harnessContent/firebug-2.0.9.xpi" ], function() {
    fp.encoded(function(zippedProfile) {
      runningHarnessBrowser = browser.init({
        browserName: "firefox",
        firefox_profile: zippedProfile
      })
        .get("http://localhost:8080/index.html")
        .maximize()
        .setAsyncScriptTimeout(1000);
    });
  });
});

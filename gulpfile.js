"use strict";

// jscs:disable requireCamelCaseOrUpperCaseIdentifiers

var path = require("path"),
  closureCompiler = require("gulp-closure-compiler"),
  gulp = require("gulp"),
  jsonSass = require("gulp-json-sass"),
  rm = require("gulp-rm"),
  spawn = require("child_process").spawn,
  execFile = require("child_process").execFile,
  execFileSync = require("child_process").execFileSync,
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
  configureWebpack = require("./etc/configureWebpack"),
  sorcery = require("sorcery"),
  download = require("gulp-download"),
  unzip = require("gulp-unzip"),
  flatten = require("gulp-flatten"),
  minimatch = require("minimatch"),
  platformIsWindows = hostPlatform.indexOf("win") === 0,

  moduleEntryPoints = [
    path.resolve(__dirname, "./lib/Main.js")
  ],

  runningSelenium = null,
  runningHarnessBrowser = null,

  closureCompilerSourceList = [],
  closureCompilerOutputFile = "",
  closureCompilerSourceMap = "",
  closureCompilerOutputMap = "",
  finalInputOutputMap = {};

gulp.task("default", [ "help" ], function() {
});

gulp.task("help", function() {
  console.log(" ");
  console.log("Gulp build script for Kidcompy");
  console.log("Copyright © Woldrich, Inc");
  console.log("==============================");
  console.log(" ");
  console.log("Usage:");
  console.log(" ");
  console.log("  gulp <task_name>");
  console.log(" ");
  console.log("where <task_name> is one of the following -");
  console.log(" ");
  console.log("Main tasks:");
  console.log("  build               - Run all lints/tests/coverage, build production bundle and JSDocs to dist folder");
  console.log("  dev                 - Run karma watcher for unit tests. Launch hot-reloading code harness page");
  console.log("  integration         - Run karma watcher for all tests w/ coverage. Launch hot-reloading harness page");
  console.log("  jsdoc               - Builds public API and developer doc JSDocs to dist");
  console.log("  clean               - Deletes intermediate and dist folders");
  console.log(" ");
  console.log("Support tasks:");
  console.log("  install-prereqs     - Downloads binaries. Run at least once prior to 'gulp dev' or 'gulp integration'");
  console.log("  unit-single         - Run unit tests once and then exit");
  console.log("  unit-watcher        - Run unit tests with a watcher");
  console.log("  integration-single  - Run all tests (unit, integration, and system) w/ coverage once and then exit");
  console.log("  integration-watcher - Run all tests (unit, integration, and system) w/ coverage with a watcher");
  console.log("  jsdoc-public-api    - Builds JSDocs for all public symbols in the codebase, intended for library users");
  console.log("  jsdoc-dev-docs      - Builds JSDocs for all symbols in the codebase, internal use for library developers");
  console.log("  help                - This help text");
  console.log(" ");
});

gulp.task("build", function() {
  return runSequence(

    // run the integration test suite once before minification
    [ "production-mode-integration-single" ],

    // build a closure-compiled, minified test bundle with integration tests included
    // this should (hopefully) catch errors induced by closure-compiler's optimizations
    [ "test-bundle" ],
    [ "chdir-intermediate" ],
    [ "launch-closure-compiler" ],
    [ "chdir-up" ],
    [ "fixup-closure-compiler-source-map" ],

    // run karma against the test bundle in the production-like testing.js bundle
    [ "production-bundle-tests" ],

    // build the production bundle, minify it, and build jsdocs to dist folder
    [ "bundle" ],
    [ "chdir-intermediate" ],
    [ "launch-closure-compiler", "copy-artifacts-to-dist" ],
    [ "chdir-up" ],
    [ "fixup-closure-compiler-source-map", "jsdoc" ]
  );
});

gulp.task("clean", function() {
  return gulp.src([ "./intermediate/**/*", "./dist/**/*", "./intermediate", "./dist" ], { read: false })
    .pipe(rm());
});

gulp.task("test-bundle", [ "json-to-scss" ], function() {
  // intermediate folder files that will be the inputs and outputs for the closure compiler
  closureCompilerSourceList = [ "testing.js" ];
  closureCompilerOutputFile = "testing.closureCompiler.js";
  closureCompilerSourceMap = "testing.js|testing.js.map";
  closureCompilerOutputMap = "testing.closureCompiler.js.map";

  // map of closure compiled sources in intermediate folder to testing bundle files written to intermediate folder
  finalInputOutputMap = { "testing.closureCompiler.js": "./intermediate/testing.min.js" };

  return gulp.src(moduleEntryPoints.concat(["lib/**/*.spec.js", "lib/**/*.integration.js", "lib/**/*.system.js"]))
    .pipe(named())
    .pipe(webpackStream(configureWebpack({
      enableSourceMaps: true,
      outputPath: __dirname + "/intermediate",
      outputFilename: "testing.js",
      emitSingleChunk: true,
      isProductionBundle: true
    })), webpack)
    .pipe(gulp.dest("intermediate/"));
});

gulp.task("bundle", [ "json-to-scss" ], function() {
  // intermediate folder files that will be the inputs and outputs for the closure compiler
  closureCompilerSourceList = [ "Main.js" ];
  closureCompilerOutputFile = "Main.closureCompiler.js";
  closureCompilerSourceMap = "Main.js|Main.js.map";
  closureCompilerOutputMap = "Main.closureCompiler.js.map";

  // map of closure compiled sources in intermediate folder to final production bundle files written to dist folder
  finalInputOutputMap = { "Main.closureCompiler.js": "./dist/Main.min.js" };

  return gulp.src(moduleEntryPoints)
    .pipe(named()) // vinyl-named endows each file in the src array with a webpack entry whose key is the filename sans extension
    .pipe(webpackStream(configureWebpack({
      enableSourceMaps: true,
      isProductionBundle: true
    })), webpack)
    .pipe(gulp.dest("intermediate/"));
});

gulp.task("production-bundle-tests", function(done) {
  karma.server.start({
    configFile: __dirname + "/etc/karma.prodBundle.conf.js",
    singleRun: true,
    autoWatch: false
  }, done);
});

gulp.task("launch-closure-compiler", function() {
  // expects the gulp process' cwd to be run from the source/target folder
  return gulp.src(closureCompilerSourceList)
    .pipe(closureCompiler({
      compilerPath: path.resolve(__dirname, "./etc/closureCompiler/compiler.jar"),
      fileName: closureCompilerOutputFile,
      compilerFlags: {
        charset: "UTF-8",
        compilation_level: "ADVANCED_OPTIMIZATIONS",
        create_source_map: closureCompilerOutputMap,
        source_map_input: closureCompilerSourceMap,
        third_party: null,
        use_types_for_optimization: null,
        warning_level: "VERBOSE",
        output_wrapper: "%output%\n//# sourceMappingURL=" + closureCompilerOutputMap,
        externs: ["../lib/symbols/testing.externs.js"]
      }
    }))
    .pipe(gulp.dest("."));
});

gulp.task("fixup-closure-compiler-source-map", function() {
  var ccSource,
    chain;

  for(ccSource in finalInputOutputMap) {
    if(finalInputOutputMap.hasOwnProperty(ccSource)) {
      chain = sorcery.loadSync("./intermediate/" + ccSource, {
        includeContent: true
      });

      chain.writeSync(finalInputOutputMap[ccSource]);
    }
  }
});

gulp.task("install-prereqs", function() {
  return runSequence(
    [ "install-closure-compiler" ],
    [ "install-selenium" ]
  );
});

// variation of install-prereqs that also prints the help text, called automatically after npm install
gulp.task("post-npm-install-tasks", function() {
  return runSequence(
    [ "install-closure-compiler" ],
    [ "install-selenium" ],
    [ "help" ]
  );
});

gulp.task("install-selenium", function(done) {
  selenium.install({
    /**
     * Simple echo logger
     *
     * @param {*} message
     */
    logger: function(message) {
      console.log(message);
    }
  }, function(error) {
    if(error) {
      done(error);
    }
    else {
      done();
    }
  });
});

gulp.task("install-closure-compiler", function() {
  return download("http://dl.google.com/closure-compiler/compiler-latest.zip")
    .pipe(unzip({
      /**
       * filter all files from being unzipped except for the compiler jar
       *
       * @param {string} entry
       */
      filter: function(entry) {
        return minimatch(entry.path, "**/compiler.jar");
      }
    }))
    .pipe(flatten())
    .pipe(gulp.dest("./etc/closureCompiler"));
});

gulp.task("unit-single", [ "json-to-scss" ], function(done) {
  karma.server.start({
    configFile: __dirname + "/etc/karma.unit.conf.js",
    singleRun: true,
    autoWatch: false
  }, done);
});

gulp.task("production-mode-integration-single", [ "json-to-scss" ], function(done) {
  karma.server.start({
    configFile: __dirname + "/etc/karma.prodIntegrationAndCoverage.conf.js",
    singleRun: true,
    autoWatch: false
  }, done);
});

gulp.task("integration-single", [ "json-to-scss" ], function(done) {
  karma.server.start({
    configFile: __dirname + "/etc/karma.integrationAndCoverage.conf.js",
    singleRun: true,
    autoWatch: false
  }, done);
});

gulp.task("unit-watcher", [ "json-to-scss" ], function(done) {
  karma.server.start({
    configFile: __dirname + "/etc/karma.unit.conf.js",
    singleRun: false,
    autoWatch: true
  }, done);
});

gulp.task("integration-watcher", [ "json-to-scss" ], function(done) {
  karma.server.start({
    configFile: __dirname + "/etc/karma.integrationAndCoverage.conf.js",
    singleRun: false,
    autoWatch: true
  }, done);
});

/* Try to gracefully shutdown the harness browser and selenium server if user hits ctrl-c because
   those things don't appear to happen automatically. */
gulp.task("force-termination-after-sigint", function() {
  /**
   * Shutdown the harness browser
   *
   * @param {Function} onComplete
   */
  function stopHarnessBrowser(onComplete) {
    /**
     * Stop the selenium server after the browser close is complete
     */
    function chainCompletion() {
      stopSeleniumServer(onComplete);
    }

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

  /**
   * Kills the selenium server and calls the onComplete callback when that is through
   *
   * @param {Function} onComplete
   */
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

  /**
   * Closes the harness browser and selenium server on non-windows hosts and only kills the selenium server on windows
   *
   * @param {Function} onComplete
   */
  function quitHandler(onComplete) {
    // windows does not give us any grace period during SIGINT to shutdown the harness browser before hard killing
    // our parent process, so we'll just leave the harness browser running on that platform.  Sorry Windows devs!
    if(platformIsWindows) {
      stopSeleniumServer(onComplete);
    }
    else {
      stopHarnessBrowser(onComplete);
    }
  }

  /**
   * Callback called when user hits ctrl-c on the gulp process
   */
  function sigintHandler() {
    quitHandler(function() {
      process.exit();
    });
  }

  process.on("quit", quitHandler);
  process.on("SIGINT", sigintHandler);
});

gulp.task("dev", function() {
  return runSequence(
    [ "force-termination-after-sigint" ],
    [ "start-selenium", "start-harness-content" ],
    [ "start-harness-server" ],
    [ "spawn-harness-browser", "unit-watcher" ]
  );
});

gulp.task("integration", function() {
  return runSequence(
    [ "force-termination-after-sigint" ],
    [ "start-selenium", "start-harness-content" ],
    [ "start-harness-server" ],
    [ "spawn-harness-browser", "integration-watcher" ]
  );
});

gulp.task("start-selenium", function() {
  runningSelenium = spawn("node", [ "./selenium-standalone", "start", "-timeout", 0x7fffffff ], {
    cwd: "./node_modules/selenium-standalone/bin",
    stdio: "ignore",
    detached: true
  });

  runningSelenium.on("close", function(code) {
    if(code) {
      console.log(" ");
      console.log(" ");
      console.log("    **************************************** README ****************************************");
      console.log("    *                                                                                      *");
      console.log("    * 'gulp start-selenium' failed.  This could be a legit failure or it could be that     *");
      console.log("    * selenium hasn't been installed.  If you haven't already, run 'gulp install-selenium' *");
      console.log("    * to download and install selenium for this project on this computer and try again.    *");
      console.log("    *                                                                                      *");
      console.log("    ****************************************************************************************");
      console.log(" ");
      console.log(" ");
    }

    if(typeof process.quit === "function") {
      process.quit();
    }
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

gulp.task("start-harness-server", [ "json-to-scss" ], function(callback) {
  var currentGitUser,
    server;

  try {
    currentGitUser = execFileSync("git", [ "config", "user.name" ]).toString("utf-8").trim();
  }
  catch(e) {
    console.log("Was unable to determine the current git user.name");
  }

  server = new WebpackDevServer(
    webpack(
      configureWebpack({
        moduleEntryPoints: moduleEntryPoints,
        outputModuleName: "harness",
        outputPath: path.resolve(__dirname, "./intermediate"),
        outputFilename: "[name].js",
        outputChunkFilename: "[id].js",
        enableSourceMaps: true,
        isRunningTests: false,
        isLintingCode: false,
        isGeneratingCoverage: false,
        isProductionBundle: false,
        isHotReloading: true
      })
    ),
    {
      // webpack-dev-server option
      // or: contentBase: "http://localhost/",
      contentBase: "./intermediate",

      // Enable special support for Hot Module Replacement
      // Page is no longer updated, but a "webpackHotUpdate" message is send to the content
      // Use "webpack/hot/dev-server" as additional module in your entry point
      // Note: this does _not_ add the `HotModuleReplacementPlugin` like the CLI option does.
      hot: true,

      // webpack-dev-middleware options
      quiet: false,
      noInfo: false,
      lazy: false,
      watchOptions: {
        aggregateTimeout: 100
      },
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
    }
  );

  server.listen(8080, "localhost", function() {
    callback();
  });
});

gulp.task("spawn-harness-browser", function() {
  // set some userPrefs if needed
  // Note: make sure you call encoded() after setting some userPrefs
  var fp = new FirefoxProfile(),
    browser = wd.promiseChainRemote();

  fp.setPreference("devtools.cache.disabled", true);
  fp.setPreference("devtools.appmanager.enabled", true);
  fp.setPreference("devtools.toolbox.selectedTool", "jsdebugger");
  fp.setPreference("devtools.debugger.enabled", true);
  fp.setPreference("devtools.debugger.chrome-enabled", true);
  fp.setPreference("devtools.netmonitor.enabled", true);
  fp.setPreference("devtools.inspector.enabled", true);
  fp.setPreference("devtools.toolbar.enabled", true);

  fp.setPreference("datareporting.healthreport.service.firstRun", true);
  fp.setPreference("datareporting.healthreport.uploadEnabled", false);
  fp.setPreference("browser.rights.3.shown", true);

  // done with prefs?
  fp.updatePreferences();

  // you can install multiple extensions at the same time
  fp.addExtensions([ ], function() {
    fp.encoded(function(zippedProfile) {
      runningHarnessBrowser =
        browser.init({
          browserName: "firefox",
          firefox_profile: zippedProfile
        })
        .get("http://localhost:8080/index.html")
        .maximize()
        .setAsyncScriptTimeout(1000);
    });
  });
});

/**
 * @param {Array.<string>} srcGlobPatterns
 * @param {Array.<string>} params in-order list of command line params to send to jsdoc.
 *        See http://usejsdoc.org/about-commandline.html for valid params
 * @param {Function} callback completion callback
 */
function callJsdoc(srcGlobPatterns, params, callback) {
  var srcFiles = gulp.src(srcGlobPatterns),
    fileList = [];

  srcFiles.on("readable", function() {
    var vinylFile;

    while((vinylFile = srcFiles.read()) !== null) {
      fileList.push(vinylFile.path);
    }
  }).on("end", function() {
    execFile("./node_modules/.bin/jsdoc" + (platformIsWindows ? ".cmd" : ""), [].concat(params).concat(fileList), {
      stdio: "inherit"
    }, function(error) {
      if(error) {
        console.log(error);
      }

      callback();
    });
  });
}

gulp.task("jsdoc", function() {
  return runSequence(
    [ "jsdoc-public-api", "jsdoc-dev-docs" ]
  );
});

gulp.task("jsdoc-public-api", function(done) {
  callJsdoc([ "./lib/**/*.js", "!./lib/**/*.spec.js", "!./lib/**/*.integration.js", "!./lib/**/*.system.js",
      "!./lib/symbols/testing.externs.js", "!./lib/featureFlags.js", "README.md" ],
    [
      "--access", "public,undefined",
      "--configure", path.resolve(__dirname, "./etc/jsdoc.conf.json"),
      "--destination", path.resolve(__dirname, "./dist/public-api"),
      "--template", path.resolve(__dirname, "./node_modules/ink-docstrap/template"),
      "--verbose"
    ],
    done);
});

gulp.task("jsdoc-dev-docs", function(done) {
  callJsdoc([ "./lib/**/*.js", "!./lib/**/*.spec.js", "!./lib/**/*.integration.js", "!./lib/**/*.system.js",
      "!./lib/symbols/testing.externs.js", "README.md" ],
    [
      "--access", "all",
      "--private",
      "--configure", path.resolve(__dirname, "./etc/jsdoc.conf.json"),
      "--destination", path.resolve(__dirname, "./dist/developer-docs"),
      "--template", path.resolve(__dirname, "./node_modules/ink-docstrap/template"),
      "--verbose"
    ],
    done);
});

gulp.task("json-to-scss", function() {
  return gulp
    .src("./lib/styles/styleVars.json")
    .pipe(jsonSass({
      sass: false
    }))
    .pipe(gulp.dest("./lib/styles"));
});

gulp.task("copy-artifacts-to-dist", function() {
  return gulp.src([
    "**/*",
    "!*.js",
    "!*.map"
  ]).pipe(gulp.dest("../dist"));
});

gulp.task("chdir-intermediate", function() {
  process.chdir("intermediate");
});

gulp.task("chdir-up", function() {
  process.chdir("..");
});


"use strict";

/* jscs: disable */
var path = require("path"),
  closureCompiler = require("gulp-closure-compiler"),
  gulp = require("gulp"),
  jsonSass = require("gulp-json-sass"),
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
  configureWebpack = require("./configureWebpack"),
  sorcery = require("sorcery"),
  download = require("gulp-download"),
  unzip = require("gulp-unzip"),
  flatten = require("gulp-flatten"),
  minimatch = require("minimatch"),
  platformIsWindows = hostPlatform.indexOf("win") === 0,

  moduleEntryPoints = [
    "./lib/Main.js"
  ],

  runningSelenium = null,
  runningHarnessBrowser = null,

  projectName = "kidcompy",
  projectDescription = "The kidcompy module reveals a fun-loving character that lives at the heart of every computer";

gulp.task("default", [ "help" ], function() {
});

gulp.task("help", function() {
  console.log(" ");
  console.log("Gulp build script for Kidcompy");
  console.log("Copyright © Woldrich, Inc");
  console.log("==============================");
  console.log(" ");
  console.log("Gulp tasks:");
  console.log("  build               - Lint, run all tests, build a production bundle from sources, and build JSDocs");
  console.log("  dev                 - Run karma watcher for unit tests. Launch hot-reloading code harness page");
  console.log("  integration         - Run karma watcher for all tests w/ coverage. Launch hot-reloading code harness page");
  console.log("  jsdoc               - Builds public API and developer doc JSDocs");
  console.log(" ");
  console.log("Gulp support tasks:");
  console.log("  install-selenium    - Installs selenium. Run at least once prior to 'gulp dev' or 'gulp integration'");
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
  // webpack
  //  jshint and jscs
  //  karma;single on spec and integration tests
  //  build bundles
  //  generate jsdocs

  return runSequence(
    [ "prebundle-checks", "json-to-scss" ],
    [ "bundle", "jsdoc" ],
    [ "make-dist" ]
  );
});

gulp.task("prebundle-checks", function(done) {
  karma.server.start({
    configFile: __dirname + "/karma.prebundle.conf.js",
    singleRun: true,
    autoWatch: false
  }, done);
});

gulp.task("json-to-scss", function() {
  return gulp
    .src("./lib/styles/styleVars.json")
    .pipe(jsonSass({
      sass: false
    }))
    .pipe(gulp.dest("./lib/styles"));
});

gulp.task("bundle", function() {
  return gulp.src(moduleEntryPoints)
    // vinyl-named endows each file in the src array with a webpack entry whose key is the filename sans extension
    .pipe(named())
    .pipe(webpackStream(configureWebpack({
      enableSourceMaps: true,
      isProductionBundle: true
    })), webpack)
    .pipe(gulp.dest("intermediate/"));
});

gulp.task("copy-artifacts-to-dist", function() {
  return gulp.src([
    "**/*",
    "!*.js",
    "!*.map"
  ]).pipe(gulp.dest("../dist"));
});

gulp.task("make-dist", function() {
  return runSequence(
    [ "chdir-intermediate" ],
    [ "launch-closure-compiler", "copy-artifacts-to-dist" ],
    [ "chdir-up" ],
    [ "fixup-closure-compiler-source-map" ]
  );
});

gulp.task("chdir-intermediate", function() {
  process.chdir("intermediate");
});

gulp.task("chdir-up", function() {
  process.chdir("..");
});

gulp.task("launch-closure-compiler", function() {
  // expects the gulp process' cwd to be run from the source/target folder
  return gulp.src(['Main.js'])
    .pipe(closureCompiler({
      compilerPath: __dirname + '/bin/compiler.jar',
      fileName: 'Main.closureCompiler.js',
      compilerFlags: {
        charset: "UTF-8",
        compilation_level: 'ADVANCED_OPTIMIZATIONS',
        create_source_map: 'Main.closureCompiler.js.map',
        source_map_input: 'Main.js|Main.js.map',
        third_party: null,
        use_types_for_optimization: null,
        warning_level: 'VERBOSE',
        output_wrapper: "%output%\n//# sourceMappingURL=Main.closureCompiler.js.map"
      }
    }))
    .pipe(gulp.dest('.'));
});

gulp.task("fixup-closure-compiler-source-map", function() {
  var chain = sorcery.loadSync("./intermediate/Main.closureCompiler.js", {
    includeContent: true
  });

  chain.writeSync("./dist/Main.min.js");
});

gulp.task("install-prereqs", function() {
  return runSequence(
    [ "install-selenium", "install-closure-compiler" ]
  );
});

gulp.task("install-selenium", function(done) {
  selenium.install({
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
      filter : function(entry){
        return minimatch(entry.path, "**/compiler.jar");
      }
    }))
    .pipe(flatten())
    .pipe(gulp.dest("./bin"));
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
    // windows does not give us any grace period during SIGINT to shutdown the harness browser before hard killing
    // our parent process, so we'll just leave the harness browser running on that platform.  Sorry Windows devs!
    if(platformIsWindows) {
      stopSeleniumServer(onComplete);
    }
    else {
      stopHarnessBrowser(onComplete);
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

gulp.task("start-harness-server", function(callback) {
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
        outputPath: __dirname + "/intermediate",
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

  // activate the console, net, and script panels
//  fp.setPreference("extensions.firebug.console.enableSites", true);
//  fp.setPreference("extensions.firebug.alwaysShowCommandLine", true);
//  fp.setPreference("extensions.firebug.script.enableSites", true);

  // activate and open firebug by default for all sites
//  fp.setPreference("extensions.firebug.allPagesActivation", "on");

  // show the console panel
//  fp.setPreference("extensions.firebug.defaultPanelName", "script");
//  fp.setPreference("extensions.firebug.showFirstRunPage", false);
//  fp.setPreference("extensions.firebug.delayLoad", false);

  fp.setPreference("datareporting.healthreport.service.firstRun", true);
  fp.setPreference("datareporting.healthreport.uploadEnabled", false);
  fp.setPreference("browser.rights.3.shown", true);

  // done with prefs?
  fp.updatePreferences();

  // you can install multiple extensions at the same time
  fp.addExtensions([ /* "./harnessContent/firebug-2.0.9.xpi" */ ], function() {
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
 * @param {Array.<String>} srcGlobPatterns
 * @param {Array.<String>} params in-order list of command line params to send to jsdoc.
 *        See http://usejsdoc.org/about-commandline.html for valid params
 * @param {function} callback completion callback
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
              "README.md" ],
    [
      "--access", "public,undefined",
      "--configure", __dirname + "/jsdoc.conf.json",
      "--destination", __dirname + "/dist/public-api",
      "--template", __dirname + "/node_modules/ink-docstrap/template",
      "--verbose"
    ],
    done);
});

gulp.task("jsdoc-dev-docs", function(done) {
  callJsdoc([ "./lib/**/*.js", "!./lib/**/*.spec.js", "!./lib/**/*.integration.js", "!./lib/**/*.system.js",
      "README.md" ],
    [
      "--access", "all",
      "--private",
      "--configure", __dirname + "/jsdoc.conf.json",
      "--destination", __dirname + "/dist/developer-docs",
      "--template", __dirname + "/node_modules/ink-docstrap/template",
      "--verbose"
    ],
    done);
});

"use strict";

// jscs:disable requireCamelCaseOrUpperCaseIdentifiers

var path = require("path"),
  fs = require("fs"),
  gulp = require("gulp"),
  URI = require("URIjs"),
  jsonSass = require("gulp-json-sass"),
  rm = require("gulp-rm"),
  spawn = require("child_process").spawn,
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
  configureClosureCompiler = require("./etc/configureClosureCompiler"),
  sorcery = require("sorcery"),
  download = require("gulp-download"),
  unzip = require("gulp-unzip"),
  flatten = require("gulp-flatten"),
  minimatch = require("minimatch"),
  platformIsWindows = hostPlatform.indexOf("win") === 0,
  uglifyJs = require("uglify-js"),
  computeDefinedConstants = require("./etc/computeDefinedConstants"),

  runningSelenium = null,
  runningHarnessBrowser = null,

  closureCompilerConfig = {},
  finalInputOutputMap = {},
  gulpFolder = "" + __dirname;

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

gulp.task("build", function(done) {
  return runSequence(

    // run the integration test suite with production mode once before minification as a quick check to verify
    // that the production build passes all tests
    [ "production-mode-integration-single" ],

    // build out mocha test-rigged versions of the production bundles for bootstrapper, iePolyfill, html5Polyfill, and
    // the main kidcompy modules
    [ "bootstrap-testing-production-bundle", "ie-polyfill-production-bundle" ],
    [ "html5-polyfill-production-bundle" ],
    [ "kidcompy-testing-production-bundle" ],

    // run the production bundle tests in the browser via karma
    [ "production-bundle-tests" ],

    // build the non-testing versions of bootstrap and kidcompy bundles and jsdocs
    [ "bootstrap-production-bundle", "kidcompy-production-bundle", "jsdoc" ],

    done
  );
});

gulp.task("closure-compiler", function(done) {
  return runSequence(
    [ "chdir-intermediate" ],
    [ "launch-closure-compiler" ],
    [ "minify-closure-compiler-output" ],
    [ "chdir-gulp-folder" ],
    done
  );
});

gulp.task("launch-closure-compiler", function(done) {
  var i, ii,
    paramName,
    paramValue,
    params = [
      "-server",
      "-XX:+TieredCompilation",
      "-XX:+UseParallelGC",
      "-jar",
      closureCompilerConfig.compilerPath
    ];

  for(paramName in closureCompilerConfig.compilerFlags) {
    if(closureCompilerConfig.compilerFlags.hasOwnProperty(paramName)) {
      paramValue = closureCompilerConfig.compilerFlags[paramName];

      if(paramValue === null) {
        params.push("--" + paramName);
      }
      else if(Object.prototype.toString.call(paramValue) === "[object Array]") {
        for(i = 0, ii = paramValue.length; i < ii; i++) {
          params.push("--" + paramName);
          params.push(paramValue[i]);
        }
      }
      else {
        params.push("--" + paramName);
        params.push(paramValue);
      }
    }
  }

  // source files
  for(i = 0, ii = closureCompilerConfig.sourceFiles.length; i < ii; i++) {
    params.push("--js");
    params.push(closureCompilerConfig.sourceFiles[i]);
  }

  // output file
  params.push("--js_output_file");
  params.push(closureCompilerConfig.fileName);

  // async spawn java with params
  spawn("java", params, { stdio: "inherit" }).on("close", function(code) {
    if(code) {
      console.log("Error: " + code);
    }

    done();
  });
});

/* Closure Compiler doesn't have a convenient way to declare global constants that its
 * CommonJS support can grok.  That leads us to declare any feature flags or global constants
 * as externs in Closure Compiler - this made those symbols appear as
 */
gulp.task("minify-closure-compiler-output", function() {
  try {
    var result = uglifyJs.minify(closureCompilerConfig.fileName, {
      inSourceMap: closureCompilerConfig.fileName + ".map",
      outSourceMap: closureCompilerConfig.minifiedFileName + ".map",
      mangle: false,
      output: {
        screw_ie8: false,
        comments: true,
        max_line_len: 3999
      },
      compress: {
        side_effects: false,
        global_defs: computeDefinedConstants({isProductionBundle: true, areBundlesSplit: true})
      }
    });

    fs.writeFileSync(closureCompilerConfig.minifiedFileName, result.code);
    fs.writeFileSync(closureCompilerConfig.minifiedFileName + ".map", result.map);
  }
  catch(e) {
    console.log(JSON.stringify(e, null, " "));
  }
});

gulp.task("del-files", function() {
  return gulp.src([ "./intermediate/**/*", "./dist/**/*", "./lib/constantExterns.js" ])
    .pipe(rm());
});

gulp.task("del-folders", function() {
  return gulp.src([ "./intermediate", "./dist" ])
    .pipe(rm());
});

gulp.task("clean", function(done) {
  return runSequence(
    [ "del-files" ],
    [ "del-folders" ],
    done
  );
});

gulp.task("bootstrap-testing-production-bundle", [ "json-to-scss" ], function() {
  return gulp.src([ "./lib/bootstrap/testingMain.js" ])
    .pipe(named()) // vinyl-named endows each file in the src array with a webpack entry whose key is the filename sans extension
    .pipe(webpackStream(configureWebpack({
      enableSourceMaps: true,
      isProductionBundle: true,
      areBundlesSplit: true,
      outputFilename: "bootstrap.min.js"
    })), webpack)
    .pipe(gulp.dest("intermediate/"));
});

gulp.task("bootstrap-production-bundle", [ "json-to-scss" ], function() {
  return gulp.src([ "./lib/bootstrap/main.js" ])
    .pipe(named()) // vinyl-named endows each file in the src array with a webpack entry whose key is the filename sans extension
    .pipe(webpackStream(configureWebpack({
      enableSourceMaps: true,
      isProductionBundle: true,
      areBundlesSplit: true,
      outputFilename: "bootstrap.min.js"
    })), webpack)
    .pipe(gulp.dest("intermediate/"));
});

gulp.task("ie-polyfill-production-bundle", function(done) {
  return runSequence(
    [ "ie-polyfill-cc-config" ],
    [ "closure-compiler" ],
    done
  );
});

gulp.task("ie-polyfill-cc-config", function(done) {
  resolveGlobs(["./lib/iePolyfill/main.js", "./lib/iePolyfill/**/*.js", "./lib/symbols/**/*.js"], function(srcFiles) {
    closureCompilerConfig = configureClosureCompiler({
      isProductionBundle: true,
      areBundlesSplit: true,
      sourceFiles: srcFiles,
      sourceFolder: "./lib/iePolyfill",
      targetFolder: "intermediate",
      outputFile: "iePolyfill.closureCompiler.js",
      minifiedFile: "iePolyfill.min.js"
    });

    done();
  });
});

gulp.task("html5-polyfill-production-bundle", function(done) {
  return runSequence(
    [ "html5-polyfill-cc-config" ],
    [ "closure-compiler" ],
    done
  );
});

gulp.task("html5-polyfill-cc-config", function(done) {
  resolveGlobs(["./lib/html5Polyfill/main.js", "./lib/html5Polyfill/**/*.js", "./lib/symbols/**/*.js"], function(srcFiles) {
    closureCompilerConfig = configureClosureCompiler({
      isProductionBundle: true,
      areBundlesSplit: true,
      sourceFiles: srcFiles,
      sourceFolder: "./lib/html5Polyfill",
      targetFolder: "intermediate",
      outputFile: "html5Polyfill.closureCompiler.js",
      minifiedFile: "html5Polyfill.min.js"
    });

    done();
  });
});

gulp.task("kidcompy-testing-production-bundle", function(done) {
  return runSequence(
    [ "kidcompy-testing-cc-config" ],
    [ "closure-compiler" ],
    done
  );
});

gulp.task("kidcompy-testing-cc-config", function(done) {
  resolveGlobs(["./lib/kidcompy/main.js", "./lib/kidcompy/**/*.js", "./lib/symbols/**/*.js"], function(srcFiles) {
    closureCompilerConfig = configureClosureCompiler({
      isProductionBundle: true,
      areBundlesSplit: true,
      sourceFiles: srcFiles,
      sourceFolder: "./lib/kidcompy",
      targetFolder: "intermediate",
      outputFile: "kidcompy.closureCompiler.js",
      minifiedFile: "kidcompy.min.js"
    });

    done();
  });
});

gulp.task("kidcompy-production-bundle", function(done) {
  return runSequence(
    [ "kidcompy-cc-config" ],
    [ "closure-compiler" ],
    done
  );
});

gulp.task("kidcompy-cc-config", function(done) {
  resolveGlobs(["./lib/kidcompy/main.js", "./lib/kidcompy/**/*.js", "./lib/symbols/**/*.js",
                "!./lib/**/*.spec.js", "!./lib/**/*.integration.js", "!./lib/**/*.system.js"], function(srcFiles) {
    closureCompilerConfig = configureClosureCompiler({
      isProductionBundle: true,
      areBundlesSplit: true,
      sourceFiles: srcFiles,
      sourceFolder: "./lib/kidcompy",
      targetFolder: "intermediate",
      outputFile: "kidcompy.closureCompiler.js",
      minifiedFile: "kidcompy.min.js"
    });

    done();
  });
});

gulp.task("production-bundle-tests", function(done) {
  karma.server.start({
    configFile: __dirname + "/etc/karma.prodBundle.conf.js",
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

gulp.task("unit-single", [ "json-to-scss" ], function(done) {
  karma.server.start({
    configFile: __dirname + "/etc/karma.unit.conf.js",
    singleRun: true,
    autoWatch: false
  }, done);
});

gulp.task("integration-watcher", [ "json-to-scss" ], function(done) {
  karma.server.start({
    configFile: __dirname + "/etc/karma.integrationAndCoverage.conf.js",
    singleRun: false,
    autoWatch: true
  }, done);
});

gulp.task("integration-single", [ "json-to-scss" ], function(done) {
  karma.server.start({
    configFile: __dirname + "/etc/karma.integrationAndCoverage.conf.js",
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

gulp.task("dev", function(done) {
  return runSequence(
    [ "force-termination-after-sigint" ],
    [ "start-selenium", "start-harness-content" ],
    [ "start-harness-server" ],
    [ "spawn-harness-browser", "unit-watcher" ],
    done
  );
});

gulp.task("integration", function(done) {
  return runSequence(
    [ "force-termination-after-sigint" ],
    [ "start-selenium", "start-harness-content" ],
    [ "start-harness-server" ],
    [ "spawn-harness-browser", "integration-watcher" ],
    done
  );
});

gulp.task("production-harness", function(done) {
  return runSequence(
    [ "build" ],
    [ "force-termination-after-sigint" ],
    [ "start-selenium", "start-production-harness-content" ],
    [ "spawn-harness-browser" ],
    done
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
      console.log("Exited with code: " + code);
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

gulp.task("start-production-harness-content", function() {
  // Serve up harnessContent folder
  var serveHarnessContent = serveStatic("./harnessContent", { index: [ "index.html", "index.htm" ]}),
    serveHarnessScripts = serveStatic("./intermediate", { index: [ "index.html", "index.htm" ]}),
    server;

  // Create server
  server = http.createServer(function(req, res) {
    var requestUrl = new URI(req.url),
      done = finalHandler(req, res);

    if(requestUrl.filename().endsWith(".js")) {
      res.setHeader("Expires", new Date(0));

      // redirect harness.js to the bootstrap.min.js file
      if(requestUrl.filename() === "harness.js") {
        res.writeHead(301, {
          "location": requestUrl.directory() + "/bootstrap.min.js"
        });
        res.end();
      }
      else {
        serveHarnessScripts(req, res, done);
      }

      return;
    }

    serveHarnessContent(req, res, done);
  });

  // Listen
  server.listen(8080);
});

gulp.task("start-harness-server", [ "json-to-scss" ], function(callback) {
  var currentGitUser,
    server;

  try {
    currentGitUser = execFileSync("git", [ "config", "user.name" ]).toString("utf-8").trim();
  }
  catch(er) {
    console.log("Was unable to determine the current git user.name: " + er);
  }

  server = new WebpackDevServer(
    webpack(
      configureWebpack({
        moduleEntryPoints: [
          path.resolve(__dirname, "./lib/bootstrap/main.js")
        ],
        outputModuleName: "harness",
        outputPath: path.resolve(__dirname, "./intermediate"),
        outputFilename: "[name].js",
        outputChunkFilename: "[id].js",
        enableSourceMaps: true,
        isRunningTests: false,
        isLintingCode: false,
        isGeneratingCoverage: false,
        isProductionBundle: false,
        areBundlesSplit: false,
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
    var jsdocCommand = "./node_modules/.bin/jsdoc",
      ps;

    if(platformIsWindows) {
      jsdocCommand += ".cmd";
    }

    ps = spawn(path.resolve(__dirname, jsdocCommand), [].concat(params).concat(fileList), {
      stdio: "inherit"
    });

    ps.on("close", function(code) {
      if(code !== 0) {
        console.log("jsdoc exited with code: " + code);
      }

      callback();
    });
  });
}

gulp.task("jsdoc", function(done) {
  return runSequence(
    [ "jsdoc-public-api", "jsdoc-dev-docs" ],
    done
  );
});

gulp.task("jsdoc-public-api", function(done) {
  callJsdoc([ "./lib/**/*.js", "!./lib/**/*.spec.js", "!./lib/**/*.integration.js", "!./lib/**/*.system.js",
      "!./lib/testingExterns.js", "!./lib/constantExterns.js", "!./lib/featureFlags.js", "README.md" ],
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
      "!./lib/symbols/testingExterns.js", "README.md" ],
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
  if(!fs.existsSync("intermediate")) {
    fs.mkdirSync("intermediate");
  }

  process.chdir("intermediate");
});

gulp.task("chdir-up", function() {
  process.chdir("..");
});

gulp.task("chdir-gulp-folder", function() {
  process.chdir(gulpFolder);
});

/**
 * resolve glob patterns to absolute files, dupes are removed
 *
 * @param {Array.<string>} globs
 * @param {function(Array.<string>)} done callback called with resolved globFiles with dupes removed
 */
function resolveGlobs(globs, done) {
  var globFiles = [],
    srcFiles = gulp.src(globs);

  srcFiles.on("readable", function() {
    var vinylFile;

    while((vinylFile = srcFiles.read()) !== null) {
      if(globFiles.indexOf(vinylFile) < 0) {
        globFiles.push(vinylFile.path);
      }
    }
  }).on("end", function() {
    done(globFiles);
  });
}

gulp.task("install-prereqs", function(done) {
  return runSequence(
    [ "install-closure-compiler" ],
    [ "install-closure-library" ],
    [ "install-selenium" ],
    done
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

gulp.task("install-closure-library", function() {
  return download("https://github.com/google/closure-library/archive/master.zip")
    .pipe(unzip({
      /**
       * filter all files from being unzipped except for the closure library sources
       *
       * @param {string} entry
       */
      filter: function(entry) {
        return minimatch(entry.path, "closure-library-master/closure/**/*");
      }
    }))
    .pipe(gulp.dest("./etc/closureCompiler"));
});

// is this unused?  safe to delete?
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


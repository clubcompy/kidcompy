/*
 Kidcompy - a virtual computer for kids
 Copyright (C) 2015  Woldrich, Inc.

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";

// jscs:disable requireCamelCaseOrUpperCaseIdentifiers

var path = require("path"),
  fs = require("fs"),
  gulp = require("gulp"),
  hostPlatform = require("os").platform(),
  runSequence = require("run-sequence"),
  finalHandler = require("finalhandler"),
  http = require("http"),
  named = require("vinyl-named"),
  configureClosureCompiler = require("./etc/configureClosureCompiler"),
  sorcery = require("sorcery"),
  unzip = require("gulp-unzip"),
  flatten = require("gulp-flatten"),
  minimatch = require("minimatch"),
  platformIsWindows = hostPlatform.indexOf("win") === 0,
  uglifyJs = require("uglify-js"),
  computeDefinedConstants = require("./etc/computeDefinedConstants"),
  readline = require("readline"),

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
  console.log("  production-harness  - Run build task. Launch a static harness page with the production bundle");
  console.log("  jsdoc               - Builds public API and developer doc JSDocs to dist");
  console.log("  clean               - Deletes intermediate and dist folders");
  console.log(" ");
  console.log("Support tasks:");
  console.log("  install-prereqs     - Downloads binaries. Run at least once prior to dev, integration or build tasks.");
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

    // build the non-testing versions of bootstrap and kidcompy bundles
    [ "bootstrap-production-bundle", "kidcompy-production-bundle" ],

    // copy final scripts and stylesheets to dist and build jsdoc's to dist
    [ "copy-dist-artifacts", "jsdoc" ],

    done
  );
});

gulp.task("dev", function(done) {
  return runSequence(
    [ "start-harness-content" ],
    [ "start-harness-server" ],
    [ "spawn-harness-browser", "unit-watcher" ],
    done
  );
});

gulp.task("integration", function(done) {
  return runSequence(
    [ "start-harness-content" ],
    [ "start-harness-server" ],
    [ "spawn-harness-browser", "integration-watcher" ],
    done
  );
});

gulp.task("production-harness", function(done) {
  return runSequence(
    [ "build" ],
    [ "start-production-harness-content" ],
    [ "spawn-harness-browser" ],
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
  var spawn = require("child_process").spawn,
    execFileSync = require("child_process").execFileSync,
    tmp = require("tmp"),
    i, ii,
    paramName,
    paramValue,
    params = [],
    ccProcess,
    skipLinesUntilCaret = false,
    skipNextBlankLine = false;

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

  // print the version of the Closure Compiler we're running with
  console.log(execFileSync("java", ["-jar", closureCompilerConfig.compilerPath, "--version"]).toString("utf-8"));

  // build a response file from the passed params
  var responseFileName = tmp.tmpNameSync({ template: closureCompilerConfig.targetFolder + '/closureCompiler-XXXXXX' });
  fs.writeFileSync(responseFileName, params.join("\n").replace(/\\/g, "/"));

  // async spawn java with params we wrote to the response file
  ccProcess = spawn("java", [
    "-server",
    "-XX:+TieredCompilation",
    "-XX:+UseParallelGC",
    "-jar",
    closureCompilerConfig.compilerPath,
    "--flagfile",
    responseFileName
  ]);

  /**
   * print text that isn't warnings we don't care about
   *
   * @param {string} data
   */
  function filterUselessWarnings(data) {
    if(skipLinesUntilCaret) {
      if(data.trim() === "^") {
        skipLinesUntilCaret = false;
        skipNextBlankLine = true;
      }

      return;
    }

    if(skipNextBlankLine && data.trim().length === 0) {
      skipNextBlankLine = false;

      return;
    }

    if(/node_modules.lodash.*WARNING/g.test(data)) {
      skipLinesUntilCaret = true;

      return;
    }

    console.log(data);
  }

  readline.createInterface({
    input: ccProcess.stdout,
    terminal: false
  }).on("line", filterUselessWarnings);

  readline.createInterface({
    input: ccProcess.stderr,
    terminal: false
  }).on("line", filterUselessWarnings);

  ccProcess.on("close", function(code) {
    if(code) {
      console.log("Error: " + code);
    }

    // delete the response file if we can
    fs.unlinkSync(responseFileName);

    done();
  });
});

/* Closure Compiler doesn't have a convenient way to declare global constants that its
 * CommonJS support can grok.  That leads us to declare all feature flags and global constants
 * as externs in Closure Compiler.  Making feature flags appear as externs ensures that this
 * minification pass will still have access to the unmangled feature flag symbol and any
 * code hidden behind that feature flag can be elided if the feature flag is disabled. */
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
        side_effects: true,
        warnings: false,
        properties: false,
        drop_console: false,
        negate_iife: false,
        drop_debugger: true,
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
  var rm = require("gulp-rm");

  return gulp.src([ "./intermediate/**/*", "./dist/**/*", "./lib/constantExterns.js" ])
    .pipe(rm());
});

gulp.task("del-folders", function() {
  var rm = require("gulp-rm");

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
  var webpack = require("webpack"),
    configureWebpack = require("./etc/configureWebpack"),
    webpackStream = require("webpack-stream");

  return gulp.src([ "./lib/bootstrap/testingMain.js" ])
    .pipe(named()) // vinyl-named endows each file in the src array with a webpack entry whose key is the filename sans extension
    .pipe(webpackStream(configureWebpack({
      enableSourceMaps: true,
      isProductionBundle: true,
      areBundlesSplit: true,
      outputFilename: "bootstrap.js"
    })), webpack)
    .pipe(gulp.dest("intermediate/"));
});

gulp.task("bootstrap-production-bundle", [ "json-to-scss" ], function() {
  var webpack = require("webpack"),
    configureWebpack = require("./etc/configureWebpack"),
    webpackStream = require("webpack-stream");

  return gulp.src([ "./lib/bootstrap/main.js" ])
    .pipe(named()) // vinyl-named endows each file in the src array with a webpack entry whose key is the filename sans extension
    .pipe(webpackStream(configureWebpack({
      enableSourceMaps: true,
      isProductionBundle: true,
      areBundlesSplit: true,
      outputFilename: "bootstrap.js"
    })), webpack)
    .pipe(gulp.dest("intermediate/"));
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
    // now sort tests to the end of the list
    var i,
      testFiles = [],
      allFiles = [],
      isTestRegex = /\.(spec|system|integration)\./;

    for(i = globFiles.length; i--;) {
      if(isTestRegex.test(globFiles[i])) {
        testFiles.push(globFiles[i]);
        globFiles.splice(i, 1);
      }
    }

    allFiles.push.apply(allFiles, testFiles);
    allFiles.push.apply(allFiles, globFiles);

    done(allFiles);
  });
}

gulp.task("ie-polyfill-production-bundle", function() {
  var webpack = require("webpack"),
    configureWebpack = require("./etc/configureWebpack"),
    webpackStream = require("webpack-stream");

  return gulp.src([ "./lib/iePolyfill/main.js" ])
    .pipe(named()) // vinyl-named endows each file in the src array with a webpack entry whose key is the filename sans extension
    .pipe(webpackStream(configureWebpack({
      enableSourceMaps: true,
      isProductionBundle: true,
      areBundlesSplit: true,
      outputFilename: "iePolyfill.js"
    })), webpack)
    .pipe(gulp.dest("intermediate/"));
});

gulp.task("html5-polyfill-production-bundle", function() {
  var webpack = require("webpack"),
    configureWebpack = require("./etc/configureWebpack"),
    webpackStream = require("webpack-stream");

  return gulp.src([ "./lib/html5Polyfill/main.js" ])
    .pipe(named()) // vinyl-named endows each file in the src array with a webpack entry whose key is the filename sans extension
    .pipe(webpackStream(configureWebpack({
      enableSourceMaps: true,
      isProductionBundle: true,
      areBundlesSplit: true,
      outputFilename: "html5Polyfill.js"
    })), webpack)
    .pipe(gulp.dest("intermediate/"));
});

gulp.task("kidcompy-testing-production-bundle", function(done) {
  return runSequence(
    [ "kidcompy-testing-cc-config" ],
    [ "closure-compiler" ],
    done
  );
});

gulp.task("kidcompy-testing-cc-config", function(done) {
  resolveGlobs(["./lib/kidcompy/main.js", "./lib/kidcompy/**/*.js", "./lib/symbols/**/*.js",
                "./node_modules/lodash-compat/support.js",
                "./node_modules/lodash-compat/internal/isLength.js",
                "./node_modules/lodash-compat/internal/createBaseEach.js",
                "./node_modules/lodash-compat/chain/*.js",
                "./node_modules/lodash-compat/string/*.js",
                "./node_modules/lodash-compat/date/*.js",
                "./node_modules/lodash-compat/internal/*.js",
                "./node_modules/lodash-compat/function/*.js",
                "./node_modules/lodash-compat/array/*.js",
                "./node_modules/lodash-compat/object/*.js",
                "./node_modules/lodash-compat/utility/*.js",
                "./node_modules/lodash-compat/lang/*.js"], function(srcFiles) {
    closureCompilerConfig = configureClosureCompiler(gulpFolder, {
      isProductionBundle: true,
      areBundlesSplit: true,
      sourceFiles: srcFiles,
      sourceFolder: "./lib/kidcompy",
      targetFolder: "intermediate",
      outputFile: "kidcompy.closureCompiler.js",
      minifiedFile: "kidcompy.js"
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
                "./node_modules/lodash-compat/support.js",
                "./node_modules/lodash-compat/internal/isLength.js",
                "./node_modules/lodash-compat/internal/createBaseEach.js",
                "./node_modules/lodash-compat/chain/*.js",
                "./node_modules/lodash-compat/string/*.js",
                "./node_modules/lodash-compat/date/*.js",
                "./node_modules/lodash-compat/internal/*.js",
                "./node_modules/lodash-compat/function/*.js",
                "./node_modules/lodash-compat/array/*.js",
                "./node_modules/lodash-compat/object/*.js",
                "./node_modules/lodash-compat/utility/*.js",
                "./node_modules/lodash-compat/lang/*.js",
                "!./**/*.spec.js", "!./**/*.integration.js", "!./**/*.system.js"], function(srcFiles) {
    closureCompilerConfig = configureClosureCompiler(gulpFolder, {
      isProductionBundle: true,
      areBundlesSplit: true,
      sourceFiles: srcFiles,
      sourceFolder: "./lib/kidcompy",
      targetFolder: "intermediate",
      outputFile: "kidcompy.closureCompiler.js",
      minifiedFile: "kidcompy.js"
    });

    done();
  });
});

gulp.task("production-bundle-tests", function(done) {
  var karma = require("karma");

  karma.server.start({
    configFile: __dirname + "/etc/karma.prodBundle.conf.js",
    singleRun: true,
    autoWatch: false
  }, done);
});

gulp.task("unit-watcher", [ "json-to-scss" ], function(done) {
  var karma = require("karma");

  karma.server.start({
    configFile: __dirname + "/etc/karma.unit.conf.js",
    singleRun: false,
    autoWatch: true
  }, done);
});

gulp.task("unit-single", [ "json-to-scss" ], function(done) {
  var karma = require("karma");

  karma.server.start({
    configFile: __dirname + "/etc/karma.unit.conf.js",
    singleRun: true,
    autoWatch: false
  }, done);
});

gulp.task("integration-watcher", [ "json-to-scss" ], function(done) {
  var karma = require("karma");

  karma.server.start({
    configFile: __dirname + "/etc/karma.integrationAndCoverage.conf.js",
    singleRun: false,
    autoWatch: true
  }, done);
});

gulp.task("integration-single", [ "json-to-scss" ], function(done) {
  var karma = require("karma");

  karma.server.start({
    configFile: __dirname + "/etc/karma.integrationAndCoverage.conf.js",
    singleRun: true,
    autoWatch: false
  }, done);
});

gulp.task("production-mode-integration-single", [ "json-to-scss" ], function(done) {
  var karma = require("karma");

  karma.server.start({
    configFile: __dirname + "/etc/karma.prodIntegrationAndCoverage.conf.js",
    singleRun: true,
    autoWatch: false
  }, done);
});

gulp.task("production-mode-integration-watcher", [ "json-to-scss" ], function(done) {
  var karma = require("karma");

  karma.server.start({
    configFile: __dirname + "/etc/karma.prodIntegrationAndCoverage.conf.js",
    singleRun: false,
    autoWatch: true
  }, done);
});

gulp.task("start-harness-content", function() {
  // Serve up harnessContent folder
  var serveStatic = require("serve-static"),
    serve = serveStatic("./harnessContent", { index: [ "index.html", "index.htm" ]}),

    // Create server
    server = http.createServer(function(req, res) {
      var done = finalHandler(req, res);

      res.setHeader("Expires", new Date(0));

      serve(req, res, done);
    });

  // Listen
  server.listen(9080);
});

gulp.task("start-production-harness-content", function() {
  // Serve up harnessContent folder
  var URI = require("urijs"),
    serveStatic = require("serve-static"),
    serveHarnessContent = serveStatic("./harnessContent", { index: [ "index.html", "index.htm" ]}),
    serveHarnessCode = serveStatic("./dist"),
    serveFirebugLite = serveStatic("./etc"),
    firebugLiteContentFilePath,
    harnessContentFilePath,
    server;

  // Create server
  server = http.createServer(function(req, res) {
    var requestUrl = new URI(req.url),
      done = finalHandler(req, res);

    // redirect harness.js to the bootstrap.js file
    if(requestUrl.filename() === "harness.js") {
      res.writeHead(301, {
        "location": requestUrl.directory() + "/bootstrap.js"
      });
      res.end();

      return;
    }

    res.setHeader("Expires", new Date(0));

    firebugLiteContentFilePath = gulpFolder + "/etc" +
      (requestUrl.directory().length ? requestUrl.directory() + "/" : "/") + requestUrl.filename();

    try {
      fs.accessSync(firebugLiteContentFilePath, fs.R_OK); // throws if file does not exist
      serveFirebugLite(req, res, done);
    }
    catch(e) {
      harnessContentFilePath = gulpFolder + "/harnessContent" +
        (requestUrl.directory().length ? requestUrl.directory() + "/" : "/") + requestUrl.filename();

      try {
        fs.accessSync(harnessContentFilePath, fs.R_OK); // throws if file does not exist
        serveHarnessContent(req, res, done);
      }
      catch(e2) {
        serveHarnessCode(req, res, done);
      }
    }
  });

  // Listen
  server.listen(8080);
});

gulp.task("start-harness-server", [ "json-to-scss" ], function(callback) {
  var server,
    webpack = require("webpack"),
    configureWebpack = require("./etc/configureWebpack"),
    WebpackDevServer = require("webpack-dev-server");

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

  server.listen(8080, function() {
    callback();
  });
});

gulp.task("spawn-harness-browser", function() {
  var opn = require("opn");

  opn("http://localhost:8080/index.html", { app: [ "firefox", "--private-window" ]});
});

/**
 * @param {Array.<string>} srcGlobPatterns
 * @param {Array.<string>} params in-order list of command line params to send to jsdoc.
 *        See http://usejsdoc.org/about-commandline.html for valid params
 * @param {Function} callback completion callback
 */
function callJsdoc(srcGlobPatterns, params, callback) {
  var spawn = require("child_process").spawn,
    srcFiles = gulp.src(srcGlobPatterns),
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
      "!./lib/testingExterns.js", "!./lib/constantExterns.js", "!./lib/featureFlags.js", "!./lib/buildConfig.js",
      "README.md" ],
    [
      "--access", "public,undefined",
      "--configure", path.resolve(__dirname, "./etc/jsdoc.conf.json"),
      "--destination", path.resolve(__dirname, "./dist/public-api"),
      "--template", path.resolve(__dirname, "./node_modules/ink-docstrap/template")
    ],
    done);

  // "--verbose"
});

gulp.task("jsdoc-dev-docs", function(done) {
  callJsdoc([ "./lib/**/*.js", "!./lib/**/*.spec.js", "!./lib/**/*.integration.js", "!./lib/**/*.system.js",
      "!./lib/testingExterns.js", "README.md" ],
    [
      "--access", "all",
      "--private",
      "--configure", path.resolve(__dirname, "./etc/jsdoc.conf.json"),
      "--destination", path.resolve(__dirname, "./dist/developer-docs"),
      "--template", path.resolve(__dirname, "./node_modules/ink-docstrap/template")
    ],
    done);

  // "--verbose"
});

gulp.task("json-to-scss", function() {
  var jsonSass = require("gulp-json-sass");

  return gulp
    .src("./lib/styles/styleVars.json")
    .pipe(jsonSass({
      sass: false
    }))
    .pipe(gulp.dest("./lib/styles"));
});

gulp.task("copy-dist-artifacts", function() {
  return gulp.src([
    "intermediate/*.js*",
    "intermediate/**/*.css*",
    "!intermediate/*.closureCompiler.*",
    "!intermediate/test_coverage/**/*"
  ], { base: "intermediate" }).pipe(gulp.dest("./dist"));
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

gulp.task("install-prereqs", function(done) {
  return runSequence(
    [ "install-closure-compiler" ],
    [ "install-closure-library" ],
    done
  );
});

gulp.task("install-closure-compiler", function() {
  var download = require("gulp-download");

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
  var download = require("gulp-download");

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

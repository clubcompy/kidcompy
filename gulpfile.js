"use strict";

/* jscs: disable */
var path = require("path"),
  gulp = require("gulp"),
  spawn = require("child_process").spawn,
  karma = require("gulp-karma"),
  webpack = require("webpack"),
  WebpackDevServer = require("webpack-dev-server"),
  gulpWebpack = require("gulp-webpack"),
  runSequence = require("run-sequence"),
  FirefoxProfile = require("firefox-profile"),
  wd = require("wd"),
  selenium = require("selenium-standalone"),
  finalHandler = require("finalhandler"),
  http = require("http"),
  serveStatic = require("serve-static"),
  named = require("vinyl-named"),
  configureWebpack = require("./configureWebpack"),

  isProductionMode = true,

  moduleEntryPoints = [
    "./lib/Main.js"
  ],

  unitTestFiles = [
    "./lib/**/*.spec.js"
  ],

  allTestFiles = [
    "./lib/**/*.spec.js",
    "./lib/**/*.integration.js",
    "./lib/**/*.system.js"
  ];

gulp.task("build", function() {
  // webpack
  //  jshint and jscs
  //  karma;single on spec and integration tests
  //  code coverage
  //  build bundles
  //  generate jsdocs

  return gulp.src(moduleEntryPoints)
    // vinyl-named endows each file in the src array with a webpack entry whose key is the filename sans extension
    .pipe(named())
    .pipe(gulpWebpack({
      // hidden-source-map writes the full source map, but doesn't add the comment annotation
      // the script that causes the browser to automatically load the source map.
      devtool: isProductionMode ? "hidden-source-map" : "source-map",

      module: {
        preLoaders: [
          {
            // include .js files
            test: /\.js$/,
            // exclude any and all files in the node_modules folder
            exclude: /node_modules/,
            loader: "jshint-loader"
          },
          {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: "jscs-loader"
          }
        ],

        loaders: [
          /* .ejs : precompiled lodash template */
          { test: /\.ejs$/, loader: "ejs" },

          /* .scss : SASS file that is compiled to a named .css file in the css folder */
          {
            test: /\.scss$/,
            loader: "style/url?limit=0!file?name=css/[name].css?[hash]!sass?outputStyle=" +
                    (isProductionMode ? "compressed" : "expanded") +
                    "&includePaths[]=" + path.resolve(__dirname, "./node_modules")
          }
        ]
      },

      jscs: {
        emitErrors: true,
        maxErrors: 50,
        verbose: true
      },

      plugins: [
        new webpack.ProvidePlugin({
          /* make lodash available to all modules */
          _: "lodash"
        }),

        new webpack.optimize.UglifyJsPlugin({
          compress: {
            warnings: false
          },

          mangle: {
            except: [ "_", "exports", "require" ]
          }
        })
      ]
    }), webpack)
    .pipe(gulp.dest("dist/"));
});

gulp.task("install-selenium", function(callback) {
  selenium.install({
    /**
     * @param {string} message
     */
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

gulp.task("unit-single", function() {
  // Be sure to return the stream
  return gulp.src(unitTestFiles).pipe(karma({
    configFile: "karma.conf.js",
    action: "run"
  }));
});

gulp.task("integration-single", function() {
  // Be sure to return the stream
  return gulp.src(allTestFiles).pipe(karma({
    configFile: "karma.conf.js",
    action: "run"
  }));
});

gulp.task("unit-watcher", function() {
  return gulp.src(unitTestFiles).pipe(karma({
    configFile: "karma.conf.js",
    action: "watch"
  }));
});

gulp.task("integration-watcher", function() {
  return gulp.src(allTestFiles).pipe(karma({
    configFile: "karma.conf.js",
    action: "watch"
  }));
});

gulp.task("dev", function() {
  return runSequence([ "start-selenium", "start-harness-content" ],
                     [ "start-harness-server" ],
                     [ "spawn-harness", "unit-watcher" ]);
});

gulp.task("integration", function() {
  return runSequence([ "start-selenium", "start-harness-content" ],
                     [ "start-harness-server" ],
                     [ "spawn-harness", "integration-watcher" ]);
});

gulp.task("start-selenium", function() {
  spawn("./selenium-standalone", [ "start" ], {
    cwd: "./node_modules/selenium-standalone/bin",
    detached: false,
    stdio: "inherit"
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

gulp.task("spawn-harness", function() {
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
      browser.init({
        browserName: "firefox",
        firefox_profile: zippedProfile
      })
        .get("http://localhost:8080/index.html")
        .maximize()
        .setAsyncScriptTimeout(1000)
        .done();
    });
  });
});

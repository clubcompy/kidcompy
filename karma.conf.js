var path = require("path");
var webpack = require("webpack");

var isProductionMode = false;

module.exports = function(config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ["mocha", "proclaim", "sinon"],

    plugins: [
      require("karma-webpack"),
      require("karma-mocha"),
      require("karma-proclaim"),
      require("karma-sinon"),
      require("karma-firefox-launcher"),
      require("karma-sourcemap-loader"),
      require("karma-istanbul-reporter"),
      require("karma-coverage")
    ],

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ["dots", "coverage"],

    client: {
      mocha: {
        reporter: "html",
        ui: "bdd"
      }
    },

    // list of files / patterns to load in the browser
    files: [
      'lib/**/*.js'
    ],

    // list of files to exclude
    exclude: [
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      "lib/**/*.spec.js": ["webpack", "coverage", "sourcemap"]
    },

    webpack: {
      // karma watches the test entry points
      // (you don't need to specify the entry option)
      // webpack watches dependencies

      // webpack configuration -- eval is the fast method of getting sourcemap info into the sources, but
      // we probably won't do sourcemaps at all as part of our production packaging since we're going to mangle
      devtool: "eval",

      module: {
        loaders: [
          /* .ejs : precompiled lodash template */
          { test: /\.ejs$/, loader: "ejs" },

          /* .scss : SASS file encoded into scripts that can be reloaded */
          {
            test: /\.scss$/,
            loader: "style!css!sass?outputStyle=compressed&includePaths[]=" + (path.resolve(__dirname, "./node_modules"))
          }
        ]
      },

      plugins: [
        new webpack.ProvidePlugin({
          "_": "lodash"                         /* make lodash available to all modules */
        })
      ]
    },

    webpackMiddleware: {
      // webpack-dev-middleware configuration
      // i. e.
      noInfo: true
    },

    coverageReporter: {
      reporters: [
        {
          type : 'html',
          dir : 'test_coverage/'
        }
      ]

    },

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ["Firefox"],

    // user prefs for firefox, disables a popunder shown on first-time-run profiles
    firefox: {
      "datareporting.healthreport.service.firstRun": true,
      "datareporting.healthreport.uploadEnabled": false,
      "browser.rights.3.shown": true
    },

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};

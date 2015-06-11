"use strict";

// jscs: disable
var configureWebpack = require("./configureWebpack");
var log = require("util").log;
var _ = require("lodash");

module.exports = function(config) {
  return _.extend(config, {
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ["mocha", "proclaim", "sinon"],

    plugins: [
      require("karma-webpack"),
      require("karma-mocha"),
      require("karma-proclaim"),
      require("karma-sinon-ie"),
      require("karma-firefox-launcher"),
      require("karma-sourcemap-loader")
    ],

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ["dots"],

    client: {
      mocha: {
        reporter: "html",
        ui: "bdd"
      }
    },

    // list of files / patterns to load in the browser
    files: [
      "lib/**/*.spec.js"
    ],

    // list of files to exclude
    exclude: [
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      "lib/**/*.spec.js": ["webpack", "sourcemap"]
    },

    webpack: configureWebpack({
      enableSourceMaps: true,
      isRunningTests: true
    }),

    webpackMiddleware: {
      // webpack-dev-middleware configuration
      // i. e.
      noInfo: true
    },

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ["Firefox"],

    // user prefs for firefox, disables a popunder shown on first-time-run profiles
    firefox: {
      "datareporting.healthreport.service.firstRun": true,
      "datareporting.healthreport.uploadEnabled": false,
      "browser.rights.3.shown": true
    },

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};

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

// jscs: disable
var configureWebpack = require("./configureWebpack");
/* jshint -W079 */
var path = require("path"),
  _ = require("lodash");

module.exports = function(config) {
  var commonSettings = {
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: path.resolve(__dirname, ".."),

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ["mocha", "proclaim", "sinon"],

    plugins: [
      require("karma-webpack"),
      require("karma-mocha"),
      require("karma-mocha-reporter"),
      require("karma-proclaim"),
      require("karma-sinon-ie"),
      require("karma-firefox-launcher"),
      require("karma-sourcemap-loader"),
      require("karma-super-dots-reporter")
    ],

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ["super-dots", "mocha"],

    mochaReporter: {
      output: "minimal",
      colors: {
        info: "cyan"
      }
    },

    superDotsReporter: {
      icon: {
        success: "."
      }
    },

    client: {
      mocha: {
        reporter: "html",
        ui: "bdd"
      }
    },

    // list of files / patterns to load in the browser
    files: [
      path.resolve(__dirname, "../lib/**/*.spec.js")
    ],

    // list of files to exclude
    exclude: [
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {},

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
  };

  commonSettings.preprocessors[path.resolve(__dirname, "../lib/**/*.spec.js")] = ["webpack", "sourcemap"];

  return _.extend(config, commonSettings);
};

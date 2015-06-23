"use strict";

// jscs: disable
var configureWebpack = require("./configureWebpack");

/* jshint -W079 */
var _ = require("lodash");

module.exports = function(config) {
  var baseKarmaConfig = require("./karma.base.conf")(config);

  return _.extend(baseKarmaConfig, {
    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ["dots"],

    // list of files / patterns to load in the browser
    files: [
      "lib/**/*.spec.js",
      "lib/**/*.integration.js",
      "lib/**/*.system.js"
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      "lib/**/*.spec.js": ["webpack", "sourcemap"],
      "lib/**/*.integration.js": ["webpack", "sourcemap"],
      "lib/**/*.system.js": ["webpack", "sourcemap"]
    },

    logLevel: config.LOG_ERROR,

    webpack: configureWebpack({
      enableSourceMaps: true,
      isProductionBundle: true,
      isRunningTests: true,
      isLintingCode: true
    })
  });
};

"use strict";

// jscs: disable
var configureWebpack = require("./configureWebpack");
var log = require("util").log;
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
      "lib/**/*.spec.js"
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      "lib/**/*.spec.js": ["webpack", "sourcemap"]
    },

    webpack: configureWebpack({
      enableSourceMaps: true,
      isProductionBundle: false,
      isRunningTests: true,
      isLintingCode: true
    }),
  });
};

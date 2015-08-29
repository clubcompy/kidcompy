"use strict";

// jscs: disable
var configureWebpack = require("./configureWebpack");
/* jshint -W079 */
var path = require("path"),
  _ = require("lodash");

module.exports = function(config) {
  var baseKarmaConfig = require("./karma.base.conf.js")(config),
    configOverrides;

  configOverrides = {
    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ["dots"],

    // list of files / patterns to load in the browser
    files: [
      path.resolve(__dirname, "../lib/**/*.spec.js")
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {},

    logLevel: "LOG_DEBUG",

    webpack: configureWebpack({
      enableSourceMaps: true,
      isProductionBundle: false,
      isRunningTests: true,
      isLintingCode: true
    })
  };

  configOverrides.preprocessors[path.resolve(__dirname, "../lib/**/*.spec.js")] = ["webpack", "sourcemap"];

  return _.extend(baseKarmaConfig, configOverrides);
};

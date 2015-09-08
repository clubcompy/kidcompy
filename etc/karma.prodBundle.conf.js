"use strict";

// jscs: disable

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
      {pattern: path.resolve(__dirname, "../intermediate/bootstrap.min.js"), included: true, served: true, nocache: true},

      // these files will be served on demand from disk
      {pattern: path.resolve(__dirname, "../intermediate/iePolyfill.min.js"), included: false, served: true, nocache: true},
      {pattern: path.resolve(__dirname, "../intermediate/html5Polyfill.min.js"), included: false, served: true, nocache: true},
      {pattern: path.resolve(__dirname, "../intermediate/kidcompy.min.js"), included: false, served: true, nocache: true}
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {},

    logLevel: config.LOG_ERROR
  };

  configOverrides.preprocessors[path.resolve(__dirname, "../intermediate/bootstrap.min.js")] = ["sourcemap"];

  return _.extend(baseKarmaConfig, configOverrides);
};

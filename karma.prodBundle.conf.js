"use strict";

// jscs: disable

/* jshint -W079 */
var _ = require("lodash");

module.exports = function(config) {
  var baseKarmaConfig = require("./etc/karma.base.conf.js")(config);

  return _.extend(baseKarmaConfig, {
    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ["dots"],

    // list of files / patterns to load in the browser
    files: [
      "intermediate/testing.min.js"
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      "intermediate/testing.min.js": ["sourcemap"]
    },

    logLevel: config.LOG_ERROR
  });
};

"use strict";

// jscs: disable
var configureWebpack = require("./configureWebpack");

/* jshint -W079 */
var path = require("path"),
  _ = require("lodash");

module.exports = function(config, isProductionBundle, areBundlesSplit) {
  var baseKarmaConfig = require("./karma.base.conf.js")(config),
    configOverrides;

  configOverrides = {
    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ["dots", "coverage"],

    // add in the coverage plugins
    plugins: baseKarmaConfig.plugins.concat([
      require("karma-istanbul-reporter"),
      require("karma-coverage"),
      require("istanbul-instrumenter-loader")
    ]),

    // destination for coverage reports
    coverageReporter: {
      reporters: [
        {
          type: "html",
          dir: path.resolve(__dirname, "../intermediate/test_coverage/")
        }
      ]
    },

    // list of files / patterns to load in the browser
    files: [
      {pattern: path.resolve(__dirname, "../lib/bootstrap/main.js"), included: true, served: true, nocache: true},
      {pattern: path.resolve(__dirname, "../etc/firebug-lite/build/firebug-lite.js"), included: false, served: true, nocache: true},

      path.resolve(__dirname, "../lib/**/*.spec.js"),
      path.resolve(__dirname, "../lib/**/*.integration.js"),
      path.resolve(__dirname, "../lib/**/*.system.js")
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {},

    webpack: configureWebpack({
      enableSourceMaps: true,
      isProductionBundle: isProductionBundle || false,
      areBundlesSplit: areBundlesSplit || false,
      isRunningTests: true,
      isLintingCode: true,
      isGeneratingCoverage: true
    })
  };

  configOverrides.preprocessors[path.resolve(__dirname, "../lib/bootstrap/main.js")] = ["webpack", "coverage", "sourcemap"];
  configOverrides.preprocessors[path.resolve(__dirname, "../lib/**/([a-zA-Z0-9_]+).js")] = ["webpack", "coverage", "sourcemap"];
  configOverrides.preprocessors[path.resolve(__dirname, "../lib/**/*.spec.js")] = ["webpack", "sourcemap"];
  configOverrides.preprocessors[path.resolve(__dirname, "../lib/**/*.integration.js")] = ["webpack", "sourcemap"];
  configOverrides.preprocessors[path.resolve(__dirname, "../lib/**/*.system.js")] = ["webpack", "sourcemap"];

  return _.extend(baseKarmaConfig, configOverrides);
};

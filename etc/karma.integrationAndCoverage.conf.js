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

module.exports = function(config, isProductionBundle, areBundlesSplit) {
  var baseKarmaConfig = require("./karma.base.conf.js")(config),
    configOverrides;

  configOverrides = {
    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: baseKarmaConfig.reporters.concat(["coverage"]),

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
          dir: path.resolve(__dirname, "../intermediate/test-coverage/")
        }
      ]
    },

    // list of files / patterns to load in the browser
    files: [
      path.resolve(__dirname, "../node_modules/es5-shim/es5-shim.js"),
      path.resolve(__dirname, "../node_modules/es5-shim/es5-sham.js"),
      {pattern: path.resolve(__dirname, "../lib/bootstrap/main.js"), included: true, served: true, nocache: true},

      path.resolve(__dirname, "../lib/**/*.spec.js"),
      path.resolve(__dirname, "../lib/**/*.comp.js"),
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

  // this redundant preprocessor seems necessary to get the files item on line 59 (bootstrap/main.js) to be webpack'ed
  configOverrides.preprocessors[path.resolve(__dirname, "../lib/bootstrap/main.js")] = ["webpack", "coverage", "sourcemap"];

  configOverrides.preprocessors[path.resolve(__dirname, "../lib/**/([a-zA-Z0-9_]+).js")] = ["webpack", "coverage", "sourcemap"];
  configOverrides.preprocessors[path.resolve(__dirname, "../lib/**/*.spec.js")] = ["webpack", "sourcemap"];
  configOverrides.preprocessors[path.resolve(__dirname, "../lib/**/*.comp.js")] = ["webpack", "sourcemap"];
  configOverrides.preprocessors[path.resolve(__dirname, "../lib/**/*.integration.js")] = ["webpack", "sourcemap"];
  configOverrides.preprocessors[path.resolve(__dirname, "../lib/**/*.system.js")] = ["webpack", "sourcemap"];

  return _.extend(baseKarmaConfig, configOverrides);
};

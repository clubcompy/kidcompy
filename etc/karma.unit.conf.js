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
  var baseKarmaConfig = require("./karma.base.conf.js")(config),
    configOverrides;

  configOverrides = {
    // list of files / patterns to load in the browser
    files: [
      path.resolve(__dirname, "karma.unit.files.js")
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {},

    webpack: configureWebpack({
      enableSourceMaps: true,
      isProductionBundle: false,
      areBundlesSplit: false,
      isRunningTests: true,
      isLintingCode: true
    })
  };

  // this redundant preprocessor seems necessary to get the files item on line 36 (bootstrap/main.js) to be webpack'ed
  configOverrides.preprocessors[path.resolve(__dirname, "karma.unit.files.js")] = ["webpack"];

  return _.extend(baseKarmaConfig, configOverrides);
};

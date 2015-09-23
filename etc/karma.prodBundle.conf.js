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
      {pattern: path.resolve(__dirname, "../intermediate/bootstrap.js"), included: true, served: true, nocache: true},

      // these files will be served on demand from disk
      {pattern: path.resolve(__dirname, "../intermediate/iePolyfill.js"), included: false, served: true, nocache: true},
      {pattern: path.resolve(__dirname, "../intermediate/html5Polyfill.js"), included: false, served: true, nocache: true},
      {pattern: path.resolve(__dirname, "../intermediate/kidcompy.js"), included: false, served: true, nocache: true}
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {},

    logLevel: config.LOG_ERROR
  };

  return _.extend(baseKarmaConfig, configOverrides);
};

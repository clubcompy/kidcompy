"use strict";

// jscs: disable

/* jshint -W079 */
var _ = require("lodash");

module.exports = function(config) {
  return require("./karma.integrationAndCoverage.conf")(config, true);
};

"use strict";

// jscs: disable

module.exports = function(config) {
  return require("./karma.integrationAndCoverage.conf.js")(config, true, false);
};

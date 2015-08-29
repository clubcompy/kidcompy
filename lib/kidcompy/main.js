"use strict";

var exportPublicProperties = require("../symbols/exportPublicProperties");

/**
 * Called by the bootstrap script to start initialing the kidcompy module
 *
 * @public
 * @param {function()} done callback called when the kidcompy module is initialized
 */
kidcompy.initialize = function(done) {
  console.log("kidcompy initialized");

  done();
};

// global exports
exportPublicProperties(kidcompy, [
  ["initialize", kidcompy.initialize]
]);

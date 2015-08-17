"use strict";

// jshint -W040
var globalObj = this || window;

/**
 * Find an existing global namespace object on the window object and return it, or
 * create a new namespace object if it hasn't been created yet
 *
 * @returns {Object} global namespace (on the window object)
 */
function declareKidcompyNamespace() {
  if(typeof globalObj["kidcompy"] === "undefined") {
    globalObj["kidcompy"] = {};
  }

  return globalObj["kidcompy"];
}

/**
 * require("./symbols/declareKidcompyNamespace") &rArr; function(string)
 *
 * @module symbols/declareKidcompyNamespace
 */
module.exports = declareKidcompyNamespace;

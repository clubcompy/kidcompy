"use strict";

// jshint -W040
var globalObj = this || window;

/**
 * Export a value as a name on the window/global object
 *
 * @param {string} globalName
 * @param {*} value
 */
function exportSymbol(globalName, value) {
  globalObj[globalName] = value;
}

/**
 * require("./symbols/exportSymbol") &rArr; function(string,*)
 *
 * @module symbols/exportSymbol
 */
module.exports = exportSymbol;

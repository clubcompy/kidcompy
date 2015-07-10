"use strict";

// jshint -W040
var globalObj = this || window;

/**
 * Export a value as a name on the window/global object
 *
 * @param {string} globalName
 * @param {*} value
 */
function exportGlobal(globalName, value) {
  globalObj[ globalName ] = value;
}

module.exports = exportGlobal;

"use strict";

/**
 * Extend object with members shallow copied from another object
 *
 * @param {Object} extendWith source object
 */
function extendKidcompyNamespace(extendWith) {
  var obj = window["kidcompy"],
    prop;

  // jshint -W116
  if(obj && extendWith && obj != extendWith) {
    for(prop in extendWith) {
      if(extendWith.hasOwnProperty(prop)) {
        obj[prop] = extendWith[prop];
      }
    }
  }
}

/**
 * require("./symbols/extendKidcompyNamespace") &rArr; Function(string,Object)
 *
 * @module symbols/extendKidcompyNamespace
 */
module.exports = extendKidcompyNamespace;

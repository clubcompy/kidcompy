"use strict";

var exportPublicProperties = require("../symbols/exportPublicProperties"),
  initialized = false;

/**
 * Called by lifecycle script to start Html5 Polyfills and ES6 polyfills
 *
 * @public
 * @param {function()} done callback to be called once HTML5 polyfills init is complete
 */
kidcompy.initializeHtml5Polyfills = function(done) {
  if(initialized) {
    return;
  }

  initialized = true;

  // Object.freeze can't be polyfilled, so just sham it
  Object.freeze = Object.freeze || function() {};

  // Make sure we have es6 promises on the window object
  require("es6-promise").polyfill();

  kidcompy.log("html5Polyfill loaded");
  done();
};

// global exports
exportPublicProperties(kidcompy, [
  ["initializeHtml5Polyfills", kidcompy.initializeHtml5Polyfills]
]);

exportPublicProperties(Object, [
  ["freeze", Object.freeze]
]);

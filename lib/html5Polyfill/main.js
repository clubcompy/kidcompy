"use strict";

var exportPublicProperties = require("../symbols/exportPublicProperties");

/**
 * Called by lifecycle script to start Html5 Polyfills
 *
 * @public
 * @param {function()} done callback to be called once HTML5 polyfills init is complete
 */
kidcompy.initializeHtml5Polyfills = function(done) {
  kidcompy.log("html5Polyfill loaded");
  done();
};

// global exports
exportPublicProperties(kidcompy, [
  ["initializeHtml5Polyfills", kidcompy.initializeHtml5Polyfills]
]);

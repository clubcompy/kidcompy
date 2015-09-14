"use strict";

/**
 *
 * @constructor
 */
function DetectHtml5Polyfill() {
}

/**
 * check whether Html5 polyfills could be used by the host browser
 *
 * @param {function(boolean)} done callback called with a boolean.  If true, HTML5 Polyfills should be loaded
 */
DetectHtml5Polyfill.prototype.check = function(done) {
  kidcompy.log("Detect HTML5 polyfill:  check");
  done(true);
};

/**
 * require("./html5Polyfill/detectHtml5Polyfill") &rArr; singleton instance of {@link DetectHtml5Polyfill}
 *
 * @module html5Polyfill/detectHtml5Polyfill
 */
module.exports = new DetectHtml5Polyfill();

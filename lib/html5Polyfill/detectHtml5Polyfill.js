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
 * @param {function(boolean)} done
 */
DetectHtml5Polyfill.prototype.check = function(done) {
  console.log("Detect HTML5 polyfill:  check");
  done(false);
};

/**
 * require("./html5Polyfill/detectHtml5Polyfill") &rArr; singleton instance of {@link DetectHtml5Polyfill}
 *
 * @module html5Polyfill/detectHtml5Polyfill
 */
module.exports = new DetectHtml5Polyfill();

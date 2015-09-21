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
  var missingObjectFreeze = !Object.freeze,
    missingPromises = false;

  if(missingObjectFreeze) {
    kidcompy.log("missing Object.freeze");
  }

  kidcompy.Modernizr.on("promises", function(doesSupport) {
    missingPromises = !doesSupport;

    if(missingPromises) {
      kidcompy.log("missing ES6 Promises");
    }

    done(missingObjectFreeze || missingPromises);
  });
};

/**
 * require("./html5Polyfill/detectHtml5Polyfill") &rArr; singleton instance of {@link DetectHtml5Polyfill}
 *
 * @module html5Polyfill/detectHtml5Polyfill
 */
module.exports = new DetectHtml5Polyfill();

"use strict";

/**
 *
 * @constructor
 */
function DetectIePolyfill() {
}

/**
 * check whether legacy IE polyfills could be used by the host browser
 *
 * @param {function(boolean)} done
 */
DetectIePolyfill.prototype.check = function(done) {
  console.log("Detect IE polyfill:  check");
  done(false);
};

/**
 * require("./iePolyfill/detectIePolyfill") &rArr; singleton instance of {@link DetectIePolyfill}
 *
 * @module iePolyfill/detectIePolyfill
 */
module.exports = new DetectIePolyfill();

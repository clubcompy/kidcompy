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
 * @param {function(boolean)} done callback called with a boolean.  If true, IE Polyfills should be loaded
 */
DetectIePolyfill.prototype.check = function(done) {
  kidcompy.log("Detect IE polyfill:  check");
  done(true);
};

/**
 * require("./iePolyfill/detectIePolyfill") &rArr; singleton instance of {@link DetectIePolyfill}
 *
 * @module iePolyfill/detectIePolyfill
 */
module.exports = new DetectIePolyfill();

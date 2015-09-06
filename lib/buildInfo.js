"use strict";

/**
 * Static information about the build
 *
 * @final
 * @constructor
 */
function BuildInfo() {
  /**
   * Is this build of Kidcompy a production build?
   *
   * @type {boolean}
   */
  this.isProductionMode = PRODUCTION_MODE;

  /**
   * Kidcompy version number
   *
   * @type {string}
   */
  this.buildVersion = BUILD_VERSION;

  // /**
  //  * Summary of feature flags available in this build and their states
  //  *
  //  * @type {Object.<string,boolean>}
  //  */
  // this.featureFlagSummary = FEATURE_FLAG_SUMMARY;
}

/**
 * require("./buildInfo") &rArr; singleton of type {@link BuildInfo}
 *
 * @module buildInfo
 */
module.exports = (function() {
  // make a constant singleton instance that we can export
  var buildInfo = new BuildInfo();

  Object.freeze(buildInfo);

  return buildInfo;
})();

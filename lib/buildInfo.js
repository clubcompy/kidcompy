"use strict";

var buildInfo;

/**
 * Static information about the build
 *
 * @final
 * @constructor
 */
function BuildInfo() {
  /**
   * Is this build of Kidcompy a production build?
   */
  this.isProductionMode = PRODUCTION_MODE;

  /**
   * Kidcompy version number
   */
  this.buildVersion = BUILD_VERSION;

  /**
   * Summary of feature flags available in this build and their states
   */
  this.featureFlagSummary = FEATURE_FLAG_SUMMARY;
}

// make a constant singleton instance that we can export
buildInfo = Object.freeze(new BuildInfo());

/**
 * require("./buildInfo") &rArr; singleton of type {@link BuildInfo}
 *
 * @module buildInfo
 */
module.exports = buildInfo;

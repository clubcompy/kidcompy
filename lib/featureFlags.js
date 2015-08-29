"use strict";

require("./symbols/typedefs");

var gitUserName,
  productionMode,
  rawFlagData,

  /**
   * <p>This namespace declares build-time feature flags that toggle code blocks in development and production builds.
   *
   * <p>During the build process, properties in the featureFlags are used in if-statements throughout your code to control
   * whether a code block shall be active in the build
   *
   * <p>Do not require() this module directly, it will be imported for you automatically by the build scripts into a
   * namespace object named 'featureFlags'
   *
   * @namespace featureFlags
   */
  featureFlagsDef = {};

/**
 * <p>This raw flag data is used to build out the feature flags at run-time (for dev build) and build-time (for
 * production build).  If you need to define a new feature flag, this is the place to do it.
 *
 * <p>The keys in this object are the names of the feature flags that the build supports, the
 * values are {@link FeatureFlagData} structures that are converted to a Boolean according to the feature
 * flag computing rules
 *
 * @lends featureFlags
 */
rawFlagData = {
  /**
   * Feature flag description
   * @type {boolean}
   */
  DEPRECATED_FUNCTION: /** @type {FeatureFlagData} */ [ false, false ],

  /**
   * Feature flag description
   * @type {boolean}
   */
  NEW_FEATURE: /** @type {FeatureFlagData} */ [ false, true, {} ],

  /**
   * Feature flag description
   * @type {boolean}
   */
  EXPERIMENTAL_THING: /** @type {FeatureFlagData} */ [ true, true ],

  /**
   * Feature flag description
   * @type {boolean}
   */
  SOMETHING_NEW_DAVE_IS_WORKING_ON: /** @type {FeatureFlagData} */ [ false, false, {
    woldie: true
  } ]
};

/**
 * The logic to generate feature flags from rawFlagData
 *
 * @protected
 * @param {boolean} isProductionMode
 * @param {string} currentUserName
 */
kidcompy.generateFeatureFlags = function(isProductionMode, currentUserName) {
  var flag,
    flagData,
    featureFlagSummary = {};

  // clear out any previously-computed feature flags
  for(flag in featureFlagsDef) {
    if(featureFlagsDef.hasOwnProperty(flag)) {
      delete featureFlagsDef[flag];
    }
  }

  // build out feature flags based on settings
  for(flag in rawFlagData) {
    if(rawFlagData.hasOwnProperty(flag)) {
      flagData = rawFlagData[flag];

      if(isProductionMode) {
        featureFlagsDef[flag] = flagData[0];
      }
      else if(flagData[2] && flagData[2].hasOwnProperty(currentUserName)) {
        featureFlagsDef[flag] = flagData[2][ currentUserName ];
      }
      else {
        featureFlagsDef[flag] = flagData[1];
      }

      featureFlagSummary[flag] = featureFlagsDef[flag];
    }
  }

  return featureFlagSummary;
};

// immediately generate the feature flags from the rawFlagData based on passed-in build configuration
gitUserName = typeof GIT_USERNAME !== "undefined" ? GIT_USERNAME : "";
productionMode = typeof PRODUCTION_MODE !== "undefined" ? PRODUCTION_MODE : false;
kidcompy.generateFeatureFlags(productionMode, gitUserName);

// not providing a jsdoc @module declaration here even though there is a module.exports.  The build script
// auto-requires this module and it should never be manually require'd in our code
module.exports = featureFlagsDef;

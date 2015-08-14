"use strict";

var gitUserName,
  productionMode,
  rawFlagData,
  featureFlagsDef;

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
featureFlagsDef = {
  /**
   * @private
   * @param {boolean} isProductionMode
   * @param {string} currentUserName
   */
  generateFeatureFlags: function(isProductionMode, currentUserName) {
    var self = this,
      flag,
      flagData,
      featureFlagSummary = {};

    // clear out any previously-computed feature flags
    for(flag in self) {
      if(self.hasOwnProperty(flag) && typeof self[flag] !== "function") {
        delete self[flag];
      }
    }

    // build out feature flags based on settings
    for(flag in rawFlagData) {
      if(rawFlagData.hasOwnProperty(flag)) {
        flagData = rawFlagData[flag];

        if(isProductionMode) {
          self[flag] = flagData[0];
        }
        else if(flagData[2] && flagData[2].hasOwnProperty(currentUserName)) {
          self[flag] = flagData[2][ currentUserName ];
        }
        else {
          self[flag] = flagData[1];
        }

        featureFlagSummary[flag] = self[flag];
      }
    }
  }
};

/**
 * @typedef {Array} FeatureFlagData
 * @property {boolean} "FeatureFlagData[0]" enable/disable the feature in production mode
 * @property {boolean} "FeatureFlagData[1]" enable/disable the feature in development mode
 * @property {(Object.<string,boolean>|undefined)} "FeatureFlagData[2]" optional mapping of git username to
 *           enable/disable flags used in development mode.  If the current git user's name matches a key in this
 *           map, then the Boolean value will override the value in FeatureFlagData[1].  Add your git user.name to this
 *           map to enable or disable a feature in development mode just for your user.  You can use this map to do
 *           enable features in development that other developers will not see in their builds.  You can also use this
 *           map to disable features in development that other developers normally would see.
 */

/* This raw flag data is used to build out the feature flags at run-time (for dev build) and build-time (for
   production build) */
/**
 * @lends featureFlags
 */
rawFlagData = {
  /** @type {FeatureFlagData} */
  DEPRECATED_FUNCTION: [ false, false ],

  /** @type {FeatureFlagData} */
  NEW_FEATURE: [ false, true, {} ],

  /** @type {FeatureFlagData} */
  EXPERIMENTAL_THING: [ true, true ],

  /** @type {FeatureFlagData} */
  SOMETHING_NEW_DAVE_IS_WORKING_ON: [ false, false, { woldie: true } ]
};

// immediately generate the feature flags from the rawFlagData based on passed-in build configuration
gitUserName = typeof GIT_USERNAME !== "undefined" ? GIT_USERNAME : "";
productionMode = typeof PRODUCTION_MODE !== "undefined" ? PRODUCTION_MODE : false;
featureFlagsDef.generateFeatureFlags(productionMode, gitUserName);

// not providing a jsdoc @module declaration here because the build script auto-requires this symbol and it should
// never be manually require'd by the user
module.exports = featureFlagsDef;

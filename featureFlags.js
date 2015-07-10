"use strict";

/**
 * This module declares build-time feature flags that toggle code in development and production builds.
 *
 * During the build process, properties in the featureFlags are used in if-statements throughout your code to control
 * whether a code block shall be active in the build
 */

var gitUserName,
  productionMode,

  rawFlagData,

  featureFlagsDef;

gitUserName = typeof GIT_USERNAME !== "undefined" ? GIT_USERNAME : "";
productionMode = typeof PRODUCTION_MODE !== "undefined" ? PRODUCTION_MODE : false;

/**
 * @typedef {Array} FeatureFlagInfo
 * @property {boolean} FeatureFlagInfo[0] enable/disable the feature in production mode
 * @property {boolean} FeatureFlagInfo[1] enable/disable the feature in development mode
 * @property {(Object.<string,boolean>|undefined)} FeatureFlagInfo[2] optional mapping of git username to
 *           enable/disable flags in development mode.  If the current git user's name matches a key in this
 *           map, then the Boolean value will override FeatureFlagInfo[1]
 */

/**
 * The raw data used to build out the flags
 *
 * @lends featureFlags
 * @type {Object.<string,FeatureFlagInfo>}
 */
rawFlagData = {
  DEPRECATED_FUNCTION: [ false, false ],
  NEW_FEATURE: [ false, true, {} ],
  EXPERIMENTAL_THING: [ true, true ],
  SOMETHING_NEW_DAVE_IS_WORKING_ON: [ false, false, { woldie: true } ]
};

/**
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
      if(self.hasOwnProperty(flag) && typeof self[ flag ] !== "function") {
        delete self[ flag ];
      }
    }

    // build out feature flags based on settings
    for(flag in rawFlagData) {
      if(rawFlagData.hasOwnProperty(flag)) {
        flagData = rawFlagData[ flag ];

        if(isProductionMode) {
          self[ flag ] = flagData[ 0 ];
        }
        else if(flagData[ 2 ] && flagData[ 2 ].hasOwnProperty(currentUserName)) {
          self[ flag ] = flagData[ 2 ][ currentUserName ];
        }
        else {
          self[ flag ] = flagData[ 1 ];
        }

        featureFlagSummary[ flag ] = self[ flag ];
      }
    }

    if(typeof window !== "undefined") {
      window.FEATURE_FLAGS = featureFlagSummary;
    }
  }
};

// generate the feature flags from the rawFlagData based on passed-in build configuration
featureFlagsDef.generateFeatureFlags(productionMode, gitUserName);

module.exports = featureFlagsDef;

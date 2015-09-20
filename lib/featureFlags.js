"use strict";

require("./symbols/typedefs");

var buildConfig = require("./buildConfig"),

  gitUserName,
  productionMode,
  featureFlagsDef = {};

/**
 * The logic to generate feature flags from buildConfig.featureFlagDefinitions
 *
 * @protected
 * @param {boolean} isProductionMode
 * @param {string} currentUserName
 * @returns {Object} summary map of feature flags generated
 */
featureFlagsDef.generateFeatureFlags = function(isProductionMode, currentUserName) {
  var flag,
    flagData,
    featureFlagSummary = {};

  // clear out any previously-computed feature flags
  for(flag in featureFlagsDef) {
    if(featureFlagsDef.hasOwnProperty(flag) && typeof featureFlagsDef[flag] !== "function") {
      delete featureFlagsDef[flag];
    }
  }

  // build out feature flags based on settings
  for(flag in buildConfig.featureFlagDefinitions) {
    if(buildConfig.featureFlagDefinitions.hasOwnProperty(flag)) {
      flagData = buildConfig.featureFlagDefinitions[flag];

      if(isProductionMode) {
        // use a production mode override for the current git user.name?
        if(flagData.length >= 4 && flagData[3] && flagData[3].hasOwnProperty(currentUserName)) {
          featureFlagsDef[flag] = flagData[3][currentUserName];
        }
        else {
          featureFlagsDef[flag] = flagData[0];
        }
      }
      else {
        // use a development mode override for the current git user.name?
        if(flagData.length >= 3 && flagData[2] && flagData[2].hasOwnProperty(currentUserName)) {
          featureFlagsDef[flag] = flagData[2][currentUserName];
        }
        else {
          featureFlagsDef[flag] = flagData[1];
        }
      }

      featureFlagSummary[flag] = featureFlagsDef[flag];
    }
  }

  return featureFlagSummary;
};

// immediately generate the feature flags from the buildConfig.featureFlagDefinitions based on the build configuration
gitUserName = typeof GIT_USERNAME !== "undefined" ? GIT_USERNAME : "";
productionMode = typeof PRODUCTION_MODE !== "undefined" ? PRODUCTION_MODE : false;
featureFlagsDef.generateFeatureFlags(productionMode, gitUserName);

// not providing a jsdoc @module declaration here even though there is a module.exports.  The build script
// auto-requires this module and it should never be manually require'd in our code

// Do not require() this module directly, this module contains the logic to generate featureFlags structures for the
// code.  It will be imported for you automatically by the build scripts into a namespace object named 'featureFlags'

module.exports = featureFlagsDef;

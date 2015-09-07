"use strict";

// typedefs useful to generated JSDoc's

// jshint -W098

/**
 * @typedef {Array.<(boolean|Object.<string,boolean>|undefined)>}
 * @property {boolean} "FeatureFlagData[0]" enable/disable the feature flag in production mode
 * @property {boolean} "FeatureFlagData[1]" enable/disable the feature flag in development mode
 * @property {(Object.<string,boolean>|undefined)} "FeatureFlagData[2]" optional mapping of git username to
 *           enable/disable flags used in development mode.  If the current git user's name matches a key in this
 *           map, then the Boolean value will override the value in FeatureFlagData[1].  Add your git user.name to this
 *           map to enable or disable a feature in development mode just for your user.  You can use this map to do
 *           enable feature flags in development that other developers will not see in their builds.  You can also use
 *           this map to disable feature flags in development for yourself that other developers normally would see.
 */
var FeatureFlagData;

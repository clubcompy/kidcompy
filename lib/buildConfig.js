"use strict";

var buildConfig,
  /**
   * <p>This raw flag data is used to build out the feature flags at run-time (for dev build) and build-time (for
   * production build).  If you need to define a new feature flag, this is the place to do it.
   *
   * <p>The keys in this object are the names of the feature flags that the build supports, the
   * values are {@link FeatureFlagData} structures that are converted to a Boolean according to the feature
   * flag computing rules
   *
   * @namespace
   */
  featureFlagDefinitions = {
    /**
     * Dummy feature flag description ** DELETE ME **
     *
     * @type {FeatureFlagData}
     */
    DEPRECATED_FUNCTION: [ false, false ],

    /**
     * Dummy feature flag description ** DELETE ME **
     *
     * @type {FeatureFlagData}
     */
    NEW_FEATURE: [ false, true, {} ],

    /**
     * Dummy feature flag description ** DELETE ME **
     *
     * @type {FeatureFlagData}
     */
    EXPERIMENTAL_THING: [ true, true ],

    /**
     * Dummy feature flag description ** DELETE ME **
     *
     * @type {FeatureFlagData}
     */
    SOMETHING_NEW_DAVE_IS_WORKING_ON: [ false, false, {
      woldie: true
    } ]
  };

buildConfig = {
  featureFlagDefinitions: featureFlagDefinitions
};

/**
 * require('./buildConfig') &rArr; &#123; featureFlagDefinitions: {@link featureFlagDefinitions} &#124;
 *
 * @module buildConfig
 */
module.exports = buildConfig;

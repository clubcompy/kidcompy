"use strict";

var buildConfig = {
  /**
   * <p>This raw flag data is used to build out the feature flags at run-time (for dev build) and build-time (for
   * production build).  If you need to define a new feature flag, this is the place to do it.
   *
   * <p>The keys in this object are the names of the feature flags that the build supports, the
   * values are {@link FeatureFlagData} structures that are converted to a Boolean according to the feature
   * flag computing rules
   *
   * @ignore
   */
  featureFlagDefinitions: {
    /**
     * Feature flag description
     * @type {boolean}
     * @memberof featureFlags
     */
    DEPRECATED_FUNCTION: /** @type {FeatureFlagData} */ [ false, false ],

    /**
     * Feature flag description
     * @type {boolean}
     * @memberof featureFlags
     */
    NEW_FEATURE: /** @type {FeatureFlagData} */ [ false, true, {} ],

    /**
     * Feature flag description
     * @type {boolean}
     * @memberof featureFlags
     */
    EXPERIMENTAL_THING: /** @type {FeatureFlagData} */ [ true, true ],

    /**
     * Feature flag description
     * @type {boolean}
     * @memberof featureFlags
     */
    SOMETHING_NEW_DAVE_IS_WORKING_ON: /** @type {FeatureFlagData} */ [ false, false, {
      woldie: true
    } ]
  }
};

/**
 * require('./buildConfig') &rArr; {@link buildConfig}
 *
 * @module buildConfig
 */
module.exports = buildConfig;

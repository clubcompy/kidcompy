/*
 Kidcompy - a virtual computer for kids
 Copyright (C) 2015  Woldrich, Inc.

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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

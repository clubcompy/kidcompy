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

// typedefs useful to generated JSDoc's

// jshint -W098

/**
 * @name FeatureFlagData
 * @typedef {Array.<(boolean|Object.<string,boolean>|undefined)>}
 * @property {boolean} "FeatureFlagData[0]" enable/disable the feature flag in production mode
 * @property {boolean} "FeatureFlagData[1]" enable/disable the feature flag in development mode
 * @property {(Object.<string,boolean>|undefined)} "FeatureFlagData[2]" optional mapping of git username to
 *           enable/disable flags used in development mode.  If the current git user's name matches a key in this
 *           map, then the Boolean value will override the value in FeatureFlagData[1].  Add your git user.name to this
 *           map to enable or disable a feature in development mode just for your user.  You can use this map to do
 *           enable feature flags in development that other developers will not see in their builds.  You can also use
 *           this map to disable feature flags in development for yourself that other developers normally would see.
 * @property {(Object.<string,boolean>|undefined)} "FeatureFlagData[3]" optional mapping of git username to
 *           enable/disable flags used in production mode.  If the current git user's name matches a key in this
 *           map, then the Boolean value will override the value in FeatureFlagData[0].  Add your git user.name to this
 *           map to enable or disable a feature in production mode just for your user.  You can use this map to
 *           test out on your local how a production build would look with a feature enabled.
 */
var FeatureFlagData;

/**
 * Original source data describing Kid-SCII character map data for a single character code
 *
 * @name KidsciiCharacter
 * @typedef {Object}
 * @property {!number} code
 * @property {!string} screenName
 * @property {!Array.<number>} charMap 8 or 16 number array according to nybbleCount
 * @property {!number} nybbleCount 4 == 16 pixel, 1bit character map, 2 == 8 pixel, 1bit character map
 * @property {!number} offset index into charMap for the start of the character data for this KidsciiCharacter
 */
var KidsciiCharacter;


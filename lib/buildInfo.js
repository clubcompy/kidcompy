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

/**
 * Static information about the build
 *
 * @final
 * @constructor
 */
function BuildInfo() {
  /**
   * Is this build of Kidcompy a production build?
   *
   * @type {boolean}
   */
  this.isProductionMode = PRODUCTION_MODE;

  /**
   * Kidcompy version number
   *
   * @type {string}
   */
  this.buildVersion = BUILD_VERSION;
}

/**
 * require("./buildInfo") &rArr; singleton of type {@link BuildInfo}
 *
 * @protected
 * @module buildInfo
 */
module.exports = (function() {
  // make a constant singleton instance that we can export
  var buildInfo = new BuildInfo();

  Object.freeze(buildInfo);

  return buildInfo;
})();

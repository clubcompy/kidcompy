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
 * @namespace
 */
var DetectHtml5Polyfill = {
  /**
   * check whether Html5 polyfills could be used by the host browser
   *
   * @param {function(Observable.<boolean>)} done callback called with a boolean.  If true, HTML5 Polyfills should be
   * loaded
   */
  check: function(done) {
    var missingObjectFreeze = !Object.freeze,
      missingArrayFrom = !Array.from,
      missingObjectDefineProperty = !Object.defineProperty,
      missingObjectAssign = !Object.assign,
      missingObjectGetOwnPropertyDescriptor = !Object.getOwnPropertyDescriptor,
      missingRequestAnimationFrame = !(window.requestAnimationFrame && window.cancelAnimationFrame),
      missingJson = typeof window.JSON === "undefined",
      missingPromises = false;

    if(SPLIT_BUNDLES) {
      kidcompy.Modernizr.on("promises", function(doesSupport) {
        missingPromises = !doesSupport;

        done(missingObjectFreeze || missingArrayFrom || missingObjectAssign || missingObjectDefineProperty ||
          missingObjectGetOwnPropertyDescriptor || missingRequestAnimationFrame || missingJson || missingPromises);
      });
    }
    else {
      // just assume we need the HTML5 polyfills if we're in dev mode
      done(true);
    }
  }
};

/**
 * require("./html5Polyfill/DetectHtml5Polyfill") &rArr; {@link DetectHtml5Polyfill}
 *
 * @protected
 * @module html5Polyfill/DetectHtml5Polyfill
 */
module.exports = DetectHtml5Polyfill;

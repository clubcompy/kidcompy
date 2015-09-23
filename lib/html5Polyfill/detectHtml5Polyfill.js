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
 *
 * @constructor
 */
function DetectHtml5Polyfill() {
}

/**
 * check whether Html5 polyfills could be used by the host browser
 *
 * @param {function(boolean)} done callback called with a boolean.  If true, HTML5 Polyfills should be loaded
 */
DetectHtml5Polyfill.prototype.check = function(done) {
  var missingObjectFreeze = !Object.freeze,
    missingPromises = false;

  if(missingObjectFreeze) {
    kidcompy.log("missing Object.freeze");
  }

  kidcompy.Modernizr.on("promises", function(doesSupport) {
    missingPromises = !doesSupport;

    if(missingPromises) {
      kidcompy.log("missing ES6 Promises");
    }

    done(missingObjectFreeze || missingPromises);
  });
};

/**
 * require("./html5Polyfill/detectHtml5Polyfill") &rArr; singleton instance of {@link DetectHtml5Polyfill}
 *
 * @module html5Polyfill/detectHtml5Polyfill
 */
module.exports = new DetectHtml5Polyfill();

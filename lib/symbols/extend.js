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
 * <p>Extend object with members shallow copied from another object
 *
 * <p>This is a convenience method for extending the kidcompy namespace.  This method DOES NOT export
 * the new members with non-mangled members.  If you want to export your new members, you must also
 * call exportPublicProperties() with the kidcompy object and the new members you want to export.
 *
 * @param {(Object|Function)} obj object or function to extend
 * @param {Object} extendWith source object
 */
function extend(obj, extendWith) {
  var prop;

  // jshint -W116
  if(obj && extendWith && obj != extendWith) {
    for(prop in extendWith) {
      if(extendWith.hasOwnProperty(prop)) {
        obj[prop] = extendWith[prop];
      }
    }
  }
}

/**
 * require("./symbols/extend") &rArr; {@link extend}
 *
 * @protected
 * @module symbols/extend
 */
module.exports = extend;

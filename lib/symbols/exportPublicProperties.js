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
 * <p>Export static properties from an object so that external callers have access to a non-mangled symbol in the
 * production environment
 *
 * <p>As a convention you should use the @public jsdoc tag only on exported members and symbols, this
 * should make it easier to search the code and have a good idea of what symbols we are exporting in production.
 *
 * @param {(Object|Function)} forObject object that has properties that will be exported to external callers
 * @param {Array.<Array.<*>>} properties Array of Array[2] containing String: export name and *: value to export
 */
function exportPublicProperties(forObject, properties) {
  var i, ii,
    exportData;

  for(i = 0, ii = properties.length; i < ii; i++) {
    exportData = properties[ i ];

    if(!PRODUCTION_MODE) {
      // we can do a little weak validation here in development mode to check if the exported symbol
      // has the same name on the object, should help to catch copy-pasta issues
      if(forObject[ exportData[ 0 ] ] !== exportData[ 1 ]) {
        throw new Error("exportPublicProperties export name '" + exportData[ 0 ] +
          "' did not match exported value");
      }
    }

    forObject[ exportData[ 0 ] ] = exportData[ 1 ];
  }
}

/**
 * require("./symbols/exportPublicProperties") &rArr; {@link exportPublicProperties}
 *
 * @module symbols/exportPublicProperties
 */
module.exports = exportPublicProperties;

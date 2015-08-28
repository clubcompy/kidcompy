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
 * require("./symbols/exportPublicProperties") &rArr; {@link function((Object|function),Array.<Array.<*>>)}
 *
 * @module symbols/exportPublicProperties
 */
module.exports = exportPublicProperties;

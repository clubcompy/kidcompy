"use strict";

/**
 * Export static properties from an object so that external callers have access to a non-mangled symbol in the
 * production environment
 *
 * @param {(Object|Function)} forObject object that has properties that will be exported to external callers
 * @param {Array.<Array.<*>>} properties Array of Array[2] containing String: export name and *: value to export
 */
function exportStaticProperties(forObject, properties) {
  var i, ii,
    exportData;

  for(i = 0, ii = properties.length; i < ii; i++) {
    exportData = properties[ i ];

    forObject[ exportData[ 0 ] ] = exportData[ 1 ];
  }
}

module.exports = exportStaticProperties;

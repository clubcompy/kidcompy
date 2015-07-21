"use strict";

/**
 * Export properties from a class' prototype so that external callers have access to a non-mangled symbol in the
 * production environment
 *
 * @param {Function} forClass constructor function for class whose prototype has properties that will be exported to
 *        external callers
 * @param {Array.<Array.<*>>} properties Array of Array[2] containing String: export name and *: value to export
 */
function exportPrototypeProperties(forClass, properties) {
  var i, ii,
    exportData;

  for(i = 0, ii = properties.length; i < ii; i++) {
    exportData = properties[ i ];

    if(!PRODUCTION_MODE) {
      // we can do a little weak validation here in development mode to check if the exported symbol
      // has the same name on the prototype, should help to catch copy-pasta issues
      if(forClass.prototype[ exportData[ 0 ] ] !== exportData[ 1 ]) {
        throw new Error("exportPrototypeProperties export name '" + exportData[ 0 ] +
                        "' did not match exported value");
      }
    }

    forClass.prototype[ exportData[ 0 ] ] = exportData[ 1 ];
  }
}

module.exports = exportPrototypeProperties;

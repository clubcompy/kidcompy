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
kidcompy.extend = function(obj, extendWith) {
  var prop;

  // jshint -W116
  if(obj && extendWith && obj != extendWith) {
    for(prop in extendWith) {
      if(extendWith.hasOwnProperty(prop)) {
        obj[prop] = extendWith[prop];
      }
    }
  }
};

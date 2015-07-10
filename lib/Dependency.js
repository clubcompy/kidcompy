"use strict";

/**
 * @constructor
 */
function Dependency() {

}

Dependency.prototype = {
  /**
   * @returns {string}
   */
  func: function() {
    return "I get called";
  }
};

module.exports = Dependency;

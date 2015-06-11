"use strict";

/**
 * @constructor
 */
function Dependency() {

}

Dependency.prototype = {
  /**
   * @returns {String}
   */
  func: function() {
    return "I ge  t called";
  }
};

module.exports = Dependency;

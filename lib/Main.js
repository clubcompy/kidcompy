"use strict";

// link in CSS styles - causes them to be loaded onto the page
require("./styles/kidcompy.scss");

var Dependency = require("./Dependency");

/**
 * @constructor
 */
function Main() {
}

Main.prototype = {
  /**
   * @returns {Number}
   */
  f: function() {
    return 6;
  },

  /**
   * @returns {Number}
   */
  g: function() {
    return (function() {
      return Dependency.func() + 1;
    })();
  }
};

module.exports = Main;

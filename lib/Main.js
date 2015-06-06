"use strict";

// link in CSS styles - causes them to be loaded onto the page
require("./styles/kidcompy.scss");

console.log("hello world");

/**
 * @constructor
 */
function Main() {
}

Main.prototype = {
  /**
   * @returns {number}
   */
  f: function() {
    return 5;
  },

  /**
   * @returns {number}
   */
  g: function() {
    return 2;
  }
};

module.exports = window.Main = Main;
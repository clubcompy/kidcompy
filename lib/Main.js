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
   * @returns {number}
   */
  f: function() {
    if(featureFlags.DEPRECATED_FUNCTION) {
      console.log("dave was here deprecated");
    }

    if(featureFlags.EXPERIMENTAL_THING) {
      console.log("dave was here experimental");
    }

    if(featureFlags.NEW_FEATURE) {
      console.log("dave was here new feature");
    }

    if(featureFlags.SOMETHING_NEW_DAVE_IS_WORKING_ON) {
      console.log("dave was here just woldie");
    }

    return 6;
  },

  /**
   * @returns {number}
   */
  g: function() {
    return Dependency.func() + 1;
  }
};

setInterval(function() {
  document.getElementById("test").innerHTML += (new Main()).f() + "<br />";
}, 1000);

/*
 * Exports
 */

exportPrototypeProperties(Main, [
  ["f", Main.prototype.f],
  ["g", Main.prototype.g]
]);
exportGlobal("main", Main);

/**
 * {@link Main}
 *
 * @module Main
 */
module.exports = Main;

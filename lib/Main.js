"use strict";

var _ = require("lodash"),
  Rx = require("rx/dist/rx.all.compat"),
  styles = require("./styles/kidcompy.scss");

console.log("hello world");

function Main() {
}

Main.prototype = {
  f : function() {
    return 5;
  },

  g : function() {
    return 2;
  }
};

module.exports = window.Main = Main;
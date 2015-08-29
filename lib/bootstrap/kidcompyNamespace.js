"use strict";

// make the global kidcompy namespace if it doesn't already exist
if(typeof window["kidcompy"] === "undefined") {
  window["kidcompy"] = {};
}

// no module.exports here ... this module gets imported only once and the kidcompy symbol is added to the global scope.
// Access the kidcompy object directly with the assumption that the forward declarations in the externs.js will connect
// you with publicly exported properties

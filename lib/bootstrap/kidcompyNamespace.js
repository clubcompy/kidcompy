"use strict";

// make the global kidcompy namespace if it doesn't already exist
if(typeof window["kidcompy"] === "undefined") {
  window["kidcompy"] = {};
}

// no module.exports here ... this module gets imported only once and the kidcompy symbol is added to the global scope.
// You can access the kidcompy object directly because the kidcompy object is forward declared in the externs.js

// jscs: disable

require("../node_modules/es5-shim/es5-shim.js");
require("../node_modules/es5-shim/es5-sham.js");
require("../lib/bootstrap/testingMain.js");

// This gets replaced by karma webpack with the updated files on rebuild
var __karmaWebpackManifest__ = [];

// keep track if this is the first run of karma in this browser session, lets us trigger a full test run on refresh
if(typeof window.top.firstRun === "undefined") {
  window.top.firstRun = true;
}

// require all modules ending in ".spec" or ".comp" from the
// current directory and all subdirectories
var testsContext = require.context("../lib", true, /(.spec|.comp)$/);

function inManifest(path) {
  return __karmaWebpackManifest__.indexOf(path) >= 0;
}

var runnable = testsContext.keys().filter(inManifest);

// Run all tests if we didn't find any changes
if (!runnable.length || window.top.firstRun) {
  runnable = testsContext.keys();
}

runnable.forEach(testsContext);

window.top.firstRun = false;

/*
 Kidcompy - a virtual computer for kids
 Copyright (C) 2015  Woldrich, Inc.

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";

var exportPublicProperties = require("../symbols/exportPublicProperties"),
  initialized = false;

/**
 * Called by lifecycle script to start Html5 Polyfills and ES6 polyfills
 *
 * @public
 * @param {function()} done callback to be called once HTML5 polyfills init is complete
 */
kidcompy.initializeHtml5Polyfills = function(done) {
  if(initialized) {
    return;
  }

  initialized = true;

  // Object.freeze can't be polyfilled, so just sham it
  Object.freeze = Object.freeze || function() {};

  // Make sure we have es6 promises on the window object
  require("es6-promise").polyfill();

  kidcompy.log("html5Polyfill loaded");
  done();
};

// global exports
exportPublicProperties(kidcompy, [
  ["initializeHtml5Polyfills", kidcompy.initializeHtml5Polyfills]
]);

exportPublicProperties(Object, [
  ["freeze", Object.freeze]
]);

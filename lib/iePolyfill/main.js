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
 * Called by bootstrap script to start the Legacy IE Polyfills
 *
 * @public
 * @param {function(boolean)} done callback to be called once the IE Polyfills init is complete
 */
kidcompy.initializeIePolyfills = function(done) {
  if(initialized) {
    return;
  }

  // install the JSON polyfill - this should add JSON symbol to the global scope
  require("json3");

  initialized = true;

  // kidcompy.log("IePolyfill loaded");
  kidcompy.iePolyfills = true;

  done(true);
};

// global exports
exportPublicProperties(kidcompy, [
  ["initializeIePolyfills", kidcompy.initializeIePolyfills]
]);

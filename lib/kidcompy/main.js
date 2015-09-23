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
 * Called by the bootstrap script to start initialing the kidcompy module
 *
 * @public
 * @param {function()} done callback called when the kidcompy module is initialized
 */
kidcompy.initialize = function(done) {
  if(initialized) {
    return;
  }

  initialized = true;
  kidcompy.log("kidcompy initialized");

  done();
};

// global exports
exportPublicProperties(kidcompy, [
  ["initialize", kidcompy.initialize]
]);

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

var FlipBuffer = require("./FlipBuffer");

/**
 * KidcompyHost
 *
 * @constructor
 * @param {!Element} theDiv This is the element where the compy will be displayed, input captured, etc.
 */
function KidcompyHost(theDiv) {
  var self = this;

  if(!theDiv) {
    throw new Error("theDiv was falsy");
  }

  /**
   * @name KidcompyHost#rootId
   * @type {string}
   */
  self.rootId = theDiv.getAttribute("id");

  /**
   * @name KidcompyHost#flipBuffers
   * @type {Array.<FlipBuffer>}
   */
  self.flipBuffers = KidcompyHost.attachFlipBuffers(theDiv);

  if(!self.rootId || !self.rootId.length) {
    throw new Error("theDiv must have an id");
  }
}

/**
 * Create FlipBuffers for constructor
 *
 * @nocollapse
 * @param {!Element} theDiv the div
 * @returns {Array.<FlipBuffer>} array[2] of FlipBuffers
 */
KidcompyHost.attachFlipBuffers = function(theDiv) {
  return [
    new FlipBuffer(theDiv, 0),
    new FlipBuffer(theDiv, 1)
  ];
};

/**
 * <strong>require("./kidcompy/KidcompyHost")</strong> &rArr; {@link KidcompyHost}
 *
 * @protected
 * @module kidcompy/KidcompyHost
 */
module.exports = KidcompyHost;

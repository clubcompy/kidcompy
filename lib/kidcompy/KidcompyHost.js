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

var FlipBuffer = require("./FlipBuffer"),
  DomMutationsLog = require("./DomMutationsLog"),
  constants = require("./constants");

/**
 * KidcompyHost
 *
 * @constructor
 * @param {!Element} theDiv This is the element where the compy will be displayed, input captured, etc.
 * @param {?DomMutationsLog=} mutationsLog optional log if you want to track the mutations made to the dom here
 */
function KidcompyHost(theDiv, mutationsLog) {
  var self = this,
    resetLogWhenDone = false;

  if(!theDiv) {
    throw new Error("theDiv was falsy");
  }

  if(!mutationsLog) {
    mutationsLog = new DomMutationsLog();
    resetLogWhenDone = true;
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
  self.flipBuffers = self.attachFlipBuffers(theDiv, mutationsLog);

  /**
   * ANNOY-A-TRON: Consider building a registry or other properties sheet that can be passed around between
   * actors in the system to store these kinds of values
   *
   * @name KidcompyHost#displayWidth
   * @type {number}
   */
  self.displayWidth = constants.DEFAULT_DISPLAY_WIDTH;

  /**
   * @name KidcompyHost#displayHeight
   * @type {number}
   */
  self.displayHeight = constants.DEFAULT_DISPLAY_HEIGHT;

  if(resetLogWhenDone) {
    // call mutationsLog.reset() here to free up the memory from our temporary DomMutationsLog
    mutationsLog.reset();
  }

  if(!self.rootId || !self.rootId.length) {
    throw new Error("theDiv must have an id");
  }
}

/**
 * Useful flag to test that this object is a KidcompyHost
 *
 * @const
 * @package
 * @type {boolean}
 */
KidcompyHost.prototype.isKidcompyHost = true;

/**
 * Create FlipBuffers for constructor
 *
 * @package
 * @param {!Element} theDiv the div
 * @param {!DomMutationsLog} mutationsLog
 * @returns {Array.<FlipBuffer>} array of 2 FlipBuffers
 */
KidcompyHost.prototype.attachFlipBuffers = function(theDiv, mutationsLog) {
  var self = this;

  return [
    new FlipBuffer(self, theDiv, 0, mutationsLog),
    new FlipBuffer(self, theDiv, 1, mutationsLog)
  ];
};

/**
 * <strong>require("./kidcompy/KidcompyHost")</strong> &rArr; {@link KidcompyHost}
 *
 * @protected
 * @module kidcompy/KidcompyHost
 */
module.exports = KidcompyHost;

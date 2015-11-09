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
  DomNodeSurrogate = require("./DomNodeSurrogate"),
  DomNodeType = require("./DomNodeType"),
  DomMutationsLog = require("./DomMutationsLog"),
  SystemProperties = require("./SystemProperties"),
  constants = require("./constants");

// apply global defaults to the system properties as this script loads

SystemProperties.setGlobalDefaultProperty(constants.KEY_DISPLAY_WIDTH, constants.DEFAULT_DISPLAY_WIDTH);
SystemProperties.setGlobalDefaultProperty(constants.KEY_DISPLAY_HEIGHT, constants.DEFAULT_DISPLAY_HEIGHT);

/**
 * KidcompyHost
 *
 * @constructor
 * @extends {DomNodeSurrogate}
 * @param {!(Node|Element)} theDiv This is the element where the compy will be displayed, input captured, etc.
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

  /* call super constructor */
  DomNodeSurrogate.call(self, null, theDiv.getAttribute("id"), DomNodeType.KIDCOMPY_HOST);

  /**
   * @name KidcompyHost#systemProperties
   * @type {SystemProperties}
   * @package
   */
  self.systemProperties = new SystemProperties();

  /**
   * @name KidcompyHost#flipBuffers
   * @type {Array.<FlipBuffer>}
   */
  self.flipBuffers = KidcompyHost.attachFlipBuffers(self, theDiv, self.systemProperties, mutationsLog);

  if(resetLogWhenDone) {
    // call mutationsLog.reset() here to free up the memory from our temporary DomMutationsLog
    mutationsLog.reset();
  }

  if(!self.nodeId || !self.nodeId.length) {
    throw new Error("theDiv must have an id");
  }
}

KidcompyHost.prototype = Object.create(DomNodeSurrogate.prototype);

Object.assign(KidcompyHost, /** @lends {KidcompyHost} */ {
  /**
   * Create FlipBuffers for constructor
   *
   * @package
   * @param {!Object} kidcompyHost code assumes this will be of type {@link KidcompyHost}
   * @param {!Element} theDiv the div
   * @param {!SystemProperties} systemProperties system properties
   * @param {!DomMutationsLog} mutationsLog
   * @returns {Array.<FlipBuffer>} array of 2 FlipBuffers
   */
  attachFlipBuffers: function(kidcompyHost, theDiv, systemProperties, mutationsLog) {
    return [
      new FlipBuffer(kidcompyHost, theDiv, 0, systemProperties, mutationsLog),
      new FlipBuffer(kidcompyHost, theDiv, 1, systemProperties, mutationsLog)
    ];
  }
});

/**
 * <strong>require("./kidcompy/KidcompyHost")</strong> &rArr; {@link KidcompyHost}
 *
 * @protected
 * @module kidcompy/KidcompyHost
 */
module.exports = KidcompyHost;

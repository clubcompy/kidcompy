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
  DomNodeCache = require("./DomNodeCache"),
  DomMutationsLog = require("./DomMutationsLog"),
  SystemProperties = require("./SystemProperties"),
  constants = require("./constants"),
  exportPublicProperties = require("../symbols/exportPublicProperties");

// apply global defaults to the system properties as this script loads

SystemProperties.setGlobalDefaultProperty(constants.KEY_DISPLAY_WIDTH, constants.DEFAULT_DISPLAY_WIDTH);
SystemProperties.setGlobalDefaultProperty(constants.KEY_DISPLAY_HEIGHT, constants.DEFAULT_DISPLAY_HEIGHT);

/**
 * KidcompyHost
 *
 * @constructor
 * @extends {DomNodeSurrogate}
 * @param {!string} nodeId This is ID of the DOM Node where the compy will be displayed, input captured, etc.
 * @param {DomNodeCache=} nodeCache optional cache that will be used to find DOM Nodes related to this KidcompyHost
 * @param {DomMutationsLog=} mutationsLog optional log if you want to track the mutations made to the dom here
 */
function KidcompyHost(nodeId, nodeCache, mutationsLog) {
  var self = this,
    resetLogWhenDone = false;

  if(!nodeId) {
    throw new Error("theDiv was falsy");
  }

  // make a temporary DomMutationsLog if one wasn't provided by the caller
  if(!mutationsLog) {
    resetLogWhenDone = true;
    mutationsLog = new DomMutationsLog();
  }

  if(!nodeCache) {
    nodeCache = new DomNodeCache();
  }

  /* call super constructor */
  DomNodeSurrogate.call(self, null, nodeId, DomNodeType.KIDCOMPY_HOST, nodeCache, mutationsLog);

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
  self.flipBuffers = KidcompyHost.attachFlipBuffers(self, nodeCache, self.systemProperties,
    mutationsLog);

  if(resetLogWhenDone) {
    // call mutationsLog.reset() here to free up the memory from our temporary DomMutationsLog
    mutationsLog.reset();
  }

  if(!self.nodeId || !self.nodeId.length) {
    throw new Error("theDiv must have an id");
  }

  // Export some of the internals for the time being so they can be accessed directly from the harness
  exportPublicProperties(self, [
    [ "flipBuffers", self.flipBuffers ]
  ]);
}

KidcompyHost.prototype = Object.create(DomNodeSurrogate.prototype);

Object.assign(KidcompyHost, /** @lends {KidcompyHost} */ {
  /**
   * Create FlipBuffers for constructor
   *
   * @package
   * @param {!DomNodeSurrogate} kidcompyHost code assumes this will be of type {@link KidcompyHost}
   * @param {!DomNodeCache} nodeCache the DomNodeCache used to find and cache nodes in the DOM
   * @param {!SystemProperties} systemProperties system properties
   * @param {!DomMutationsLog} mutationsLog
   * @returns {Array.<FlipBuffer>} array of 2 FlipBuffers
   */
  attachFlipBuffers: function(kidcompyHost, nodeCache, systemProperties, mutationsLog) {
    return [
      new FlipBuffer(kidcompyHost, nodeCache, 0, systemProperties, mutationsLog),
      new FlipBuffer(kidcompyHost, nodeCache, 1, systemProperties, mutationsLog)
    ];
  }
});

// make this available as a public export
kidcompy["KidcompyHost"] = KidcompyHost;

/**
 * <strong>require("./kidcompy/KidcompyHost")</strong> &rArr; {@link KidcompyHost}
 *
 * @protected
 * @module kidcompy/KidcompyHost
 */
module.exports = KidcompyHost;

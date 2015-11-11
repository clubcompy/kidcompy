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

// jshint -W098
var DomTools = require("./DomTools"),
  DomNodeType = require("./DomNodeType"),
  DomNodeSurrogate = require("./DomNodeSurrogate"),
  DomMutationsLog = require("./DomMutationsLog"),
  Playfield = require("./Playfield"),
  SystemProperties = require("./SystemProperties"),
  exportPublicProperties = require("../symbols/exportPublicProperties");

/**
 * Two FlipBuffers are stacked atop one another and the next frame of animation for the scene is rendered
 * to the back one.  When it the back buffer's scene is complete and it is time to flip that buffer to the
 * foreground, then the front buffer is moved to the back and the back buffer becomes visible.  The front
 * buffer then becomes the back buffer and the cycle starts over again.  Ideally, flipbuffers will do this
 * 60 times per second.
 *
 * @constructor
 * @extends {DomNodeSurrogate}
 * @param {!DomNodeSurrogate} kidcompyHost parent {@link KidcompyHost} that owns this FlipBuffer
 * @param {!DomNodeCache} nodeCache the KidcompyHost's root div element
 * @param {!number} ordinal the unique ordinal for this FlipBuffer under the KidcompyHost
 * @param {!SystemProperties} systemProperties system properties for this compy instance
 * @param {!DomMutationsLog} mutationsLog
 */
function FlipBuffer(kidcompyHost, nodeCache, ordinal, systemProperties, mutationsLog) {
  var self = this;

  if(!kidcompyHost || kidcompyHost.nodeType !== DomNodeType.KIDCOMPY_HOST) {
    throw new Error("Invalid KidcompyHost");
  }

  /* call super constructor */
  DomNodeSurrogate.call(self, kidcompyHost, "f" + ordinal, DomNodeType.FLIPBUFFER, nodeCache, mutationsLog);

  /**
   * @name FlipBuffer#systemProperties
   * @type {!SystemProperties}
   */
  self.systemProperties = systemProperties;

  /**
   * @name FlipBuffer#playfields
   * @type {!Array.<Playfield>}
   */
  self.playfields = self.createPlayfields(nodeCache, mutationsLog);

  // Export some of the internals for the time being so they can be accessed directly from the harness
  exportPublicProperties(self, [
    [ "playfields", self.playfields ]
  ]);
}

FlipBuffer.prototype = Object.create(DomNodeSurrogate.prototype);

/**
 * Create playfields for init
 *
 * @package
 * @param {!DomNodeCache} nodeCache
 * @param {!DomMutationsLog} mutationsLog
 * @returns {Array.<Playfield>}
 */
FlipBuffer.prototype.createPlayfields = function(nodeCache, mutationsLog) {
  var self = this,
    plays = [],
    i, ii;

  // construct and attach your playfields
  for(i = 0, ii = 8; i < ii; i++) {
    plays.push(new Playfield(self, nodeCache, i, self.systemProperties, mutationsLog));
  }

  return plays;
};

/**
 * <strong>require("./kidcompy/FlipBuffer")</strong> &rArr; {@link FlipBuffer}
 *
 * @protected
 * @module kidcompy/FlipBuffer
 */
module.exports = FlipBuffer;

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
  DomMutationsLog = require("./DomMutationsLog"),
  Playfield = require("./Playfield"),
  SystemProperties = require("./SystemProperties");

/**
 * FlipBuffer
 *
 * @constructor
 * @param {!Object} kidcompyHost parent {@link KidcompyHost} that owns this FlipBuffer
 * @param {!(Node|Element)} rootDiv the KidcompyHost's root div element
 * @param {!number} ordinal the unique ordinal for this FlipBuffer under the KidcompyHost
 * @param {!SystemProperties} systemProperties system properties for this compy instance
 * @param {!DomMutationsLog} mutationsLog
 */
function FlipBuffer(kidcompyHost, rootDiv, ordinal, systemProperties, mutationsLog) {
  var flipBufferDiv = document.createElement("div");

  if(!kidcompyHost || !kidcompyHost.isKidcompyHost) {
    throw new Error("Invalid KidcompyHost");
  }

  /**
   * @name FlipBuffer#parent
   * @type {!Object}
   */
  this.parent = kidcompyHost;

  /**
   * @name FlipBuffer#classId
   * @type {!string}
   */
  this.classId = "f" + ordinal;

  /**
   * @name FlipBuffer#systemProperties
   * @type {!SystemProperties}
   */
  this.systemProperties = systemProperties;

  /**
   * Useful internal flag to prove that the this is a FlipBuffer
   *
   * @readonly
   * @package
   * @name FlipBuffer#isFlipBuffer
   * @type {boolean}
   */
  this.isFlipBuffer = true;

  /**
   * @name FlipBuffer#playfields
   * @type {!Array.<Playfield>}
   */
  this.playfields = this.createPlayfields(flipBufferDiv, mutationsLog);

  DomTools.addClass(flipBufferDiv, this.classId);
  mutationsLog.appendChild(rootDiv, flipBufferDiv);
}

/**
 * Create playfields for init
 *
 * @package
 * @param {!(Node|Element)} flipBufferDiv
 * @param {!DomMutationsLog} mutationsLog
 * @returns {Array.<Playfield>}
 */
FlipBuffer.prototype.createPlayfields = function(flipBufferDiv, mutationsLog) {
  var self = this,
    plays = [],
    i, ii;

  // construct and attach your playfields
  for(i = 0, ii = 8; i < ii; i++) {
    plays.push(new Playfield(self, flipBufferDiv, i, self.systemProperties, mutationsLog));
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

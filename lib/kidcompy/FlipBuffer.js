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
  extend = require("../symbols/extend"),
  DomMutationsLog = require("./DomMutationsLog"),
  Playfield = require("./Playfield");

/**
 * FlipBuffer
 *
 * @constructor
 * @param {!(Node|Element)} rootDiv the KidcompyHost's root div element
 * @param {!number} ordinal the unique ordinal for this FlipBuffer under the KidcompyHost
 * @param {!DomMutationsLog} mutationsLog
 */
function FlipBuffer(rootDiv, ordinal, mutationsLog) {
  var self = this,
    flipBufferDiv = document.createElement("div");

  /**
   * @name FlipBuffer#classId
   * @type {string}
   */
  self.classId = "f" + ordinal;

  /**
   * @name FlipBuffer#playfields
   * @type {Array.<Playfield>}
   */
  self.playfields = self.createPlayfields(flipBufferDiv, mutationsLog);

  DomTools.addClass(flipBufferDiv, self.classId);
  mutationsLog.appendChild(rootDiv, flipBufferDiv);
}

/**
 * Useful flag to test that this object is a FlipBuffer
 *
 * @const
 * @package
 * @type {boolean}
 */
FlipBuffer.prototype.isFlipBuffer = true;

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
    plays.push(new Playfield(self, flipBufferDiv, i, mutationsLog));
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

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

var domTools = require("./domTools"),
  Playfield = require("./Playfield");

/**
 * FlipBuffer
 *
 * @constructor
 * @param {Element} rootDiv the KidcompyHost's root div element
 * @param {number} ordinal the unique ordinal for this FlipBuffer under the KidcompyHost
 * @param {DomMutationsLog} mutationsLog
 */
function FlipBuffer(rootDiv, ordinal, mutationsLog) {
  var self = this,
    flipBufferDiv = document.createElement("div");

  /**
   * @name FlipBuffer#id
   * @type {string}
   */
  self.id = "f" + ordinal;

  /**
   *
   * @type {Array}
   */
  self.playfields = (function() {
    var plays = [],
      i, ii;

    // construct and attach your playfields
    for(i = 0, ii = 8; i < ii; i++) {
      plays.push(new Playfield(self, flipBufferDiv, i, mutationsLog));
    }

    return plays;
  })();

  domTools.addClass(flipBufferDiv, self.id);
  mutationsLog.appendChild(rootDiv, flipBufferDiv);
}

/**
 * <strong>require("./kidcompy/FlipBuffer")</strong> &rArr; {@link FlipBuffer}
 *
 * @protected
 * @module kidcompy/FlipBuffer
 */
module.exports = FlipBuffer;

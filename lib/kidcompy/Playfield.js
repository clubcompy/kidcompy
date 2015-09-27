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

var _ = require("../../node_modules/lodash/index.js");

/**
 * Playfield - an independently scrollable video plane on the Compy display
 *
 * @param {!FlipBuffer} flipBuffer
 * @param {!Node} flipBufferDiv
 * @param {!number} ordinal
 * @param {DomMutationsLog} mutationsLog
 * @constructor
 */
function Playfield(flipBuffer, flipBufferDiv, ordinal, mutationsLog) {
  var self = this,
    playfieldDiv;

  if(!_.isObject(flipBuffer) || !_.isElement(flipBufferDiv)) {
    throw new Error("parent/div must not be null");
  }

  /**
   * @name Playfield#parent
   * @type {FlipBuffer}
   */
  self.parent = flipBuffer;

  /**
   * @name Playfield#id
   * @type {string}
   */
  self.id = "p" + ordinal;

  playfieldDiv = document.createElement("div");
  mutationsLog.appendChild(flipBufferDiv, playfieldDiv);
}

/**
 * <strong>require("./kidcompy/Playfield")</strong> &rArr; {@link Playfield}
 *
 * @protected
 * @module kidcompy/Playfield
 */
module.exports = Playfield;

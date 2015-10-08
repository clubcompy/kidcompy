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
var _ = require("./tools/Lowbar"),
  extend = require("../symbols/extend"),
  DomTools = require("./DomTools"),
  DomMutationsLog = require("./DomMutationsLog");

/**
 * Playfield - an independently scrollable video plane on the Compy display
 *
 * @param {!Object} flipBuffer parent FlipBuffer for this Playfield.  Must be of {@link FlipBuffer} type
 * @param {!(Node|Element)} flipBufferDiv parent FlipBuffer's dom Element.
 * @param {!number} ordinal
 * @param {!DomMutationsLog} mutationsLog
 * @constructor
 */
function Playfield(flipBuffer, flipBufferDiv, ordinal, mutationsLog) {
  var self = this,
    playfieldDiv;

  if(!flipBuffer || !flipBuffer.isFlipBuffer) {
    throw new Error("Invalid FlipBuffer");
  }

  if(!_.isElement(flipBufferDiv)) {
    throw new Error("parent/div must not be null");
  }

  /**
   * The owning FlipBuffer
   *
   * @name Playfield#parent
   * @type {Object}
   */
  self.parent = flipBuffer;

  /**
   * @name Playfield#classId
   * @type {string}
   */
  self.classId = "p" + ordinal;

  playfieldDiv = document.createElement("div");
  DomTools.addClass(playfieldDiv, self.classId);
  mutationsLog.appendChild(flipBufferDiv, playfieldDiv);

  // we need canvases, four of them
}

/**
 * Static members of Playfield class
 */
extend(Playfield, /** @lends Playfield */ {
  /**
   * Create the four canvases managed by the Playfield
   *
   * @package
   * @param {!(Element|Node)} playfieldDiv
   * @param {!DomMutationsLog} domMutationsLog
   */
  createCanvases: function(playfieldDiv, domMutationsLog) {
    var i, canvas;

    for(i = 0; i < 4; i++) {
      canvas = document.createElement("canvas");
      DomTools.addClass(canvas, "c" + i);

      domMutationsLog.appendChild(playfieldDiv, canvas);
    }
  }
});

/**
 * <strong>require("./kidcompy/Playfield")</strong> &rArr; {@link Playfield}
 *
 * @protected
 * @module kidcompy/Playfield
 */
module.exports = Playfield;

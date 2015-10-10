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
  constants = require("./constants"),
  extend = require("../symbols/extend"),
  DomTools = require("./DomTools"),
  DomMutationsLog = require("./DomMutationsLog");

/**
 * Playfield - an independently scrollable video plane on the Compy display
 *
 * @param {!Object} flipBuffer parent FlipBuffer for this Playfield.  Must be of {@link FlipBuffer} type
 * @param {!(Node|Element)} flipBufferDiv parent FlipBuffer's dom Element.
 * @param {!number} ordinal
 * @param {!SystemProperties} systemProperties
 * @param {!DomMutationsLog} mutationsLog
 * @constructor
 */
function Playfield(flipBuffer, flipBufferDiv, ordinal, systemProperties, mutationsLog) {
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

  /**
   * @name Playfield#systemProperties
   * @type {SystemProperties}
   */
  self.systemProperties = systemProperties;

  playfieldDiv = document.createElement("div");
  DomTools.addClass(playfieldDiv, self.classId);
  mutationsLog.appendChild(flipBufferDiv, playfieldDiv);

  // we need canvases, four of them
  // Playfield.createCanvases(playfieldDiv, mutationsLog);
}

extend(Playfield, /** @lends {Playfield} */ {
  /**
   * Create the four canvases managed by the Playfield
   *
   * @package
   * @param {!(Element|Node)} playfieldDiv
   * @param {!SystemProperties} systemProperties
   * @param {!DomMutationsLog} domMutationsLog
   */
  createCanvases: function(playfieldDiv, systemProperties, domMutationsLog) {
    var i, canvas;

    for(i = 0; i < 4; i++) {
      canvas = document.createElement("canvas");
      DomTools.addClass(canvas, "c" + i);

      DomTools.setInlineStyle(canvas, "width", systemProperties.getNumberProperty(constants.KEY_DISPLAY_WIDTH) + "px");
      DomTools.setInlineStyle(canvas, "height", systemProperties.getNumberProperty(constants.KEY_DISPLAY_HEIGHT) + "px");

      domMutationsLog.appendChild(playfieldDiv, canvas);
    }
  }
});

/**
 * Get the (visible) canvas width
 *
 * @returns {!number} canvas width
 */
Playfield.prototype.getCanvasWidth = function() {
  // for now, just return this compy instance's system property.  In the future it might be computed
  return this.systemProperties.getNumberProperty(constants.KEY_DISPLAY_WIDTH);
};

/**
 * Get the (visible) canvas height
 *
 * @returns {!number} canvas height
 */
Playfield.prototype.getCanvasHeight = function() {
  // for now, just return this compy instance's system property.  In the future it might be computed
  return this.systemProperties.getNumberProperty(constants.KEY_DISPLAY_HEIGHT);
};

/**
 * <strong>require("./kidcompy/Playfield")</strong> &rArr; {@link Playfield}
 *
 * @protected
 * @module kidcompy/Playfield
 */
module.exports = Playfield;

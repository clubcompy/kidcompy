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
var _ = require("./tools/lowbar"),
  constants = require("./constants"),
  DomNodeType = require("./DomNodeType"),
  DomNodeSurrogate = require("./DomNodeSurrogate"),
  DomTools = require("./DomTools"),
  SystemProperties = require("./SystemProperties"),
  CharacterMap = require("./CharacterMap"),
  DomMutationsLog = require("./DomMutationsLog"),
  exportPublicProperties = require("../symbols/exportPublicProperties"),
  kidscii = require("./kidscii/kid-SCII");

/**
 * Playfield - an independently scrollable video plane on the Compy display
 *
 * @constructor
 * @extends {DomNodeSurrogate}
 * @param {!DomNodeSurrogate} flipBuffer parent FlipBuffer for this Playfield.  Must be of {@link FlipBuffer} type
 * @param {!DomNodeCache} nodeCache DOM Node cache
 * @param {!number} ordinal
 * @param {!boolean} isLast is this the last Playfield adde to the flipBuffer parent?
 * @param {!Document} ownerDocument owner DOM Document
 * @param {!SystemProperties} systemProperties
 * @param {!DomMutationsLog} mutationsLog
 */
function Playfield(flipBuffer, nodeCache, ordinal, isLast, ownerDocument, systemProperties, mutationsLog) {
  var self = this,
    playfieldDiv;

  if(!flipBuffer || flipBuffer.nodeType !== DomNodeType.FLIPBUFFER) {
    throw new Error("Invalid FlipBuffer");
  }

  /* call super constructor */
  DomNodeSurrogate.call(self, flipBuffer, "p" + ordinal, ownerDocument, DomNodeType.PLAYFIELD, nodeCache,
    mutationsLog);

  /**
   * @name Playfield#systemProperties
   * @type {SystemProperties}
   */
  self.systemProperties = systemProperties;

  /**
   * The integer X position of the top-left-most canvas visible to the user relative to the Playfield's containing
   * div
   *
   * @name Playfield#canvasPositionX
   * @type {number}
   */
  self.canvasPositionX = 0;

  /**
   * The integer Y position of the top-left-most canvas visible to the user relative to the Playfield's containing
   * div
   *
   * @name Playfield#canvasPositionY
   * @type {number}
   */
  self.canvasPositionY = 0;

  /**
   * Index of nested canvas that is currently positioned as the most top-left-most canvas that is visible to the
   * user.  (Can be an integer number from 0-3.)
   *
   * @name Playfield#topLeftCanvas
   * @type {number}
   */
  self.topLeftCanvas = 0;

  // get the playfieldDiv so we can style it and create and position the canvases
  playfieldDiv = self.nodeCache.findDomNode(self);

  // Apply css styling to the playfield
  DomTools.addClass(playfieldDiv, "kcPlayfield");
  if(isLast) {
    DomTools.addClass(playfieldDiv, "last");
  }

  var height = systemProperties.getNumberProperty(constants.KEY_DISPLAY_HEIGHT),
    width = systemProperties.getNumberProperty(constants.KEY_DISPLAY_WIDTH),
    heightPx = height + "px",
    widthPx = width + "px";

  // before we do anything with the scrollableCanvas, force the playfield to the same width/height as
  // the kcClip div that will get created.  kcClip is absolute positioned, so it wouldn't prop open the parent
  // playfield's div otherwise
  DomTools.setInlineStyles(nodeCache.findDomNode(self), {
    width: widthPx,
    height: heightPx
  });

  /**
   * @name Playfield#scrollableCanvas
   * @type {ScrollableCanvasBase}
   */
  self.scrollableCanvas = kidcompy.createScrollableCanvas(self, ownerDocument, nodeCache, self.systemProperties,
    mutationsLog);
}

// Playfield extends DomNodeSurrogate
Playfield.prototype = Object.create(DomNodeSurrogate.prototype);

/**
 * Map of character code to original Kid-SCII character data
 *
 * @type {Object.<string, KidsciiCharacter>}
 */
Playfield.kidsciiCharacterData = _.transform(kidscii.maps, function(accumulator, charData) {
  // jshint -W016
  charData.charMap = _.map(_.range(charData.nybbleCount << 2), function(rowIndex) {
    var startingChar = charData.offset + rowIndex * charData.nybbleCount;

    return parseInt(kidscii.data.substring(startingChar, startingChar + charData.nybbleCount), 16);
  });

  accumulator["" + charData.code] = charData;
}, {});

// release the kidscii character map hexadecimal data since we won't use it again
kidscii.data = null;

/**
 * Fill a rectangular area in the visible playfield
 *
 * @param {!number} left X offset from canvasPositionX of the topLeftCanvas
 * @param {!number} top Y offset from canvasPositionY of the topLeftCanvas
 * @param {!number} width width of the rectangle in pixels
 * @param {!number} height height of the rectangle in pixels
 * @param {!(string|CanvasGradient|CanvasPattern)} fillStyle RGB color (like #abcdef), CanvasGradient, or CanvasPattern
 */
Playfield.prototype.fillRectangle = function(left, top, width, height, fillStyle) {
  var self = this;

  self.scrollableCanvas.fillRectangle(left, top, width, height, fillStyle);
};

/**
 * @param {!number} characterCode assumes an integer number between 0 and 65535.
 * @param {!boolean} inverted should the character map be inverted?
 * @returns {!CharacterMap}
 */
Playfield.prototype.getCharacterMap = function(characterCode, inverted) {
  var characterMap = new CharacterMap();
  return null;
};

/**
 * Paint a character map for a character code from this Playfield's set of character definitions at the
 * left, top coordinates on the Playfield's canvas(es).  If the character map for the selected character
 * code is undefined, then the character map comes from the standard Kid-SCII character set.  If the
 * standard Kid-SCII character set does not have a map for the selected character code, then a default
 * "empty box" character map will be painted
 *
 * @param {!number} left
 * @param {!number} top
 * @param {!number} characterCode
 * @param {!boolean} inverted
 * @param {!(string|CanvasGradient|CanvasPattern)} fillStyle
 */
Playfield.prototype.paintCharacter = function(left, top, characterCode, inverted, fillStyle) {
  var self = this,
    characterMap = self.getCharacterMap(characterCode, inverted);

  self.scrollableCanvas.paintCharacterMap(left, top, fillStyle, characterMap);
};

/**
 * Low-level graphics routine for panning the playfield's canvas(es)
 *
 * @param {number} offsetX number of css pixels to pan relative to the current X position, code assumes integer
 * @param {number} offsetY number of css pixels to pan relative to the current Y position, code assumes integer
 * @param {!DomMutationsLog} domMutationsLog
 */
Playfield.prototype.pan = function(offsetX, offsetY, domMutationsLog) {
  var self = this;

  self.scrollableCanvas.pan(offsetX, offsetY, domMutationsLog);
};

// Export some of the internals for the time being so they can be accessed directly from the harness
exportPublicProperties(Playfield.prototype, [
  [ "fillRectangle", Playfield.prototype.fillRectangle ]
]);

/**
 * <strong>require("./kidcompy/Playfield")</strong> &rArr; {@link Playfield}
 *
 * @protected
 * @module kidcompy/Playfield
 */
module.exports = Playfield;

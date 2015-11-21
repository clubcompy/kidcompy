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
  DomNodeType = require("./DomNodeType"),
  DomNodeSurrogate = require("./DomNodeSurrogate"),
  DomTools = require("./DomTools"),
  SystemProperties = require("./SystemProperties"),
  DomMutationsLog = require("./DomMutationsLog"),
  exportPublicProperties = require("../symbols/exportPublicProperties");

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

  // we need four kcCanvas'es inside a kcClip container
  Playfield.createCanvases(playfieldDiv, self.systemProperties, mutationsLog);

  // layout the canvases in their default positions
  Playfield.positionCanvases(playfieldDiv, self.canvasPositionX, self.canvasPositionY, self.topLeftCanvas,
    self.systemProperties, mutationsLog);
}

// Playfield extends DomNodeSurrogate
Playfield.prototype = Object.create(DomNodeSurrogate.prototype);

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
 * Fill a rectangular area in the visible playfield
 *
 * @param {!number} left X offset from canvasPositionX of the topLeftCanvas
 * @param {!number} top Y offset from canvasPositionY of the topLeftCanvas
 * @param {!number} width width of the rectangle in pixels
 * @param {!number} height height of the rectangle in pixels
 * @param {!(string|CanvasGradient|CanvasPattern)} fillStyle RGB color (like #abcdef), CanvasGradient, or CanvasPattern
 */
Playfield.prototype.fillRectangle = function(left, top, width, height, fillStyle) {
  // jshint -W016

  // find all four canvases
  var self = this,
    playfieldDiv = self.nodeCache.findDomNode(self),
    clipDiv = DomTools.findChildByClass(playfieldDiv, "kcClip"),
    canvasContexts = [
      DomTools.findChildByClass(clipDiv, "c0").getContext("2d"),
      DomTools.findChildByClass(clipDiv, "c1").getContext("2d"),
      DomTools.findChildByClass(clipDiv, "c2").getContext("2d"),
      DomTools.findChildByClass(clipDiv, "c3").getContext("2d")
    ];

  canvasContexts[self.topLeftCanvas].fillStyle = fillStyle;
  canvasContexts[self.topLeftCanvas].fillRect(left - self.canvasPositionX,
                                              top - self.canvasPositionY,
                                              width,
                                              height);

  canvasContexts[self.topLeftCanvas ^ 1].fillStyle = fillStyle;
  canvasContexts[self.topLeftCanvas ^ 1].fillRect(left - self.canvasPositionX - self.getCanvasWidth(),
                                                  top - self.canvasPositionY,
                                                  width,
                                                  height);

  canvasContexts[self.topLeftCanvas ^ 2].fillStyle = fillStyle;
  canvasContexts[self.topLeftCanvas ^ 2].fillRect(left - self.canvasPositionX,
                                                  top - self.canvasPositionY - self.getCanvasHeight(),
                                                  width,
                                                  height);

  canvasContexts[self.topLeftCanvas ^ 3].fillStyle = fillStyle;
  canvasContexts[self.topLeftCanvas ^ 3].fillRect(left - self.canvasPositionX - self.getCanvasWidth(),
                                                  top - self.canvasPositionY - self.getCanvasHeight(),
                                                  width,
                                                  height);
};

/**
 * Low-level graphics routine for panning the playfield's canvases
 *
 * @param {number} offsetX number of css pixels to pan relative to the current X position, code assumes integer
 * @param {number} offsetY number of css pixels to pan relative to the current Y position, code assumes integer
 * @param {!DomMutationsLog} domMutationsLog
 */
Playfield.prototype.pan = function(offsetX, offsetY, domMutationsLog) {
  // jshint -W016

  var self = this,
    positionX = self.canvasPositionX,
    positionY = self.canvasPositionY,
    playfieldDiv;

  if(offsetX < 0) {
    offsetX %= self.getCanvasWidth();
    offsetX += self.getCanvasWidth();
  }

  // will a canvas scroll completely out of view?  flip canvases horizontally
  if(positionX - offsetX >= self.getCanvasWidth() || positionX - offsetX < 0) {
    self.topLeftCanvas ^= 0x01;
  }

  positionX -= offsetX;
  positionX %= self.getCanvasWidth();

  if(offsetY < 0) {
    offsetY %= self.getCanvasHeight();
    offsetY += self.getCanvasHeight();
  }

  // will a canvas scroll completely out of view?  flip canvases vertically
  if(positionY - offsetY >= self.getCanvasHeight() || positionY - offsetY < 0) {
    self.topLeftCanvas ^= 0x02;
  }

  positionY -= offsetY;
  positionY %= self.getCanvasHeight();

  self.canvasPositionY = positionY;
  self.canvasPositionX = positionX;

  // reposition the canvases
  playfieldDiv = self.nodeCache.findDomNode(self);
  Playfield.positionCanvases(playfieldDiv, self.canvasPositionX, self.canvasPositionY, self.topLeftCanvas,
    self.systemProperties, domMutationsLog);
};

Object.assign(Playfield, /** @lends {Playfield} */ {
  /**
   * Create the four canvases managed by the Playfield
   *
   * @package
   * @param {!(Element|Node)} playfieldDiv
   * @param {!SystemProperties} systemProperties
   * @param {!DomMutationsLog} domMutationsLog
   */
  createCanvases: function(playfieldDiv, systemProperties, domMutationsLog) {
    var i, canvas, clipContainer,
      heightPx = systemProperties.getNumberProperty(constants.KEY_DISPLAY_HEIGHT) + "px",
      widthPx = systemProperties.getNumberProperty(constants.KEY_DISPLAY_WIDTH) + "px";

    // set the playfield to the same width/height as the kcClip div.  kcClip is absolute positioned, so it wouldn't
    // prop open the playfield div otherwise
    DomTools.setInlineStyle(playfieldDiv, "width", widthPx);
    DomTools.setInlineStyle(playfieldDiv, "height", heightPx);

    // make a kcClip container to hold our canvases and add it to the playfieldDiv
    clipContainer = playfieldDiv.ownerDocument.createElement("div");
    DomTools.addClass(clipContainer, "kcClip");
    DomTools.setInlineStyle(clipContainer, "width", widthPx);
    DomTools.setInlineStyle(clipContainer, "height", heightPx);
    DomTools.setInlineStyle(clipContainer, "clip", "rect(0px " + widthPx + " " + heightPx + " 0px)");
    domMutationsLog.appendChild(playfieldDiv, clipContainer);

    // create 4 kcCanvas'es and add them to the kcClip container
    for(i = 0; i < 4; i++) {
      canvas = playfieldDiv.ownerDocument.createElement("canvas");
      DomTools.addClass(canvas, "c" + i);
      DomTools.addClass(canvas, "kcCanvas");

      DomTools.setInlineStyle(canvas, "width", widthPx);
      DomTools.setInlineStyle(canvas, "height", heightPx);

      domMutationsLog.appendChild(clipContainer, canvas);
    }
  },

  /**
   * Given the current position values in this, internal utility for updating the nested canvas CSS top/left styles
   *
   * <p>Assumes that the topLeftX, topLeftY, and topLeftIndex have been clamped to the size of the playfield
   * and any wrapping and whatnot have already been resolved.
   *
   * @package
   * @param {!(Element|Node)} playfieldDiv
   * @param {!number} topLeftX top-left-most canvas' x coordinate (to be set in css 'left' style), expects this
   *        value to be integer -(PLAYFIELD_WIDTH-1) -> 0
   * @param {!number} topLeftY top-left-most canvas' y coordinate (to be set in css 'top' style), expects this
   *        value to be -(PLAYFIELD_HEIGHT-1) -> 0
   * @param {!number} topLeftIndex index of the canvas that should be top-left-most relative to the parent div
   *        MUST BE A NUMBER FROM 0-3
   * @param {!SystemProperties} systemProperties
   * @param {!DomMutationsLog} domMutationsLog
   */
  positionCanvases: function(playfieldDiv, topLeftX, topLeftY, topLeftIndex, systemProperties, domMutationsLog) {
    // jshint -W016

    // find all four canvases under playfieldDiv
    var clipTag = DomTools.findChildByClass(playfieldDiv, "kcClip"),
      canvasTags = [DomTools.findChildByClass(clipTag, "c0"),
        DomTools.findChildByClass(clipTag, "c1"),
        DomTools.findChildByClass(clipTag, "c2"),
        DomTools.findChildByClass(clipTag, "c3")
      ];

    // layout the canvas tags relative to the top-left-most canvas
    domMutationsLog.positionChild(playfieldDiv, canvasTags[topLeftIndex], topLeftY, topLeftX);
    domMutationsLog.positionChild(playfieldDiv, canvasTags[topLeftIndex ^ 1], topLeftY,
      topLeftX + systemProperties.getNumberProperty(constants.KEY_DISPLAY_WIDTH));
    domMutationsLog.positionChild(playfieldDiv, canvasTags[topLeftIndex ^ 2],
      topLeftY + systemProperties.getNumberProperty(constants.KEY_DISPLAY_HEIGHT),
      topLeftX);
    domMutationsLog.positionChild(playfieldDiv, canvasTags[topLeftIndex ^ 3],
      topLeftY + systemProperties.getNumberProperty(constants.KEY_DISPLAY_HEIGHT),
      topLeftX + systemProperties.getNumberProperty(constants.KEY_DISPLAY_WIDTH));
  }
});

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

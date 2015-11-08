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
  DomMutationsLog = require("./DomMutationsLog");

/**
 * Playfield - an independently scrollable video plane on the Compy display
 *
 * @constructor
 * @extends {DomNodeSurrogate}
 * @param {!DomNodeSurrogate} flipBuffer parent FlipBuffer for this Playfield.  Must be of {@link FlipBuffer} type
 * @param {!(Node|Element)} flipBufferDiv parent FlipBuffer's dom Element
 * @param {!number} ordinal
 * @param {!SystemProperties} systemProperties
 * @param {!DomMutationsLog} mutationsLog
 */
function Playfield(flipBuffer, flipBufferDiv, ordinal, systemProperties, mutationsLog) {
  var self = this,
    playfieldDiv;

  if(!flipBuffer || flipBuffer.nodeType !== DomNodeType.FLIPBUFFER) {
    throw new Error("Invalid FlipBuffer");
  }

  if(!_.isElement(flipBufferDiv)) {
    throw new Error("parent/div must not be null");
  }

  /* call super constructor */
  DomNodeSurrogate.call(self, flipBuffer, "p" + ordinal, DomNodeType.PLAYFIELD);

  /**
   * @name Playfield#systemProperties
   * @type {SystemProperties}
   */
  self.systemProperties = systemProperties;

  /**
   * The integer X position of the top-left-most canvas visible to the user relative to the Playfield's containing
   * div
   *
   * @type {number}
   */
  self.canvasPositionX = 0;

  /**
   * The integer Y position of the top-left-most canvas visible to the user relative to the Playfield's containing
   * div
   *
   * @type {number}
   */
  self.canvasPositionY = 0;

  /**
   * Index of nested canvas that is currently positioned as the most top-left-most canvas that is visible to the
   * user.  (Can be an integer number from 0-3.)
   *
   * @type {number}
   */
  self.topLeftCanvas = 0;

  playfieldDiv = document.createElement("div");
  DomTools.addClass(playfieldDiv, self.nodeId);
  mutationsLog.appendChild(flipBufferDiv, playfieldDiv);

  // we need canvases, four of them
  Playfield.createCanvases(playfieldDiv, self.systemProperties, mutationsLog);

  // layout the canvases in their default positions
  Playfield.positionCanvases(self.canvasPositionX, self.canvasPositionY, self.topLeftCanvas, playfieldDiv,
    self.systemProperties, mutationsLog);
}

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
 * @param {!(Element|Node)} playfieldDiv this playfield's div
 * @param {!number} left X offset from canvasPositionX of the topLeftCanvas
 * @param {!number} top Y offset from canvasPositionY of the topLeftCanvas
 * @param {!number} width width of the rectangle in pixels
 * @param {!number} height height of the rectangle in pixels
 * @param {!(string|CanvasGradient|CanvasPattern)} fillStyle RGB color (like #abcdef), CanvasGradient, or CanvasPattern
 */
Playfield.prototype.fillRectangle = function(playfieldDiv, left, top, width, height, fillStyle) {
  // jshint -W016

  // find all four canvases
  var canvasContexts = [
    DomTools.findChildByClass(playfieldDiv, "c0").getContext("2d"),
    DomTools.findChildByClass(playfieldDiv, "c1").getContext("2d"),
    DomTools.findChildByClass(playfieldDiv, "c2").getContext("2d"),
    DomTools.findChildByClass(playfieldDiv, "c3").getContext("2d")
  ];

  canvasContexts[this.topLeftCanvas].fillStyle = fillStyle;
  canvasContexts[this.topLeftCanvas].fillRect(left - this.canvasPositionX,
                                              top - this.canvasPositionY,
                                              width,
                                              height);

  canvasContexts[this.topLeftCanvas ^ 1].fillStyle = fillStyle;
  canvasContexts[this.topLeftCanvas ^ 1].fillRect(left - this.canvasPositionX - this.getCanvasWidth(),
                                                  top - this.canvasPositionY,
                                                  width,
                                                  height);

  canvasContexts[this.topLeftCanvas ^ 2].fillStyle = fillStyle;
  canvasContexts[this.topLeftCanvas ^ 2].fillRect(left - this.canvasPositionX,
                                                  top - this.canvasPositionY - this.getCanvasHeight(),
                                                  width,
                                                  height);

  canvasContexts[this.topLeftCanvas ^ 3].fillStyle = fillStyle;
  canvasContexts[this.topLeftCanvas ^ 3].fillRect(left - this.canvasPositionX - this.getCanvasWidth(),
                                                  top - this.canvasPositionY - this.getCanvasHeight(),
                                                  width,
                                                  height);
};

/**
 * Pan the playfield's canvases
 *
 * @param {!(Element|Node)} playfieldDiv this playfield's div
 * @param {number} offsetX number of css pixels to pan relative to the current X position
 * @param {number} offsetY number of css pixels to pan relative to the current Y position
 * @param {!SystemProperties} systemProperties
 * @param {!DomMutationsLog} domMutationsLog
 */
Playfield.prototype.pan = function(playfieldDiv, offsetX, offsetY, systemProperties, domMutationsLog) {
  // jshint -W016

  var positionX = this.canvasPositionX,
    positionY = this.canvasPositionY;

  if(offsetX < 0) {
    offsetX %= this.getCanvasWidth();
    offsetX += this.getCanvasWidth();
  }

  // will a canvas scroll completely out of view?  flip canvases horizontally
  if(positionX - offsetX >= this.getCanvasWidth() || positionX - offsetX < 0) {
    this.topLeftCanvas ^= 0x01;
  }

  positionX -= offsetX;
  positionX %= this.getCanvasWidth();

  if(offsetY < 0) {
    offsetY %= this.getCanvasHeight();
    offsetY += this.getCanvasHeight();
  }

  // will a canvas scroll completely out of view?  flip canvases vertically
  if(positionY - offsetY >= this.getCanvasHeight() || positionY - offsetY < 0) {
    this.topLeftCanvas ^= 0x02;
  }

  positionY -= offsetY;
  positionY %= this.getCanvasHeight();

  this.canvasPositionY = positionY;
  this.canvasPositionX = positionX;

  // reposition the canvases
  Playfield.positionCanvases(this.canvasPositionX, this.canvasPositionY, this.topLeftCanvas, playfieldDiv,
    systemProperties, domMutationsLog);
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
    var i, canvas;

    for(i = 0; i < 4; i++) {
      canvas = document.createElement("canvas");
      DomTools.addClass(canvas, "c" + i);

      DomTools.setInlineStyle(canvas, "width", systemProperties.getNumberProperty(constants.KEY_DISPLAY_WIDTH) + "px");
      DomTools.setInlineStyle(canvas, "height", systemProperties.getNumberProperty(constants.KEY_DISPLAY_HEIGHT) + "px");

      domMutationsLog.appendChild(playfieldDiv, canvas);
    }
  },

  /**
   * Given the current position values in this, update the nested canvas CSS top/left styles
   *
   * <p>Assumes that the topLeftX, topLeftY, and topLeftIndex have been clamped to the size of the playfield
   * and any wrapping and whatnot have already been resolved.
   *
   * @package
   * @param {!number} topLeftX top-left-most canvas' x coordinate (to be set in css 'left' style), expects this
   *        value to be -PLAYFIELD_WIDTH-1 -> 0
   * @param {!number} topLeftY top-left-most canvas' y coordinate (to be set in css 'top' style), expects this
   *        value to be -PLAYFIELD_HEIGHT-1 -> 0
   * @param {!number} topLeftIndex index of the canvas that should be top-left-most relative to the parent div
   *        MUST BE A NUMBER FROM 0-3
   * @param {!(Element|Node)} playfieldDiv
   * @param {!SystemProperties} systemProperties
   * @param {!DomMutationsLog} domMutationsLog
   */
  positionCanvases: function(topLeftX, topLeftY, topLeftIndex, playfieldDiv, systemProperties, domMutationsLog) {
    // jshint -W016

    // find all four canvases
    var canvasTags = [DomTools.findChildByClass(playfieldDiv, "c0"),
      DomTools.findChildByClass(playfieldDiv, "c1"),
      DomTools.findChildByClass(playfieldDiv, "c2"),
      DomTools.findChildByClass(playfieldDiv, "c3")];

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

/**
 * <strong>require("./kidcompy/Playfield")</strong> &rArr; {@link Playfield}
 *
 * @protected
 * @module kidcompy/Playfield
 */
module.exports = Playfield;

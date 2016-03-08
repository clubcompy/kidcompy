/*
 Kidcompy - a virtual computer for kids
 Copyright (C) 2016  Woldrich, Inc.

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

var constants = require("./constants"),
  DomTools = require("./DomTools"),
  exportPublicProperties = require("../symbols/exportPublicProperties"),
  ScrollableCanvasBase = require("./ScrollableCanvasBase");

/**
 * @extends {ScrollableCanvasBase}
 * @constructor
 * @param {(DomNodeSurrogate|null)} parent parent {@link Playfield} or null
 * @param {!Document} ownerDocument owner DOM Document
 * @param {!Object} nodeCache Instance of {@link DomNodeCache}
 * @param {!SystemProperties} systemProperties
 * @param {!DomMutationsLog} domMutationsLog
 */
function Html5ScrollableCanvas(parent, ownerDocument, nodeCache, systemProperties, domMutationsLog) {
  var self = this,
    clipContainer;

  /**
   * Height CSS Length built from {@link SystemProperties}
   *
   * @name Html5ScrollableCanvas#heightPx
   * @type {!string}
   */
  self.heightPx = systemProperties.getNumberProperty(constants.KEY_DISPLAY_HEIGHT) + "px";

  /**
   * Width CSS Length built from {@link SystemProperties}
   *
   * @name Html5ScrollableCanvas#widthPx
   * @type {!string}
   */
  self.widthPx = systemProperties.getNumberProperty(constants.KEY_DISPLAY_WIDTH) + "px";

  // before we do anything with the super constructor, force the parent playfield to the same width/height as
  // the kcClip div that will get created.  kcClip is absolute positioned, so it wouldn't prop open the parent
  // playfield's div otherwise
  DomTools.setInlineStyles(nodeCache.findDomNode(parent), {
    width: self.widthPx,
    height: self.heightPx
  });

  // call super constructor
  ScrollableCanvasBase.call(this, parent, ownerDocument, nodeCache, domMutationsLog);

  /**
   * @name Html5ScrollableCanvas#systemProperties
   * @type {SystemProperties}
   */
  self.systemProperties = systemProperties;

  /**
   * The integer X position of the top-left-most canvas visible to the user relative to the Playfield's containing
   * div
   *
   * @name Html5ScrollableCanvas#canvasPositionX
   * @type {number}
   */
  self.canvasPositionX = 0;

  /**
   * The integer Y position of the top-left-most canvas visible to the user relative to the Playfield's containing
   * div
   *
   * @name Html5ScrollableCanvas#canvasPositionY
   * @type {number}
   */
  self.canvasPositionY = 0;

  /**
   * Index of nested canvas that is currently positioned as the most top-left-most canvas that is visible to the
   * user.  (Can be an integer number from 0-3.)
   *
   * @name Html5ScrollableCanvas#topLeftCanvas
   * @type {number}
   */
  self.topLeftCanvas = 0;

  // make a kcClip container to hold our canvases and add it to the parentDiv
  clipContainer = self.nodeCache.findDomNode(self);
  DomTools.setInlineStyle(clipContainer, "clip", "rect(0px " + self.widthPx + " " + self.heightPx + " 0px)");

  self.reposition(domMutationsLog);
}

Html5ScrollableCanvas.prototype = Object.create(ScrollableCanvasBase.prototype);

/**
 * Create the DOM subtree that will display this Html5ScrollableCanvas
 *
 * @returns {Element}
 */
Html5ScrollableCanvas.prototype.createDom = function() {
  var self = this,
    clipDiv, i, canvas;

  clipDiv = self.ownerDocument.createElement("div");
  DomTools.addClass(clipDiv, "kcClip");

  // create 4 kcCanvas'es and add them to the kcClip container
  for(i = 0; i < 4; i++) {
    canvas = self.ownerDocument.createElement("canvas");
    DomTools.addClass(canvas, "c" + i);
    DomTools.addClass(canvas, "kcCanvas");

    DomTools.setTagAttribute(canvas, "width", self.widthPx);
    DomTools.setTagAttribute(canvas, "height", self.heightPx);

    // no need to go through the DomMutationsLog here because this is before w
    clipDiv.appendChild(canvas);
  }

  return clipDiv;
};

/**
 * @public
 * @param {!number} left X offset from canvasPositionX of the topLeftCanvas
 * @param {!number} top Y offset from canvasPositionY of the topLeftCanvas
 * @param {!number} width width of the rectangle in pixels
 * @param {!number} height height of the rectangle in pixels
 * @param {!(string|CanvasGradient|CanvasPattern)} fillStyle RGB color (like #abcdef), CanvasGradient, or CanvasPattern
 */
Html5ScrollableCanvas.prototype.fillRectangle = function(left, top, width, height, fillStyle) {
  // jshint -W016

  var self = this,
    clipDiv = self.nodeCache.findDomNode(self),
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
 * @param {!DomMutationsLog} domMutationsLog
 */
Html5ScrollableCanvas.prototype.reposition = function(domMutationsLog) {
  // jshint -W016

  // find all four canvases under playfieldDiv
  var self = this,
    parentDiv = self.nodeCache.findDomNode(self.parent),
    clipTag = self.nodeCache.findDomNode(self),
    canvasTags = [
      DomTools.findChildByClass(clipTag, "c0"),
      DomTools.findChildByClass(clipTag, "c1"),
      DomTools.findChildByClass(clipTag, "c2"),
      DomTools.findChildByClass(clipTag, "c3")
    ];

  // layout the canvas tags relative to the top-left-most canvas
  domMutationsLog.positionChild(parentDiv, canvasTags[self.topLeftCanvas], self.canvasPositionY, self.canvasPositionX);
  domMutationsLog.positionChild(parentDiv, canvasTags[self.topLeftCanvas ^ 1], self.canvasPositionY,
    self.canvasPositionX + self.systemProperties.getNumberProperty(constants.KEY_DISPLAY_WIDTH));
  domMutationsLog.positionChild(parentDiv, canvasTags[self.topLeftCanvas ^ 2],
    self.canvasPositionY + self.systemProperties.getNumberProperty(constants.KEY_DISPLAY_HEIGHT),
    self.canvasPositionX);
  domMutationsLog.positionChild(parentDiv, canvasTags[self.topLeftCanvas ^ 3],
    self.canvasPositionY + self.systemProperties.getNumberProperty(constants.KEY_DISPLAY_HEIGHT),
    self.canvasPositionX + self.systemProperties.getNumberProperty(constants.KEY_DISPLAY_WIDTH));
};

/**
 * Low-level graphics routine for panning the canvases
 *
 * @param {!number} offsetX number of css pixels to pan relative to the current X position, code assumes integer
 * @param {!number} offsetY number of css pixels to pan relative to the current Y position, code assumes integer
 * @param {!DomMutationsLog} domMutationsLog
 */
Html5ScrollableCanvas.prototype.pan = function(offsetX, offsetY, domMutationsLog) {
  // jshint -W016

  var self = this,
    positionX = self.canvasPositionX,
    positionY = self.canvasPositionY;

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
  self.reposition(domMutationsLog);
};

/**
 * Get the (visible) canvas width
 *
 * @returns {!number} canvas width
 */
Html5ScrollableCanvas.prototype.getCanvasWidth = function() {
  // for now, just return this compy instance's system property.  In the future it might be computed
  return this.systemProperties.getNumberProperty(constants.KEY_DISPLAY_WIDTH);
};

/**
 * Get the (visible) canvas height
 *
 * @returns {!number} canvas height
 */
Html5ScrollableCanvas.prototype.getCanvasHeight = function() {
  // for now, just return this compy instance's system property.  In the future it might be computed
  return this.systemProperties.getNumberProperty(constants.KEY_DISPLAY_HEIGHT);
};

/**
 * @param {!number} x character position x coordinate
 * @param {!number} y character position y coordinate
 * @param {!(string|CanvasGradient|CanvasPattern)} fillStyle RGB color (like #abcdef), CanvasGradient, or CanvasPattern
 * @param {!CharacterMap} charMap character to paint
 */
Html5ScrollableCanvas.prototype.paintCharacter = function(x, y, fillStyle, charMap) {
  // jshint -W016

  var self = this,
    clipDiv = self.nodeCache.findDomNode(self),
    canvasContexts = [
      DomTools.findChildByClass(clipDiv, "c0").getContext("2d"),
      DomTools.findChildByClass(clipDiv, "c1").getContext("2d"),
      DomTools.findChildByClass(clipDiv, "c2").getContext("2d"),
      DomTools.findChildByClass(clipDiv, "c3").getContext("2d")
    ], i, ii, rx, ry, rw, rh;

  if(!charMap.drawList.length) {
    return;
  }

  canvasContexts[0].fillStyle = fillStyle;
  canvasContexts[0].beginPath();
  for(i = 0, ii = charMap.drawList.length; i < ii; i += 4) {
    rx = charMap.drawList.charCodeAt(i + 0);
    ry = charMap.drawList.charCodeAt(i + 1);
    rw = charMap.drawList.charCodeAt(i + 2);
    rh = charMap.drawList.charCodeAt(i + 3);
    canvasContexts[0].rect(x * charMap.pixelWidth + rx, y * charMap.pixelHeight + ry, rw, rh);
  }
  canvasContexts[0].closePath();
  canvasContexts[0].fill();
};

exportPublicProperties(Html5ScrollableCanvas.prototype, [
  ["fillRectangle", Html5ScrollableCanvas.prototype.fillRectangle],
  ["pan", Html5ScrollableCanvas.prototype.pan]
]);

module.exports = Html5ScrollableCanvas;

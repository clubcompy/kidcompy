"use strict";

var constants = require("./constants"),
  DomTools = require("./DomTools"),
  exportPublicProperties = require("../symbols/exportPublicProperties");

/**
 * @extends {ScrollableCanvasBase}
 * @constructor
 * @param {!(Element|Node)} parentDiv
 * @param {!SystemProperties} systemProperties
 * @param {!DomMutationsLog} domMutationsLog
 */
function Html5ScrollableCanvas(parentDiv, systemProperties, domMutationsLog) {
  var self = this,
    i, canvas, clipContainer,
    height = systemProperties.getNumberProperty(constants.KEY_DISPLAY_HEIGHT),
    width = systemProperties.getNumberProperty(constants.KEY_DISPLAY_WIDTH),
    heightPx = height + "px",
    widthPx = width + "px";

  // call super constructor
  kidcompy.ScrollableCanvasBase.call(this, parentDiv, systemProperties, domMutationsLog);

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

  // set the playfield to the same width/height as the kcClip div.  kcClip is absolute positioned, so it wouldn't
  // prop open the playfield div otherwise
  DomTools.setInlineStyles(parentDiv, {
    width: widthPx,
    height: heightPx
  });

  // make a kcClip container to hold our canvases and add it to the parentDiv
  clipContainer = parentDiv.ownerDocument.createElement("div");
  DomTools.addClass(clipContainer, "kcClip");
  DomTools.setInlineStyle(clipContainer, "clip", "rect(0px " + widthPx + " " + heightPx + " 0px)");
  domMutationsLog.appendChild(parentDiv, clipContainer);

  // create 4 kcCanvas'es and add them to the kcClip container
  for(i = 0; i < 4; i++) {
    canvas = parentDiv.ownerDocument.createElement("canvas");
    DomTools.addClass(canvas, "c" + i);
    DomTools.addClass(canvas, "kcCanvas");

    DomTools.setTagAttribute(canvas, "width", "" + width);
    DomTools.setTagAttribute(canvas, "height", "" + height);

    domMutationsLog.appendChild(clipContainer, canvas);
  }

  self.reposition(parentDiv, domMutationsLog);
}

Html5ScrollableCanvas.prototype = Object.create(kidcompy.ScrollableCanvasBase.prototype);

/**
 * @public
 * @param {!(Element|Node)} parentDiv
 * @param {!number} left X offset from canvasPositionX of the topLeftCanvas
 * @param {!number} top Y offset from canvasPositionY of the topLeftCanvas
 * @param {!number} width width of the rectangle in pixels
 * @param {!number} height height of the rectangle in pixels
 * @param {!(string|CanvasGradient|CanvasPattern)} fillStyle RGB color (like #abcdef), CanvasGradient, or CanvasPattern
 */
Html5ScrollableCanvas.prototype.fillRectangle = function(parentDiv, left, top, width, height, fillStyle) {
  // jshint -W016

  var self = this,
    clipDiv = DomTools.findChildByClass(parentDiv, "kcClip"),
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
 * @param {!(Element|Node)} parentDiv
 * @param {!DomMutationsLog} domMutationsLog
 */
Html5ScrollableCanvas.prototype.reposition = function(parentDiv, domMutationsLog) {
  // jshint -W016

  // find all four canvases under playfieldDiv
  var self = this,
    clipTag = DomTools.findChildByClass(parentDiv, "kcClip"),
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
 * @param {!(Element|Node)} parentDiv
 * @param {!number} offsetX number of css pixels to pan relative to the current X position, code assumes integer
 * @param {!number} offsetY number of css pixels to pan relative to the current Y position, code assumes integer
 * @param {!DomMutationsLog} domMutationsLog
 */
Html5ScrollableCanvas.prototype.pan = function(parentDiv, offsetX, offsetY, domMutationsLog) {
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
  self.reposition(parentDiv, domMutationsLog);
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

exportPublicProperties(Html5ScrollableCanvas.prototype, [
  ["fillRectangle", Html5ScrollableCanvas.prototype.fillRectangle],
  ["pan", Html5ScrollableCanvas.prototype.pan]
]);

module.exports = Html5ScrollableCanvas;

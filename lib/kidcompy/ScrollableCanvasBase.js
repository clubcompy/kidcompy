"use strict";

var DomNodeSurrogate = require("./DomNodeSurrogate"),
  DomNodeType = require("./DomNodeType"),
  DomMutationsLog = require("./DomMutationsLog");

/**
 * @public
 * @abstract
 * @extends {DomNodeSurrogate}
 * @constructor
 * @param {(DomNodeSurrogate|null)} parent parent {@link DomNodeSurrogate} or null
 * @param {!Document} ownerDocument owner DOM Document
 * @param {!Object} nodeCache Instance of {@link DomNodeCache}
 * @param {!DomMutationsLog} domMutationsLog
 */
function ScrollableCanvasBase(parent, ownerDocument, nodeCache, domMutationsLog) {
  var self = this;

  // call super constructor
  DomNodeSurrogate.call(self, parent, "sc", ownerDocument, DomNodeType.SCROLLABLE_CANVAS, nodeCache, domMutationsLog);
}

ScrollableCanvasBase.prototype = Object.create(DomNodeSurrogate.prototype);

/**
 * Pan the ScrollableCanvas a relative number of Css Pixels in offsetX and offsetY directions
 *
 * @public
 * @param {!number} offsetX number of css pixels to pan relative to the current X position, code assumes integer
 * @param {!number} offsetY number of css pixels to pan relative to the current Y position, code assumes integer
 * @param {!DomMutationsLog} domMutationsLog
 */
ScrollableCanvasBase.prototype.pan = function(offsetX, offsetY, domMutationsLog) {
  throw new Error("abstract base");
};

/**
 * @public
 * @param {!number} left X offset from canvasPositionX of the topLeftCanvas
 * @param {!number} top Y offset from canvasPositionY of the topLeftCanvas
 * @param {!number} width width of the rectangle in pixels
 * @param {!number} height height of the rectangle in pixels
 * @param {!(string|CanvasGradient|CanvasPattern)} fillStyle RGB color (like #abcdef), CanvasGradient, or CanvasPattern
 */
ScrollableCanvasBase.prototype.fillRectangle = function(left, top, width, height, fillStyle) {
  throw new Error("abstract base");
};

module.exports = ScrollableCanvasBase;

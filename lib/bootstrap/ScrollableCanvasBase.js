"use strict";

var exportPublicProperties = require("../symbols/exportPublicProperties");

/**
 * @public
 * @abstract
 * @constructor
 * @param {!(Element|Node)} playfieldDiv
 * @param {!SystemProperties} systemProperties
 * @param {!DomMutationsLog} domMutationsLog
 */
function ScrollableCanvasBase(playfieldDiv, systemProperties, domMutationsLog) {}

/**
 * @public
 * @param {!(Element|Node)} parentDiv
 * @param {!number} offsetX number of css pixels to pan relative to the current X position, code assumes integer
 * @param {!number} offsetY number of css pixels to pan relative to the current Y position, code assumes integer
 * @param {!DomMutationsLog} domMutationsLog
 */
ScrollableCanvasBase.prototype.pan = function(parentDiv, offsetX, offsetY, domMutationsLog) {
  throw new Error("abstract base");
};

/**
 * @public
 * @param {!(Element|Node)} parentDiv
 * @param {!number} left X offset from canvasPositionX of the topLeftCanvas
 * @param {!number} top Y offset from canvasPositionY of the topLeftCanvas
 * @param {!number} width width of the rectangle in pixels
 * @param {!number} height height of the rectangle in pixels
 * @param {!(string|CanvasGradient|CanvasPattern)} fillStyle RGB color (like #abcdef), CanvasGradient, or CanvasPattern
 */
ScrollableCanvasBase.prototype.fillRectangle = function(parentDiv, left, top, width, height, fillStyle) {
  throw new Error("abstract base");
};

// Export to the global kidcompy namespace so that it can be extended
exportPublicProperties(ScrollableCanvasBase.prototype, [
  ["pan", ScrollableCanvasBase.prototype.pan],
  ["fillRectangle", ScrollableCanvasBase.prototype.fillRectangle]
]);

module.exports = ScrollableCanvasBase;

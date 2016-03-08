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

var _ = require("./tools/Lowbar.js"),
  constants = require("./constants");

/**
 * <p>DrawList generator.  The goal of this package is to generate a list of rectangles from a bitmap that can be
 * painted and filled with a color on VML, 2D Canvas, or WebGL Canvas
 *
 * <p>The DrawListGenerator does not have the responsibility to cache or render the rectangles lists it generates,
 * this is a pure functional bitmap-to-rectangle list converter.
 *
 * @constructor
 */
function DrawListGenerator() {
}

/**
 * Scratchpad array of numbers for generateRectangleListFromCharacterDefinition
 *
 * @type {Array.<number>}
 */
var WORKING_BITS = _.range(0, 16),

/**
 * Masks from lsb for 1-16 filled bits
 *
 * @type {Array.<number>}
 */
MASK = _.map(_.range(1, 17), function(bits) {
  // jshint -W016
  return (1 << bits) - 1;
});

/**
 * Return a string containing encoded rectangles that represent the filled pixel regions in a 1-bit character bitmap
 *
 * @param {!number} startOffset starting index into pixelData.  Note: this code assumes that i+8 <= pixelData.length!
 * @param {!string} pixelData string containing 8bit character definition.  Each row of the character definition
 * is represented by a character in the pixelData string.  Starting from startOffset, 8 1-bit character definition
 * rows will be read from pixelData.
 * @param {!number} bitsWideRowsTall numbers of bits wide and rows tall the characters are in pixelData (8 or 16)
 * @param {!number} scaleFactor number of bits to shift-left for the generated rectangles
 * @returns {!string} encoded sequences of 16-bit unsigned int left, top, width, height rectangle value groups
 */
function generateRectangleListFromCharacterDefinition(startOffset, pixelData, bitsWideRowsTall, scaleFactor) {
  // knowingly disable the cyclomatic complexity checking in jshint for this function
  /* jshint maxcomplexity: 12 */

  var rectArray = [],
    i, j, row, sx, sy, wid, hei, rowMask, invRowMask;

  // fill our integer scratchpad with pixel data from source
  for(i = startOffset, j = 0; j < bitsWideRowsTall; i++, j++) {
    WORKING_BITS[j] = pixelData.charCodeAt(i);
  }

  filledPixelSearch:
    do {
      for(i = 0; i < bitsWideRowsTall; i++) {
        row = WORKING_BITS[i];
        if(!row) {
          // early loop for empty row
          continue;
        }

        // jshint -W016
        for(j = 0; j < bitsWideRowsTall; j++) {
          // skip empty pixels
          if(!(row >> j & 1)) {
            continue;
          }

          // when we hit a filled pixel, establish that pixel as the top left of a filled rectangle in the character
          // take the starting x/y coordinate
          sy = i;
          sx = j;

          // continue looping over the row until we hit the right edge or find an empty pixel
          for(; j < bitsWideRowsTall && row >> j & 1; j++) {
            // advance j when filled pixels are detected in the LSB of row
          }

          // record the width of this rectangle we are building
          wid = j - sx;

          // work out a mask that covers the filled bits of our rectangle in the row
          rowMask = MASK[wid - 1] << sx;
          invRowMask = 0xffff ^ rowMask;

          // find the height by continuing to loop over subsequent rows and trying to carve out wid filled pixels
          for(; i < bitsWideRowsTall && (WORKING_BITS[i] & rowMask) === rowMask; i++) {
            // found a complete wid set of filled pixels under rowMask.  Mask off filled pixels found on source row
            // so that we don't evaluate them again
            WORKING_BITS[i] &= invRowMask;
          }

          // record the filled rectangle we observed as 16-bit unsigned words (stored as string characters)
          hei = i - sy;
          rectArray.push.call(rectArray, constants.ALL_CHARACTERS[sx << scaleFactor],
            constants.ALL_CHARACTERS[sy << scaleFactor], constants.ALL_CHARACTERS[wid << scaleFactor],
            constants.ALL_CHARACTERS[hei << scaleFactor]);

          // start over at top left of char looking for filled rectangles
          continue filledPixelSearch;
        }
      }

      // if we ever actually get here, we've exhausted all filled pixels and it's safe to break out of infinite loop
      break;
    } while(true);

  // We found no more filled pixels in the WORKING_BITS, and fell out here
  // join the rectArray as output

  return rectArray.join("");
}

/**
 * Build an array of rectangular areas of filled bits in a 1bit, 8x8 character definition.
 *
 * <p>The rectangles found are not guaranteed to be optimally large or few.  This is meant to be a quick algorithm
 * for computing the rectangles and we'll bank on the performance of the HTML engines to still render fast even
 * if we wind up with a lot of little ones
 *
 * @param {!number} startOffset starting index into pixelData.  Note: this code assumes that
 * startOffset+8 <= pixelData.length!
 * @param {!string} pixelData string containing 8bit character definition.  Each row of the character definition
 * is represented by a character in the pixelData string.  Starting from startOffset, 8 1-bit character definition
 * rows will be read from pixelData.
 * @returns {!string} encoded sequences of 16-bit unsigned int left, top, width, height rectangle value groups
 */
DrawListGenerator.prototype.rectanglesFrom8x8 = function(startOffset, pixelData) {
  return generateRectangleListFromCharacterDefinition(startOffset, pixelData, 8, 1);
};

/**
 * Build an array of rectangular areas of filled bits in a 1bit, 16x16 character definition.
 *
 * <p>The rectangles found are not guaranteed to be optimally large or few.  This is meant to be a quick algorithm
 * for computing the rectangles and we'll bank on the performance of the HTML engines to still render fast even
 * if we wind up with a lot of little ones
 *
 * @param {!number} startOffset starting index into pixelData.  Note: this code assumes that
 * startOffset+16 <= pixelData.length!
 * @param {!string} pixelData string containing 8bit character definition.  Each row of the character definition
 * is represented by a character in the pixelData string.  Starting from startOffset, 16 1-bit character definition
 * rows will be read from pixelData.
 * @returns {!string} encoded sequences of 16-bit unsigned int left, top, width, height rectangle value groups
 */
DrawListGenerator.prototype.rectanglesFrom16x16 = function(startOffset, pixelData) {
  return generateRectangleListFromCharacterDefinition(startOffset, pixelData, 16, 0);
};

/**
 * <strong>require("./kidcompy/CharacterGenerator")</strong> &rArr; {@link DrawListGenerator}
 *
 * @module kidcompy/CharacterGenerator
 */
module.exports = DrawListGenerator;

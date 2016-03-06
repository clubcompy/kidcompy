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

var constants = require("./constants");

/**
 * <p>Character generator.  The goal of this package is to generate a list of rectangles from a bitmap that can be
 * painted and filled with a color on VML, 2D Canvas, or WebGL Canvas
 *
 * <p>Character generator does not have the responsibility to cache or render the rectangles list, this is only
 * a bitmap-to-rectangle list processor.
 *
 * @constructor
 */
function CharacterGenerator() {
}

/**
 * Scratchpad array of numbers for rectanglesFrom8x8
 *
 * @type {Array.<number>}
 */
var WORK_8X8 = [ 0, 0, 0, 0, 0, 0, 0, 0 ],

/**
 * Masks from lsb for 1-8 filled bits
 *
 * @type {Array.<number>}
 */
MASK_8X8 = [ 1, 3, 7, 15, 31, 63, 127, 255 ];

/**
 * Build an array of rectangular areas of filled bits in a 1bit, 8x8 character definition.
 *
 * <p>The rectangles found are not guaranteed to be optimally large or few.  This is meant to be a quick algorithm
 * for computing the rectangles and we'll bank on the performance of the HTML engines to still render fast even
 * if we wind up with a lot of little ones
 *
 * @param {!number} startOffset starting index into pixelData.  Note: this code assumes that i+8 <= pixelData.length!
 * @param {!string} pixelData string containing 8bit character definition.  Each row of the character definition
 * is represented by a character in the pixelData string.  Starting from startOffset, 8 1-bit character definition
 * rows will be read from pixelData.
 * @returns {!string} encoded sequences of 16-bit unsigned int left, top, width, height rectangle value groups
 */
CharacterGenerator.prototype.rectanglesFrom8x8 = function(startOffset, pixelData) {
  // knowingly disable the cyclomatic complexity checking in jshint for this function
  /* jshint maxcomplexity: 12 */

  var rectArray = [],
    i, j, row, sx, sy, wid, hei, rowMask, invRowMask;

  // fill our integer scratchpad with
  for(i = startOffset, j = 0; j < 8; i++, j++) {
    WORK_8X8[j] = pixelData.charCodeAt(i);
  }

  filledPixelSearch:
  do {
    for(i = 0; i < 8; i++) {
      row = WORK_8X8[i];
      if(!row) {
        // early loop for empty row
        continue;
      }

      // jshint -W016
      for(j = 0; j < 8; j++, row >>= 1) {
        // early loop for empty pixel
        if(!(row & 1)) {
          continue;
        }

        // when we hit a filled pixel, establish that pixel as the top left of a filled rectangle in the character
        // take the starting x/y coordinate
        sy = i;
        sx = j;

        // continue looping over the row until we hit the right edge or find an empty pixel
        for(; j < 8; j++, row >>= 1) {
          if(!(row & 1)) {
            break;
          }
        }

        // record the width of this rectangle we are building
        wid = j - sx;

        // work out a mask that covers the filled bits of our rectangle in the row
        rowMask = MASK_8X8[wid - 1] << sx;
        invRowMask = 0xffff ^ rowMask;

        // find the height by continuing to loop over subsequent rows and trying to carve out wid filled pixels
        for(; i < 8 && (WORK_8X8[i] & rowMask) === rowMask; i++) {
          // found a complete wid set of filled pixels under rowMask.  Mask off filled pixels found on source row
          // so that we don't evaluate them again
          WORK_8X8[i] &= invRowMask;
        }

        // record the filled rectangle we observed as 16-bit unsigned words (stored as string characters)
        hei = i - sy;
        rectArray.push.call(rectArray, constants.ALL_CHARACTERS[sx], constants.ALL_CHARACTERS[sy],
          constants.ALL_CHARACTERS[wid], constants.ALL_CHARACTERS[hei]);

        // start over at top of char looking for filled rectangles
        continue filledPixelSearch;
      }
    }

    // if we ever actually get here, we've exhausted all filled pixels and it's safe to break out of infinite loop
    break;
  } while(true);

  // We find no more filled pixels in the WORK_8X8, and fell out here
  // join the rectArray as output

  return rectArray.join("");
};

/**
 * <strong>require("./kidcompy/CharacterGenerator")</strong> &rArr; {@link CharacterGenerator}
 *
 * @module kidcompy/CharacterGenerator
 */
module.exports = CharacterGenerator;

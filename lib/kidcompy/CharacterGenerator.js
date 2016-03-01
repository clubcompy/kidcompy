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
 * @type {Array.<number>}
 */
var WORK_8X8 = [ 0, 0, 0, 0, 0, 0, 0, 0 ],

/**
 * Masks from lsb for 1-8 bits
 * @type {number[]}
 */
MASK_8X8 = [ 1, 3, 7, 15, 31, 63, 127, 255 ];

/**
 * @param {!number} startOffset starting index into pixelData.  Note: this code assumes that i+8 <= pixelData.length!
 * @param {!string} pixelData string containing 8bit characters.  Starting from startOffset, 8 characters will be read
 * @returns {!string} string containing encoded sequences of left, top, width, height rectangle values
 */
CharacterGenerator.prototype.rectanglesFrom8x8 = function(startOffset, pixelData) {
  /* jshint maxcomplexity: 12 */

  var rectArray = [],
    i, j, row, sx, sy, wid, hei;

  for(i = startOffset, j = 0; j < 8; i++, j++) {
    WORK_8X8[j] = pixelData.charCodeAt(i);
  }

  filledPixelSearch:
  do {
    for(i = 0; i < 8; i++) {
      row = WORK_8X8[i];
      if(!row) {
        continue;
      }

      // jshint -W016
      for(j = 0; j < 8; j++, row >>= 1) {
        // when we hit a filled pixel, establish the width of the rectangle that that pixel is the top left of
        if(row & 1) {
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

          // clear any filled bits we see on this first row of the rectangle
          WORK_8X8[i] &= 0xffff ^ MASK_8X8[wid - 1] << sx;

          // find the height by continuing to loop over subsequent rows, trying to carve out wid filled pixels
          filledRowSearch:
          for(i += 1; i < 8; i++) {
            row = WORK_8X8[i] >> sx;

            for(j = 0; j < wid; j++) {
              if(!(row & 1)) {
                break filledRowSearch;
              }
            }

            // found a complete wid set of filled pixels on this row.  Mask off filled pixels found on source row
            WORK_8X8[i] &= 0xffff ^ MASK_8X8[wid - 1] << sx;
          }

          // record the filled rectangle we observed as 16-bit unsigned words as string characters
          hei = i - sy;
          rectArray.push.call(rectArray, constants.ALL_CHARACTERS[sx], constants.ALL_CHARACTERS[sy],
            constants.ALL_CHARACTERS[wid], constants.ALL_CHARACTERS[hei]);

          // start over at top of char looking for filled rectangles
          continue filledPixelSearch;
        }
      }
    }

    // if we ever actually get here, fall through
  } while(false);

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

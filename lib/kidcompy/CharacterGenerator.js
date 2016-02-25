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
 * @param {!number} startOffset starting index into pixelData
 * @param {!string} pixelData string containing 8bit characters.  Starting from startOffset, 8 characters will be read
 * @returns {!string} string containing encoded sequences of left, top, width, height rectangle values
 */
CharacterGenerator.prototype.rectanglesFrom8x8 = function(startOffset, pixelData) {
  var rectArray = [];

  return rectArray.join("");
};

/**
 * <strong>require("./kidcompy/CharacterGenerator")</strong> &rArr; {@link CharacterGenerator}
 *
 * @module kidcompy/CharacterGenerator
 */
module.exports = CharacterGenerator;

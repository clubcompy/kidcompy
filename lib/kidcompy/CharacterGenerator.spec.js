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
var CharacterGenerator = require("./CharacterGenerator");

describe("CharacterGenerator.spec", function() {
  var characterGenerator = new CharacterGenerator();

  /**
   * make string containing 16bit unsigned integers in its characters from number parameters
   *
   * @param {...number} var_args array[8] of 8-bit integer numbers
   * @returns {string} 8 character string, each character is an encoded 8-bit row of a character definition
   */
  function makeU16String() {
    var out = [],
      numberArray = Array.from(arguments);

    for(var i = 0; i < 8; i++) {
      out.push(constants.ALL_CHARACTERS[numberArray[i]]);
    }

    return out.join("");
  }

  /**
   * @param {string} str
   * @returns {Array.<number>}
   */
  function makeU16Array(str) {
    var out = [],
      i, ii;

    for(i = 0, ii = str.length; i < ii; i++) {
      out.push(str.charCodeAt(i));
    }

    return out;
  }

  describe("rectanglesFrom8x8", function() {
    it("will return an empty array for a clear character bitmap", function() {
      var spaceCharDef = makeU16String(0, 0, 0, 0, 0, 0, 0, 0),
        filledRectangles = characterGenerator.rectanglesFrom8x8(0, spaceCharDef);

      proclaim.equal(filledRectangles, "", "All clear bits should make an empty array");
    });

    it("will return a single rectangle array covering the whole character for all pixels filled", function() {
      var filledCharDef = makeU16String(0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff),
        filledRectangles = characterGenerator.rectanglesFrom8x8(0, filledCharDef);

      proclaim.equal(filledRectangles, makeU16String(0, 0, 8, 8), "One 8x8 rectangle representing the filled char");
    });

    it("will return two rectangle array covering a checkerboard pattern of filled pixels", function() {
      var filledCharDef = makeU16String(0x0f, 0x0f, 0x0f, 0x0f, 0xf0, 0xf0, 0xf0, 0xf0),
        filledRectangles = characterGenerator.rectanglesFrom8x8(0, filledCharDef);

      proclaim.equal(filledRectangles,
        makeU16String(0, 0, 4, 4) + // rectangle #0 fills upper-left 4x4 square
        makeU16String(4, 4, 4, 4), // rectangle #1 fills lower-right 4x4 square
        "Two 4x4 rectangles representing the filled char");
    });

    it("will return three rectangle array covering a cross pattern of filled pixels", function() {
      var filledCharDef = makeU16String(0x18, 0x18, 0x18, 0xff, 0xff, 0x18, 0x18, 0x18),
        filledRectangles = characterGenerator.rectanglesFrom8x8(0, filledCharDef);

      proclaim.equal(filledRectangles,
        makeU16String(3, 0, 2, 8) + // rectangle #0 is a tall, thin rectangle in the center of the bitmap, 2x8
        makeU16String(0, 3, 3, 2) + // rectangle #1 is the left of the horizontal bar
        makeU16String(5, 3, 3, 2), // rectangle #2 is the right of the horizontal bar
        "Three rectangles representing the filled char");
    });
  });
});

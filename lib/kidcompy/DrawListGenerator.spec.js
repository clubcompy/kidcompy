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
var DrawListGenerator = require("./DrawListGenerator");
var _ = require("./tools/lowbar");

describe("DrawListGenerator.spec", function() {
  var drawListGenerator = new DrawListGenerator();


  describe("rectanglesFrom8x8", function() {
    it("will return an array", function() {
      var spaceCharDef = [0, 0, 0, 0, 0, 0, 0, 0],
        filledRectangles = drawListGenerator.rectanglesFrom8x8(0, spaceCharDef);

      expect.isTrue(_.isArray(filledRectangles), "rectanglesFrom8x8 returns an array");
    });

    it("will return an empty array for a clear character bitmap", function() {
      var spaceCharDef = [0, 0, 0, 0, 0, 0, 0, 0],
        filledRectangles = drawListGenerator.rectanglesFrom8x8(0, spaceCharDef);

      expect.deepEquals([], filledRectangles, "All clear bits should make an empty array");
    });

    it("will return a single rectangle array covering the whole character for all pixels filled", function() {
      var filledCharDef = [0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff],
        filledRectangles = drawListGenerator.rectanglesFrom8x8(0, filledCharDef);

      expect.deepEquals([0, 0, 16, 16], filledRectangles, "One 8x8 rectangle representing the filled char");
    });

    it("will return two rectangle array covering a checkerboard pattern of filled pixels", function() {
      var filledCharDef = [0x0f, 0x0f, 0x0f, 0x0f, 0xf0, 0xf0, 0xf0, 0xf0],
        filledRectangles = drawListGenerator.rectanglesFrom8x8(0, filledCharDef);

      expect.deepEquals(
        [0, 0, 8, 8, // rectangle #0 fills upper-left 4x4 square, times 2
         8, 8, 8, 8], // rectangle #1 fills lower-right 4x4 square, times 2
        filledRectangles,
        "Two 4x4 rectangles representing the filled char");
    });

    it("will return three rectangle array covering a cross pattern of filled pixels", function() {
      var filledCharDef = [0x18, 0x18, 0x18, 0xff, 0xff, 0x18, 0x18, 0x18],
        filledRectangles = drawListGenerator.rectanglesFrom8x8(0, filledCharDef);

      expect.deepEquals(
        [6, 0, 4, 16, // rectangle #0 is a tall, thin rectangle in the center of the bitmap, 2x8, times 2
         0, 6, 6, 4, // rectangle #1 is the left of the horizontal bar, times 2
         10, 6, 6, 4], // rectangle #2 is the right of the horizontal bar, times 2
        filledRectangles,
        "Three rectangles representing the filled char");
    });
  });
});

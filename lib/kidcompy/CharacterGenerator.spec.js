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
   * make an 8x8 bitmap string out of a number bitmap array
   *
   * @param {Array.<number>} numberArray array[8] of 8-bit integer numbers
   * @returns {string} 8 character string, each character is an encoded 8-bit row of a character definition
   */
  function make8x8bitmap(numberArray) {
    var out = [];

    for(var i = 0; i < 8; i++) {
      out.push(constants.ALL_CHARACTERS[numberArray[i]]);
    }

    return out.join("");
  }

  describe("rectanglesFrom8x8", function() {
    it("will return an empty array for a clear character bitmap", function() {
      var spaceCharDef = make8x8bitmap([0, 0, 0, 0, 0, 0, 0, 0]),
        filledRectangles = characterGenerator.rectanglesFrom8x8(0, spaceCharDef);

      proclaim.equal(filledRectangles, "", "All clear bits should make an empty array");
    });
  });
});

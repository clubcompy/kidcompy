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

var DrawListGenerator = require("./DrawListGenerator"),
  CharacterMapFormat = require("./CharacterMapFormat");

var drawListGenerator = new DrawListGenerator();

/**
 * @param {!CharacterMapFormat} format
 * @param {!number} startOffset
 * @param {!Array.<number>} pixelData
 * @constructor
 */
function CharacterMap(format, startOffset, pixelData) {
  var self = this;

  /**
   * @name CharacterMap#format
   * @type {!CharacterMapFormat}
   */
  self.format = format;

  /**
   * @name CharacterMap#startOffset
   * @type {!number}
   */
  self.startOffset = startOffset;

  /**
   * @name CharacterMap#pixelData
   * @type {!Array.<number>}
   */
  self.pixelData = pixelData;

  /**
   * @name CharacterMap#pixelWidth
   * @type {!number}
   */
  self.pixelWidth = 16;

  /**
   * @name CharacterMap#pixelHeight
   * @type {!number}
   */
  self.pixelHeight = 16;

  /**
   * @name CharacterMap#drawList
   * @type {!Array.<number>}
   */
  self.drawList = self.makeDrawList();
}

/**
 * @private
 * @returns {!Array.<number>}
 */
CharacterMap.prototype.makeDrawList = function() {
  var self = this;

  switch(self.format) {
    case CharacterMapFormat.W8H8B1:
      return drawListGenerator.rectanglesFrom8x8(self.startOffset, self.pixelData);
    case CharacterMapFormat.W16H16B1:
      return drawListGenerator.rectanglesFrom16x16(self.startOffset, self.pixelData);
    default:
      throw new Error("unknown character map format");
  }
};

/**
 * <strong>require("./kidcompy/CharacterMap")</strong> &rArr; {@link CharacterMap}
 *
 * @module kidcompy/CharacterMap
 */
module.exports = CharacterMap;

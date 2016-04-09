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
 * @enum {number}
 */
var CharacterMapFormat = {
  /**
   * Width 8x8, 1bit
   */
  W8H8B1: 0,

  /**
   * Width 16x16, 1bit
   */
  W16H16B1: 1
};

/**
 * <strong>require('./kidcompy/CharacterMapFormat')</strong> &rArr; {@link CharacterMapFormat}
 *
 * @module kidcompy/CharacterMapFormat
 */
module.exports = CharacterMapFormat;

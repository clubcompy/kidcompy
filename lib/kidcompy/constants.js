/*
 Kidcompy - a virtual computer for kids
 Copyright (C) 2015  Woldrich, Inc.

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

var constants = {
  /**
   * System property lookup key for compy display height
   *
   * @const
   */
  KEY_DISPLAY_WIDTH: "displayWidth",

  /**
   * System property lookup key for compy display height
   *
   * @const
   */
  KEY_DISPLAY_HEIGHT: "displayHeight",

  // -------------------------------------------

  /**
   * Default compy display width (in CSS pixels, may be scaled differently using CSS transforms for different displays)
   *
   * @const
   */
  DEFAULT_DISPLAY_WIDTH: 640,

  /**
   * Default compy display height (in CSS pixels, may be scaled differently using CSS transforms for different displays)
   *
   * @const
   */
  DEFAULT_DISPLAY_HEIGHT: 480
};

/**
 * <strong>require("./kidcompy/constants")</strong> &rArr; {@link constants}
 *
 * @module kidcompy/constants
 */
module.exports = constants;

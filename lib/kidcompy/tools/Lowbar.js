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

/**
 * @license Lowbar.js references components of lodash-compat.  Lodash-compat is licensed for use in
 * Kidcompy under the MIT license.
 *
 * <p>Original copyright follows:
 * <blockquote>
 *     Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/
 *     Based on Underscore.js, copyright 2009-2015 Jeremy Ashkenas,
 *     DocumentCloud and Investigative Reporters & Editors <http://underscorejs.org/>
 * </blockquote>
 */

"use strict";

/**
 * @constructor
 */
var Lowbar = {
  /**
   * Checks if `value` is a DOM element.
   *
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a DOM element, else `false`.
   */
  isElement: require("../../../node_modules/lodash-compat/lang/isElement"),

  /**
   * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
   * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an object, else `false`.
   */
  isObject: require("../../../node_modules/lodash-compat/lang/isObject")
};

/**
 * <strong>require("./tools/Lowbar")</strong> &rArr; singleton instance of {@link Lowbar}
 *
 * @module tools/Lowbar
 */
module.exports = Lowbar;

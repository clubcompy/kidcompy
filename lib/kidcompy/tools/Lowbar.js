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
 * Kidcompy under the MIT license.  JSDoc comments are edited copies of the lodash-compat JSDocs
 *
 * <p>Original copyright follows:
 * <blockquote>
 *     Copyright 2012-2015 The Dojo Foundation &lt;http://dojofoundation.org/&gt;
 *     Based on Underscore.js, copyright 2009-2015 Jeremy Ashkenas,
 *     DocumentCloud and Investigative Reporters & Editors &lt;http://underscorejs.org/&gt;
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
  isObject: require("../../../node_modules/lodash-compat/lang/isObject"),

  /**
   * Creates an array of numbers (positive and/or negative) progressing from
   * `start` up to, but not including, `end`. If `end` is not specified it's
   * set to `start` with `start` then set to `0`. If `end` is less than `start`
   * a zero-length range is created unless a negative `step` is specified.
   *
   * @param {number} [start=0] The start of the range.
   * @param {number} end The end of the range.
   * @param {number} [step=1] The value to increment or decrement by.
   * @returns {Array} Returns the new array of numbers.
   */
  range: require("../../../node_modules/lodash-compat/utility/range"),

  /**
   * Creates an array of values by running each element in `collection` through
   * `iteratee`. The `iteratee` is bound to `thisArg` and invoked with three
   * arguments: (value, index|key, collection).
   *
   * If a property name is provided for `iteratee` the created `_.property`
   * style callback returns the property value of the given element.
   *
   * If a value is also provided for `thisArg` the created `_.matchesProperty`
   * style callback returns `true` for elements that have a matching property
   * value, else `false`.
   *
   * If an object is provided for `iteratee` the created `_.matches` style
   * callback returns `true` for elements that have the properties of the given
   * object, else `false`.
   *
   * Many lodash methods are guarded to work as iteratees for methods like
   * `_.every`, `_.filter`, `_.map`, `_.mapValues`, `_.reject`, and `_.some`.
   *
   * The guarded methods are:
   * `ary`, `callback`, `chunk`, `clone`, `create`, `curry`, `curryRight`,
   * `drop`, `dropRight`, `every`, `fill`, `flatten`, `invert`, `max`, `min`,
   * `parseInt`, `slice`, `sortBy`, `take`, `takeRight`, `template`, `trim`,
   * `trimLeft`, `trimRight`, `trunc`, `random`, `range`, `sample`, `some`,
   * `sum`, `uniq`, and `words`
   *
   * @param {Array|Object|string} collection The collection to iterate over.
   * @param {Function|Object|string} [iteratee=_.identity] The function invoked
   *  per iteration.
   * @param {*} [thisArg] The `this` binding of `iteratee`.
   * @returns {Array} Returns the new mapped array.
   */
  map: require("../../../node_modules/lodash-compat/collection/map")
};

/**
 * <strong>require("./tools/Lowbar")</strong> &rArr; singleton instance of {@link Lowbar}
 *
 * @module tools/Lowbar
 */
module.exports = Lowbar;

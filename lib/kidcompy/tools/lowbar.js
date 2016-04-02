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

/**
 * <p>lowbar is a custom build of lodash-compat functions used by Kidcompy</p>
 *
 * @license Kidcompy references components of lodash-compat.  Lodash-compat is licensed for use in
 * Kidcompy under the MIT license.
 *
 * <p>Original copyright follows:
 * <blockquote>
 *     Copyright 2012-2015 The Dojo Foundation &lt;http://dojofoundation.org/&gt;
 *     Based on Underscore.js, copyright 2009-2015 Jeremy Ashkenas,
 *     DocumentCloud and Investigative Reporters & Editors &lt;http://underscorejs.org/&gt;
 * </blockquote>
 *
 * @namespace
 */
var lowbar = {
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
  map: require("../../../node_modules/lodash-compat/collection/map"),

  /**
   * Reduces `collection` to a value which is the accumulated result of running
   * each element in `collection` through `iteratee`, where each successive
   * invocation is supplied the return value of the previous. If `accumulator`
   * is not provided the first element of `collection` is used as the initial
   * value. The `iteratee` is bound to `thisArg` and invoked with four arguments:
   * (accumulator, value, index|key, collection).
   *
   * Many lodash methods are guarded to work as iteratees for methods like
   * `_.reduce`, `_.reduceRight`, and `_.transform`.
   *
   * The guarded methods are:
   * `assign`, `defaults`, `defaultsDeep`, `includes`, `merge`, `sortByAll`,
   * and `sortByOrder`
   *
   * @param {Array|Object|string} collection The collection to iterate over.
   * @param {Function} [iteratee=_.identity] The function invoked per iteration.
   * @param {*} [accumulator] The initial value.
   * @param {*} [thisArg] The `this` binding of `iteratee`.
   * @returns {*} Returns the accumulated value.
   */
  reduce: require("../../../node_modules/lodash-compat/collection/reduce"),

  /**
   * An alternative to `_.reduce`; this method transforms `object` to a new
   * `accumulator` object which is the result of running each of its own enumerable
   * properties through `iteratee`, with each invocation potentially mutating
   * the `accumulator` object. The `iteratee` is bound to `thisArg` and invoked
   * with four arguments: (accumulator, value, key, object). Iteratee functions
   * may exit iteration early by explicitly returning `false`.
   *
   * @param {Array|Object} object The object to iterate over.
   * @param {Function} [iteratee=_.identity] The function invoked per iteration.
   * @param {*} [accumulator] The custom accumulator value.
   * @param {*} [thisArg] The `this` binding of `iteratee`.
   * @returns {*} Returns the accumulated value.
   */
  transform: require("../../../node_modules/lodash-compat/object/transform"),

  /**
   * Gets the last element of `array`.
   *
   * @param {Array} array The array to query.
   * @returns {*} Returns the last element of `array`.
   */
  last: require("../../../node_modules/lodash-compat/array/last"),

  /**
   * Pads `string` on the left side if it's shorter than `length`. Padding
   * characters are truncated if they exceed `length`.
   *
   * @param {string} [string=''] The string to pad.
   * @param {number} [length=0] The padding length.
   * @param {string} [chars=' '] The string used as padding.
   * @returns {string} Returns the padded string.
   */
  padLeft: require("../../../node_modules/lodash-compat/string/padLeft"),

  /**
   * Checks if `value` is classified as an `Array` object.
   *
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
   */
  isArray: require("../../../node_modules/lodash-compat/lang/isArray")
};

/**
 * <strong>require("./kidcompy/tools/lowbar")</strong> &rArr; singleton instance of {@link lowbar}
 *
 * @module kidcompy/tools/lowbar
 */
module.exports = lowbar;

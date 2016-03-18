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
 * Wrapper for proclaim.js to make it work similar to an xUnit assertions library.  Not intended for release
 * with production code
 *
 * <p>expect.js is based loosely on code in the quixote CSS testing library which was released under the
 * MIT license
 *
 * @namespace
 * @name expect
 */
var expectImpl = {
  /**
   * strict true assertion
   *
   * @param {*} expected
   * @param {!string=} message
   */
  isTrue: function(expected, message) {
    message = message || "expected true";
    proclaim.isTrue(expected === true, message);
  },

  /**
   * strict false assertion
   *
   * @param {*} expected
   * @param {!string=} message
   */
  isFalse: function(expected, message) {
    message = message || "expected false";
    proclaim.isTrue(expected === false, message);
  },

  /**
   * strict null assertion
   *
   * @param {*} expected
   * @param {!string=} message
   */
  isNull: function(expected, message) {
    message = message || "expected true";
    proclaim.isTrue(expected === null, message);
  },

  /**
   * strict not null assertion
   *
   * @param {*} expected
   * @param {!string=} message
   */
  isNotNull: function(expected, message) {
    message = message || "expected false";
    proclaim.isTrue(expected !== null, message);
  },

  /**
   * truthy assertion
   *
   * @param {*} expected
   * @param {!string=} message
   */
  isTruthy: function(expected, message) {
    message = message || "expected truthy";
    proclaim.isTrue(!!expected, message);
  },

  /**
   * falsy assertion
   *
   * @param {*} expected
   * @param {!string=} message
   */
  isFalsy: function(expected, message) {
    message = message || "expected falsy";
    proclaim.isTrue(!expected, message);
  },

  /**
   * strict equality assertion
   *
   * @param {*} expected
   * @param {*} actual
   * @param {!string=} message
   */
  equals: function(expected, actual, message) {
    message = message ? message + ": " : "";

    var expectedType = typeof expected,
      actualType = typeof actual;

    proclaim.strictEqual(actualType, expectedType, message + "expected " + expectedType + " '" + expected +
      "', but got " + actualType + " '" + actual + "'");
    proclaim.strictEqual(actual, expected, message + "expected '" + expected + "', but got '" + actual + "'");
  },

  /**
   * strict inequality assertion.  `actual` and `expected` are required to be of the same javascript types.  But a
   * strict inequality check should return true when they are compared using the !== operator.
   *
   * @param {*} expected
   * @param {*} actual
   * @param {!string=} message
   */
  notEquals: function(expected, actual, message) {
    message = message ? message + ": " : "";
    var expectedType = typeof expected,
      actualType = typeof actual;

    proclaim.strictEqual(actualType, expectedType, message + "expected " + expectedType + " '" + expected +
      "', but got " + actualType + " '" + actual + "'");
    proclaim.notStrictEqual(actual, expected, message + "expected '" + expected + "' to not equal '" + actual + "'");
  },

  /**
   * Deep object equality assertion
   *
   * @param {*} expected
   * @param {*} actual
   * @param {!string=} message
   */
  deepEquals: function(expected, actual, message) {
    message = message ? message + ": " : "";
    proclaim.deepEqual(actual, expected, message + "expected deep equality.");
  },

  /**
   * Deep object inequality assertion
   *
   * @param {*} expected
   * @param {*} actual
   * @param {!string=} message
   */
  notDeepEquals: function(expected, actual, message) {
    message = message ? message + ": " : "";
    proclaim.notDeepEqual(actual, expected, message + "expected deep inequality.");
  },

  /**
   * string actual matches expectedRegex assertion
   *
   * @param {!RegExp} expectedRegex
   * @param {string} actual
   * @param {!string=} message
   */
  match: function(expectedRegex, actual, message) {
    message = message ? message + ": " : "";
    proclaim.match(actual, expectedRegex, message + "expected string to match " + expectedRegex + ", but got '" + actual + "'");
  },

  /**
   * Less than or equal assertion
   *
   * @param {!number} left
   * @param {!number} right
   * @param {!string=} message
   */
  lte: function(left, right, message) {
    message = message ? message + ": " : "";

    proclaim.isTrue(left <= right, message + "expected '" + left + "' to be less-than or equal to '" + right + "'");
  },

  /**
   * Less than assertion
   *
   * @param {!number} left
   * @param {!number} right
   * @param {!string=} message
   */
  lt: function(left, right, message) {
    message = message ? message + ": " : "";

    proclaim.isTrue(left < right, message + "expected '" + left + "' to be less-than '" + right + "'");
  },

  /**
   * Greater than assertion
   *
   * @param {!number} left
   * @param {!number} right
   * @param {!string=} message
   */
  gt: function(left, right, message) {
    message = message ? message + ": " : "";

    proclaim.isTrue(left > right, message + "expected '" + left + "' to be greater-than '" + right + "'");
  },

  /**
   * Greater than or equal assertion
   *
   * @param {!number} left
   * @param {!number} right
   * @param {!string=} message
   */
  gte: function(left, right, message) {
    message = message ? message + ": " : "";

    proclaim.isTrue(left >= right, message + "expected '" + left + "' to be greater-than or equal to '" + right + "'");
  },

  /**
   * actual falls into a [lowerBoundInclusive, upperBoundExclusive) number range assertion
   *
   * @param {!number} actual
   * @param {!number} lowerBoundInclusive
   * @param {!number} upperBoundExclusive
   * @param {!string=} message
   */
  inRange: function(actual, lowerBoundInclusive, upperBoundExclusive, message) {
    message = message ? message + ": " : "";

    proclaim.isTrue(actual >= lowerBoundInclusive && actual < upperBoundExclusive, message + "expected >= '" +
      lowerBoundInclusive + "' and < '" + upperBoundExclusive + "', but got '" + actual + "'");
  },

  /**
   * function throws exception assertion
   *
   * @param {function()} fn function to execute where an exception is expected to be thrown
   * @param {!(string|RegExp|Error)=} expected
   * @param {!string=} message
   */
  throws: function(fn, expected, message) {
    var noException = false;

    message = message ? message + ": " : "";

    try {
      fn();
      noException = true;
    }
    catch(e) {
      if(expected !== undefined) {
        if(typeof expected === "string") {
          proclaim.strictEqual(
            e.message,
            expected,
            message + "expected exception message to be '" + expected + "', but was '" + e.message + "'"
          );
        }
        else if(typeof expected === "function") {
          proclaim.isTrue(e instanceof expected, message + "expected exception to be specific type of Error class");
        }
        else if(expected instanceof RegExp) {
          proclaim.match(
            e.message,
            expected,
            message + "expected exception message to match " + expected + ", but was '" + e.message + "'"
          );
        }
        else {
          throw new Error("Unrecognized 'expected' parameter in assertion: " + expected);
        }
      }
    }

    if(noException) {
      throw new Error(message + "expected exception");
    }
  },

  /**
   * function does not throw exception assertion
   *
   * @param {function()} fn function to execute where an exception is expected not to be thrown
   * @param {!string=} message
   */
  notThrows: function(fn, message) {
    message = message ? message + ": " : "";

    try {
      fn();
    }
    catch(e) {
      throw new Error(message + "did not expect exception '" + e + "'");
    }
  }
};

window["expect"] = expectImpl;

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
 * common runtime assertions that should throw Error when they fail
 *
 * <p>Use these assertions in production code to fail in cases you know are exceptional and the program cannot continue
 *
 * <p>assertion.js is based loosely on code in the quixote CSS testing library which was released under the
 * MIT license
 *
 * @namespace
 */
var assertion = {
  /**
   * Throws Error when expected is exactly equal to true
   *
   * @param {*} expected
   * @param {!string=} message
   * @throws {Error} if expected is not exactly equal to true
   */
  that: function(expected, message) {
    if(expected !== true) {
      message = message ? message + ": " : "";

      throw new Error(message + "expected condition to be true");
    }
  },

  /**
   * Throws Error unconditionally with a message
   *
   * @param {!string} message failure message to print
   * @throws {Error}
   */
  fail: function(message) {
    throw new Error(message);
  },

  /**
   * Throws Error because code that should be unreachable or impossible has been executed
   *
   * @param {!string=} message failure message to print
   * @throws {Error}
   */
  unreachable: function(message) {
    message = message ? message + ": " : "";

    throw new Error(message + "unreachable code executed");
  }
};

/**
 * <strong>require("./tools/assertion")</strong> &rArr; {@link assertion}
 *
 * @module tools/assertion
 */
module.exports = assertion;

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

// jshint -W098

/**
 * <p>This module describes external JavaScript symbols that are provided by the host JavaScript environment,
 * namely the karma test environment, and not built into our source JavaScript bundle that is under test
 *
 * <p>Closure Compiler will prevent these symbols from being mangled in its output
 *
 * <p>The JSDocs in this file are important to proper Closure Compiler function.
 * Make sure type information is accurate for any new object, property, or function
 * you add to this file
 *
 * @externs
 */

/**
 * Mocha BDD describe function
 *
 * @param {string} name
 * @param {Function} ftn
 */
function describe(name, ftn) {}

/**
 * Mocha before function
 *
 * @param {Function} ftn
 */
function before(ftn) {}

/**
 * Mocha beforeEach function
 *
 * @param {Function} ftn
 */
function beforeEach(ftn) {}

/**
 * Mocha BDD it test function
 *
 * @param {string} name
 * @param {Function} ftn
 */
function it(name, ftn) {}

/**
 * Sinon namespace
 */
function sinon() {}

/**
 * Sinon test wrapper
 *
 * @param {Function} ftn
 */
sinon.test = function(ftn) {};

/**
 * Proclaim namespace
 */
function proclaim() {}

/**
 * greaterThan assertion
 *
 * @param {*} actual
 * @param {*} expected
 * @param {string=} message
 */
proclaim.greaterThan = function(actual, expected, message) {};

/**
 * equal assertion
 *
 * @param {*} actual
 * @param {*} expected
 * @param {string=} message
 */
proclaim.equal = function(actual, expected, message) {};

/**
 * isTrue assertion
 *
 * @param {*} val
 * @param {string=} msg
 */
proclaim.isTrue = function(val, msg) {};

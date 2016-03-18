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
// jshint -W079
// jscs: disable

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
 * @param {function()} ftn
 */
function describe(name, ftn) {}

/**
 * Mocha before function
 *
 * @param {function(Function=)} ftn
 */
function before(ftn) {}

/**
 * Mocha beforeEach function
 *
 * @param {function(Function=)} ftn
 */
function beforeEach(ftn) {}

/**
 * Mocha after function
 *
 * @param {function(Function=)} ftn
 */
function after(ftn) {}

/**
 * Mocha afterEach function
 *
 * @param {function(Function=)} ftn
 */
function afterEach(ftn) {}

/**
 * Mocha BDD it test function
 *
 * @param {string} name
 * @param {function(Function=)} ftn
 */
function it(name, ftn) {}


/**
 * Sinon Spy API
 *
 * @constructor
 */
function SpyApi() {}

/**
 * @type {number}
 */
SpyApi.prototype.callCount = 0;


/**
 * Sinon API
 *
 * @constructor
 */
function SinonApi() {}

/**
 * Sinon test wrapper, gives you a sandbox that auto restore()'s when ftn returns
 *
 * @param {function(this:SinonApi, function(*=)=)} ftn
 */
SinonApi.prototype.test = function(ftn) {};

/**
 * Spy on a function by wrapping it in a spy proxy
 *
 * <p>If you want to spy on an instance function or prototype function, you need to manually assign the function
 * returned from spy() back into the right slot on your object/prototype
 *
 * @param {!(T|SpyApi)} functionToBeSpiedUpon a function you want to spy on
 * @returns {!(T|SpyApi)} proxy to functionToBeSpiedUpon plus SpyApi additional mixins
 * @template T
 */
SinonApi.prototype.spy = function(functionToBeSpiedUpon) {
  return function() {};
};

/**
 * Sinon namespace
 *
 * @type {SinonApi}
 */
var sinon;


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
 * notEqual assertion
 *
 * @param {*} actual
 * @param {*} expected
 * @param {string=} message
 */
proclaim.notEqual = function(actual, expected, message) {};

/**
 * equal assertion
 *
 * @param {*} actual
 * @param {*} expected
 * @param {string=} message
 */
proclaim.equal = function(actual, expected, message) {};

/**
 * notDeepEqual assertion (for comparing things like arrays or objects)
 *
 * @param {*} actual
 * @param {*} expected
 * @param {string=} message
 */
proclaim.notDeepEqual = function(actual, expected, message) {};

/**
 * deepEqual assertion (for comparing things like arrays or objects)
 *
 * @param {*} actual
 * @param {*} expected
 * @param {string=} message
 */
proclaim.deepEqual = function(actual, expected, message) {};

/**
 * isTrue assertion
 *
 * @param {*} val
 * @param {string=} msg
 */
proclaim.isTrue = function(val, msg) {};

/**
 * isFalse assertion
 *
 * @param {*} val
 * @param {string=} msg
 */
proclaim.isFalse = function(val, msg) {};

/**
 * isNotNull assertion
 *
 * @param {*} val
 * @param {string=} msg
 */
proclaim.isNotNull = function(val, msg) {};

/**
 * isNull assertion
 *
 * @param {*} val
 * @param {string=} msg
 */
proclaim.isNull = function(val, msg) {};

/**
 * expects ftn to throw
 *
 * @param {function()} ftn
 * @param {*} expected
 * @param {string=} msg
 */
proclaim.throws = function(ftn, expected, msg) {};

/**
 * expects ftn not to throw
 *
 * @param {function()} ftn
 * @param {*} expected
 * @param {string=} msg
 */
proclaim.doesNotThrow = function(ftn, expected, msg) {};

/**
 * expect namespace
 */
function expect() {}

/**
 * strict true assertion
 *
 * @param {*} expected
 * @param {!string=} message
 */
expect.isTrue = function(expected, message) {
};

/**
 * strict false assertion
 *
 * @param {*} expected
 * @param {!string=} message
 */
expect.isFalse = function(expected, message) {
};

/**
 * strict null assertion
 *
 * @param {*} expected
 * @param {!string=} message
 */
expect.isNull = function(expected, message) {};

/**
 * strict not null assertion
 *
 * @param {*} expected
 * @param {!string=} message
 */
expect.isNotNull = function(expected, message) {};

/**
 * truthy assertion
 *
 * @param {*} expected
 * @param {!string=} message
 */
expect.isTruthy = function(expected, message) {};

/**
 * falsy assertion
 *
 * @param {*} expected
 * @param {!string=} message
 */
expect.isFalsy = function(expected, message) {};

/**
 * strict equality assertion
 *
 * @param {*} expected
 * @param {*} actual
 * @param {!string=} message
 */
expect.equals = function(expected, actual, message) {};

/**
 * strict inequality assertion.  `actual` and `expected` are required to be of the same javascript types.  But a
 * strict inequality check should return true when they are compared using the !== operator.
 *
 * @param {*} expected
 * @param {*} actual
 * @param {!string=} message
 */
expect.notEquals = function(expected, actual, message) {};

/**
 * Deep object equality assertion
 *
 * @param {*} expected
 * @param {*} actual
 * @param {!string=} message
 */
expect.deepEquals = function(expected, actual, message) {};

/**
 * Deep object inequality assertion
 *
 * @param {*} expected
 * @param {*} actual
 * @param {!string=} message
 */
expect.notDeepEquals = function(expected, actual, message) {};

/**
 * string actual matches expectedRegex assertion
 *
 * @param {!RegExp} expectedRegex
 * @param {string} actual
 * @param {!string=} message
 */
expect.match = function(expectedRegex, actual, message) {};

/**
 * Less than or equal assertion
 *
 * @param {!number} left
 * @param {!number} right
 * @param {!string=} message
 */
expect.lte = function(left, right, message) {};

/**
 * Less than assertion
 *
 * @param {!number} left
 * @param {!number} right
 * @param {!string=} message
 */
expect.lt = function(left, right, message) {};

/**
 * Greater than assertion
 *
 * @param {!number} left
 * @param {!number} right
 * @param {!string=} message
 */
expect.gt = function(left, right, message) {};

/**
 * Greater than or equal assertion
 *
 * @param {!number} left
 * @param {!number} right
 * @param {!string=} message
 */
expect.gte = function(left, right, message) {};

/**
 * actual falls into a [lowerBoundInclusive, upperBoundExclusive) number range assertion
 *
 * @param {!number} actual
 * @param {!number} lowerBoundInclusive
 * @param {!number} upperBoundExclusive
 * @param {!string=} message
 */
expect.inRange = function(actual, lowerBoundInclusive, upperBoundExclusive, message) {};

/**
 * @param {function()} fn function to execute where an exception is expected to be thrown
 * @param {!(string|RegExp|Error)=} expected
 * @param {!string=} message
 */
expect.throws = function(fn, expected, message) {};

/**
 * @param {function()} fn function to execute where an exception is expected not to be thrown
 * @param {!string=} message
 */
expect.notThrows = function(fn, message) {}

/**
 * Quixote namespace
 *
 * @constructor
 */
function quixote() {}

/**
 * Quixote create frame
 *
 * @param {Object.<string,string>} options
 * @param {function()} callback
 * @returns {QFrame} new Quixote frame
 */
quixote.createFrame = function(options, callback) {};

/**
 * Quixote QElement
 *
 * @constructor
 */
function QElement() {}


/**
 * Quixote QFrame
 *
 * @constructor
 */
function QFrame() {}

/**
 * Quixote frame reset (usually called in a beforeEach() in test modules that care about Quixote)
 */
QFrame.prototype.reset = function() {};

/**
 * Add an html fragment to the QFrame's DOM
 * @param {string} html markup to add to the QFrame
 * @param {string} description text description of the markup
 * @returns {QElement} quixote wrapper around html that was added to the frame
 */
QFrame.prototype.add = function(html, description) {};

/**
 * @type {QFrame}
 */
kidcompy.quixoteFrame = null;

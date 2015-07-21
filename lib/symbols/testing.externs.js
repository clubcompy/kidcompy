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

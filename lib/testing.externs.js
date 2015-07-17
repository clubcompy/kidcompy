// jshint -W098

/**
 * @fileoverview JavaScript testing framework symbols supplied by karma runner
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
 *
 * @param {*} actual
 * @param {*} expected
 * @param {string=} message
 */
proclaim.greaterThan = function(actual, expected, message) {};

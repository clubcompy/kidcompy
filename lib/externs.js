// jshint -W098

/**
 * <p>This module describes external JavaScript symbols that are globals we write to the host JavaScript environment
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
 * @constructor
 */
function LifecycleEvents() {}

LifecycleEvents.prototype = {
  /** @param {Function} cb */
  addOnScriptHandler: function(cb) {},

  /** @param {Function} cb */
  addOnReadyHandler: function(cb) {},

  /** @param {Function} cb */
  addOnCodeGoHandler: function(cb) {},

  /** @param {Function} cb */
  addOnLoadHandler: function(cb) {}
};

// jshint -W079

/**
 * Kidcompy namespace
 *
 * @namespace
 */
var kidcompy = {};

/** @type {LifecycleEvents} */
kidcompy.lifecycleEvents = null;

/** @type {Function} */
kidcompy.log = null;

/** @type {URI} */
kidcompy.SCRIPT_BASE_URI = null;

/**
 * URI.js externs
 *
 * @constructor
 */
function URI() {}

/**
 * @param {string=} param
 * @return {string}
 */
URI.prototype.query = function(param) {
  return "";
};

/**
 * @param {string=} param
 * @return {string}
 */
URI.prototype.fragment = function(param) {
  return "";
};

/**
 * @param {string=} param
 * @return {string}
 */
URI.prototype.filename = function(param) {
  return "";
};

/**
 * @returns {URI}
 */
URI.prototype.clone = function() {
  return null;
};


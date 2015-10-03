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

/**
 * console logger
 */
kidcompy.log = function() {};

/**
 * log settings
 */
kidcompy.log.settings = function() {};

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

/**
 * The global window object (declared in bootstrap bundle if not already existing in the runtime environment)
 */
var global = {};

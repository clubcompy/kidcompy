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
// jscs: disable

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
  addOnCodeGoFiredHandler: function(cb) {},

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

/** @dict */
kidcompy.globalPropertyDefaults = null;

/**
 * @param {string} relativeUri
 * @param {function()=} callback
 */
kidcompy.loadScript = function(relativeUri, callback) {};

/**
 * @param {!function()} cb
 */
kidcompy.defer = function(cb) {};

/**
 * console logger
 *
 * @param {...*} var_args
 */
kidcompy.log = function(var_args) {};

/**
 * log settings
 */
kidcompy.log.settings = function() {};

/** @type {URI} */
kidcompy.SCRIPT_BASE_URI = null;

kidcompy.browser = {};
kidcompy.browser.msie = false;
kidcompy.browser.firefox = false;
kidcompy.browser.chrome = false;
kidcompy.browser.safari = false;
kidcompy.browser.version = 0;


/** @namespace */
kidcompy.rxjs = {};

/**
 * Provides a set of static methods for creating Disposables.
 *
 * @param {Function} action Action to run during the first call to dispose. The action is guaranteed to be run at most once.
 * @constructor
 */
kidcompy.rxjs.Disposable = function(action) {};

/** @type {Disposable} */
kidcompy.rxjs.Disposable.empty = null;

/**
 * Creates a disposable object that invokes the specified action when disposed.
 *
 * @param {Function} action Action to run during the first call to dispose. The action is guaranteed to be run at most once.
 * @return {Disposable} The disposable object that runs the given action upon disposal.
 */
kidcompy.rxjs.Disposable.create = function (action) {};

/**
 * Validates whether the given object is a disposable
 *
 * @param {Object} d to test whether it has a dispose method
 * @returns {boolean} true if a disposable object, else false.
 */
kidcompy.rxjs.Disposable.isDisposable = function (d) {};

/**
 * @param {Disposable} disposable
 * @throws {Error}
 */
kidcompy.rxjs.Disposable.checkDisposed = function (disposable) {};

/** Performs the task of cleaning up resources. */
kidcompy.rxjs.Disposable.prototype.dispose = function () {};

/**
 * @constructor
 */
kidcompy.rxjs.Scheduler = function() {
};

/** @returns {number} */
kidcompy.rxjs.Scheduler.now = function() {};

/**
 * Normalizes the specified TimeSpan value to a positive value.
 * @param {number} timeSpan The time span value to normalize.
 * @returns {number} The specified TimeSpan value if it is zero or positive; otherwise, 0
 */
kidcompy.rxjs.Scheduler.normalize = function(timeSpan) {};

/**
 * Determines whether the given object is a scheduler
 * @param {*} s
 * @returns {boolean}
 */
kidcompy.rxjs.Scheduler.isScheduler = function(s) {};

/**
 * Schedules an action to be executed.
 * @param {*} state State passed to the action to be executed.
 * @param {Function} action Action to be executed.
 * @returns {kidcompy.rxjs.Disposable} The disposable object used to cancel the scheduled action (best effort).
 */
kidcompy.rxjs.Scheduler.prototype.schedule = function(state, action) {};

/**
 * Schedules an action to be executed after dueTime.
 * @param {*} state State passed to the action to be executed.
 * @param {Function} action Action to be executed.
 * @param {number} dueTime Relative time after which to execute the action.
 * @returns {kidcompy.rxjs.Disposable} The disposable object used to cancel the scheduled action (best effort).
 */
kidcompy.rxjs.Scheduler.prototype.scheduleFuture = function(state, dueTime, action) {};

/**
 * Schedules an action to be executed recursively.
 * @param {*} state State passed to the action to be executed.
 * @param {Function} action Action to execute recursively. The last parameter passed to the action is used to trigger recursive scheduling of the action, passing in recursive invocation state.
 * @returns {kidcompy.rxjs.Disposable} The disposable object used to cancel the scheduled action (best effort).
 */
kidcompy.rxjs.Scheduler.prototype.scheduleRecursive = function(state, action) {};

/**
 * @type {kidcompy.rxjs.Scheduler}
 */
kidcompy.rxjs.Scheduler.animationFrame = null;

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
 * @returns {string}
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
 * Array.from
 *
 * @param {*} arrayLike An array-like or iterable object to convert to an array.
 * @param {(function(*,number): *)=} mapFn Optional. Map function to call on every value,index of the array.
 * @param {*=} thisArg Optional. Value to use as this when executing mapFn.
 * @returns {Array}
 */
Array.from = function(arrayLike, mapFn, thisArg) {
  return null;
};

/**
 * Cancel a requestAnimationFrame request
 *
 * @param {!number} rafToken
 */
window.cancelAnimationFrame = function(rafToken) {
};

/**
 * The global window object (declared in bootstrap bundle if not already existing in the runtime environment)
 */
var global = {};

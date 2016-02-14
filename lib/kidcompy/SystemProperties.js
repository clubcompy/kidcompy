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
 * Container for mutable system properties
 *
 * @constructor
 */
function SystemProperties() {
  var key;

  /**
   * @name SystemProperties#props
   * @type {Object.<string,(number|boolean|string)>}
   */
  this.props = {};

  if(!Object.prototype.hasOwnProperty) {
    throw new Error("JS host unsupported");
  }

  // copy in the system properties defaults from the global
  if(!!kidcompy.globalPropertyDefaults) {
    for(key in kidcompy.globalPropertyDefaults) {
      if(Object.prototype.hasOwnProperty.call(kidcompy.globalPropertyDefaults, key)) {
        this.setProperty(key, kidcompy.globalPropertyDefaults[key]);
      }
    }
  }
}

/**
 * Set a property
 *
 * @param {!string} key
 * @param {!(string|number|boolean)} value non-null value of string, boolean, or number type
 */
SystemProperties.prototype.setProperty = function(key, value) {
  this.props[key] = value;
};

/**
 * Does a system property exist?
 *
 * @param {!string} key
 * @returns {!boolean} true if system properties has a key set
 */
SystemProperties.prototype.hasProperty = function(key) {
  return Object.prototype.hasOwnProperty.call(this.props, key);
};

/**
 * Get a boolean system property
 *
 * @param {!string} key property key
 * @param {!boolean=} defaultValue optional. If key is not set in the system props, return this value.
 * @returns {!boolean} retrieved property cast to a boolean
 * @throws {Error} iff key is not valid and no default value was provided
 */
SystemProperties.prototype.getBooleanProperty = function(key, defaultValue) {
  if(Object.prototype.hasOwnProperty.call(this.props, key)) {
    return !!this.props[key];
  }

  if(typeof defaultValue === "boolean") {
    return defaultValue;
  }

  throw new Error("no such boolean system property " + key);
};

/**
 * Get a string system property
 *
 * @param {!string} key property key
 * @param {!string=} defaultValue optional. If key is not set in the system props, return this value.
 * @returns {!string} retrieved property or defaultValue cast to a string
 * @throws {Error} iff key is not valid and no default value was provided
 */
SystemProperties.prototype.getStringProperty = function(key, defaultValue) {
  if(Object.prototype.hasOwnProperty.call(this.props, key)) {
    return this.props[key] + "";
  }

  if(typeof defaultValue === "string") {
    return defaultValue;
  }

  throw new Error("no such string system property " + key);
};

/**
 * Get a number system property
 *
 * @param {!string} key property key
 * @param {!number=} defaultValue optional. If key is not set in the system props, return this value.
 * @returns {!number} retrieved property or defaultValue cast to a number
 * @throws {Error} iff key is not valid and no default value was provided
 */
SystemProperties.prototype.getNumberProperty = function(key, defaultValue) {
  if(Object.prototype.hasOwnProperty.call(this.props, key)) {
    return +this.props[key];
  }

  if(typeof defaultValue === "number") {
    return defaultValue;
  }

  throw new Error("no such number system property " + key + " keys were: " + JSON.stringify(this.props));
};

Object.assign(SystemProperties, /** @lends {SystemProperties} */ {
  /**
   * Set global default property that new SystemProperties will be initialized with
   *
   * @param {string} key
   * @param {(number|string|boolean)} value
   */
  setGlobalDefaultProperty: function(key, value) {
    kidcompy.globalPropertyDefaults = kidcompy.globalPropertyDefaults || {};

    kidcompy.globalPropertyDefaults[key] = value;
  }
});

/**
 * <strong>require("./kidcompy/SystemProperties")</strong> &rArr; {@link SystemProperties}
 *
 * @module kidcompy/SystemProperties
 */
module.exports = SystemProperties;

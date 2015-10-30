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

/* jshint -W098 */
var DomEventType = require("./DomEventType");

/**
 * @constructor
 * @param {DomEventType} eventType
 * @param {Object} data
 */
function DomMutationsLogEntry(eventType, data) {
  /**
   * @name DomMutationsLogEntry#eventType
   * @type {DomEventType}
   */
  this.eventType = eventType;

  /**
   * JS object whose data is appropriate to the eventType
   *
   * @name DomMutationsLogEntry#data
   * @type {Object}
   */
  this.data = data;
}

/**
 * <strong>require("./kidcompy/DomMutationsLogEntry")</strong> &rArr; {@link DomMutationsLogEntry}
 *
 * @module kidcompy/DomMutationsLogEntry
 */
module.exports = DomMutationsLogEntry;

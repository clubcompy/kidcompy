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

var domTools = require("./domTools"),
  DomMutationsLogEntry = require("./DomMutationsLogEntry"),
  DomEventType = require("./DomEventType"),
  _ = require("./tools/Lowbar");

/**
 * @constructor
 */
function DomMutationsLog() {
  var self = this;

  /**
   * @name DomMutationsLog#entries
   * @type {Array.<DomMutationsLogEntry>}
   */
  self.entries = [];
}

/*
 * static class members
 */

/**
 * Call parentNode.appendChild(childNode) and log the event
 *
 * @param {!(Node|Element)} parentNode
 * @param {!(Node|Element)} childNode
 */
DomMutationsLog.prototype.appendChild = function(parentNode, childNode) {
  parentNode.appendChild(childNode);

  this.entries.push(new DomMutationsLogEntry(DomEventType.APPEND_CHILD, {
    parentNode: parentNode,
    childNode: childNode
  }));
};

/**
 * <p>Find a mutation log entry whose DOM Elements in data have a css class set on them
 * that matches className
 *
 * <p>This function is a pig, and probably should only be used for testing purposes
 *
 * @param {DomEventType} eventType
 * @param {string} className
 * @returns {?DomMutationsLogEntry} returns first matching entry or null if not found
 */
DomMutationsLog.prototype.findEntryByClassName = function(eventType, className) {
  var entry,
    dataKey, dataValue,
    i, ii;

  for(i = 0, ii = this.entries.length; i < ii; i++) {
    entry = this.entries[i];

    if(entry.data) {
      for(dataKey in entry.data) {
        if(entry.data.hasOwnProperty(dataKey)) {
          dataValue = entry.data[dataKey];

          // is it a DOM element and does it contain the class name we're searching for?
          if(_.isElement(dataValue) && domTools.hasClass(dataValue, className)) {
            return entry;
          }
        }
      }
    }
  }

  return null;
};

/**
 * reset the internal state and release memory
 */
DomMutationsLog.prototype.reset = function() {
  var entry, dataKey,
    i, ii;

  for(i = 0, ii = this.entries.length; i < ii; i++) {
    entry = this.entries[i];
    if(entry.data) {
      for(dataKey in entry.data) {
        if(entry.data.hasOwnProperty(dataKey)) {
          delete entry.data[dataKey];
        }
      }
    }
  }

  this.entries = [];
};

/**
 * <strong>require("./kidcompy/DomMutationsLog")</strong> &rArr; {@link DomMutationsLog}
 *
 * @protected
 * @module kidcompy/DomMutationsLog
 */
module.exports = DomMutationsLog;

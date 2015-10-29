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

var DomTools = require("./DomTools"),
  DomMutationsLogEntry = require("./DomMutationsLogEntry"),
  DomEventType = require("./DomEventType"),
  _ = require("./tools/Lowbar");

/**
 * DomMutationsLog wraps common DOM mutation operations with an optional logging feature which is useful for
 * tracing, debugging, and unit testing all things DOM related.
 *
 * @class
 */
class DomMutationsLog {
  /**
   * @param {boolean=} logEnabled Should events be logged to entries after DOM mutations occur?
   * This parameter is copied to {@link DomMutationsLog#logEnabled}.  This param defaults to false if omitted.
   */
  constructor(logEnabled) {
    /**
     * @name DomMutationsLog#entries
     * @type {Array.<DomMutationsLogEntry>}
     */
    this.entries = [];

    /**
     * By default, logging events in the DomMutationsLog are disabled.  Caller needs to explicitly turn it on
     * to get details about modifications made to the DOM.  When this flag is false, this.entries will not have
     * {@link DomMutationsLogEntry} objects added after each mutation event.
     *
     * @name DomMutationsLog#logEnabled
     * @type {boolean}
     */
    this.logEnabled = logEnabled || false;
  }

  /**
   * Call parentNode.appendChild(childNode) and log the event
   *
   * @param {!(Node|Element)} parentNode
   * @param {!(Node|Element)} childNode
   */
  appendChild(parentNode, childNode) {
    parentNode.appendChild(childNode);

    if(this.logEnabled) {
      this.logAppendChildEvent(parentNode, childNode);
    }
  }

  /**
   * Set inline styles for top and left and log the event
   *
   * @param {!(Node|Element)} parentNode
   * @param {!(Node|Element)} childNode
   * @param {!number} top assumes integer
   * @param {!number} left assumes integer
   */
  positionChild(parentNode, childNode, top, left) {
    DomTools.setInlineStyle(childNode, "top", top + "px");
    DomTools.setInlineStyle(childNode, "left", left + "px");

    if(this.logEnabled) {
      this.logPositionChildEvent(parentNode, childNode, top, left);
    }
  }

  /**
   * Actually performs the logging of an entry for the appendChild event
   *
   * @param {!(Element|Node)} parentNode
   * @param {!(Element|Node)} childNode
   */
  logAppendChildEvent(parentNode, childNode) {
    this.entries.push(new DomMutationsLogEntry(DomEventType.APPEND_CHILD, {
      parentNode: parentNode,
      childNode: childNode
    }));
  }

  /**
   * Actually performs the logging of an entry for the positionChild event
   *
   * @param {!(Element|Node)} parentNode
   * @param {!(Element|Node)} childNode
   * @param {!number} top assumes integer
   * @param {!number} left assumes integer
   */
  logPositionChildEvent(parentNode, childNode, top, left) {
    this.entries.push(new DomMutationsLogEntry(DomEventType.POSITION_CHILD, {
      parentNode: parentNode,
      childNode: childNode,
      y: top,
      x: left
    }));
  }

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
  findEntryByClassName(eventType, className) {
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
            if(_.isElement(dataValue) && DomTools.hasClass(dataValue, className)) {
              return entry;
            }
          }
        }
      }
    }

    return null;
  }

  /**
   * reset the internal state and release memory
   */
  reset() {
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

    this.entries.length = 0; // clear the array
  }
}

/**
 * <strong>require("./kidcompy/DomMutationsLog")</strong> &rArr; {@link DomMutationsLog}
 *
 * @protected
 * @module kidcompy/DomMutationsLog
 */
module.exports = DomMutationsLog;

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

var DomMutationsLog = require("./DomMutationsLog"),
  DomEventType = require("./DomEventType"),
  DomTools = require("./DomTools");

describe("DomMutationsLog.spec", function() {
  /**
   * @type {DomMutationsLog}
   */
  var domMutations;

  beforeEach(function() {
    domMutations = new DomMutationsLog(true);
  });

  describe("logPositionChildEvent", function() {
    it("will log the thing", function() {
      var parentNode = document.createElement("div"),
        childNode = document.createElement("div");

      domMutations.positionChild(parentNode, childNode, 20, 30);

      // just prove the position inline styles were applied
      expect.equals(1, domMutations.entries.length, "number of domMutations applied should be 1");
      expect.equals(DomEventType.POSITION_CHILD, domMutations.entries[0].eventType, "eventType is POSITION_CHILD");
      expect.equals(parentNode, domMutations.entries[0].data.parentNode, "Parent node matches in the log");
      expect.equals(childNode, domMutations.entries[0].data.childNode, "Child node matches in the log");
      expect.equals(20, domMutations.entries[0].data.y, "The top should be 20");
      expect.equals(30, domMutations.entries[0].data.x, "The left should be 30");

      // do we have good styles applied?
      expect.equals(20, parseInt(DomTools.getInlineStyle(childNode, "top"), 10), "Top has inline style 20px");
      expect.equals(30, parseInt(DomTools.getInlineStyle(childNode, "left"), 10), "Left has inline style 30px");
    });
  });

  describe("logAppendChildEvent", function() {
    it("will track parent-child relationships", function() {
      var parentNode = document.createElement("div"),
        childNode = document.createElement("div"),
        mutationLogEntry;

      domMutations.appendChild(parentNode, childNode);

      // just prove the appendChild dom call was made

      expect.equals(parentNode, childNode.parentNode, "Element.appendChild was called properly");
      expect.equals(1, domMutations.entries.length, "There was one dom mutation logged");

      // prove the MutationLog has an expected entry in it
      mutationLogEntry = domMutations.entries[0];
      expect.equals(DomEventType.APPEND_CHILD, mutationLogEntry.eventType, "logged the right type");
      expect.equals(parentNode, mutationLogEntry.data.parentNode, "Parent node was logged");
      expect.equals(childNode, mutationLogEntry.data.childNode, "Child node was logged");
    });

    it("will not log entries by default (for performance in production system)", function() {
      var parentNode = document.createElement("div"),
        childNode = document.createElement("div");

      // disable the entry logging for starters
      domMutations.logEnabled = false;
      domMutations.appendChild(parentNode, childNode);

      expect.isTrue(domMutations.entries.length === 0, "logging mutation events disabled by default");

      // now enable logging and the appendChild event should get logged
      domMutations.logEnabled = true;
      domMutations.appendChild(parentNode, childNode);

      expect.isTrue(domMutations.entries.length === 1, "events accumulate once logging is enabled");
    });
  });

  describe("findEntryByClassName", function() {
    it("will find an entry whose classname contains a match", function() {
      var parentNode = document.createElement("div"),
        childNode = document.createElement("div"),
        mutationEntry;

      DomTools.addClass(parentNode, "ImaParent");
      DomTools.addClass(childNode, "findMe");

      domMutations.appendChild(parentNode, childNode);

      mutationEntry = domMutations.findEntryByClassName(DomEventType.APPEND_CHILD, "findMe");
      expect.isNotNull(mutationEntry);
      expect.equals(childNode, mutationEntry.data.childNode);

      // also test the sad path of classname not found
      mutationEntry = domMutations.findEntryByClassName(DomEventType.APPEND_CHILD, "ImNotThere");
      expect.isNull(mutationEntry);
    });
  });

  describe("reset", function() {
    it("clears the state of the DomMutationsLog entries", function() {
      var parentNode = document.createElement("div"),
        childNode = document.createElement("div");

      DomTools.addClass(parentNode, "ImaParent");
      DomTools.addClass(childNode, "findMe");

      expect.equals(0, domMutations.entries.length);

      domMutations.appendChild(parentNode, childNode);
      expect.equals(1, domMutations.entries.length);

      domMutations.reset();
      expect.equals(0, domMutations.entries.length, "entries cleared as expected");
    });
  });
});

module.exports = "DomMutationsLog.spec.js";

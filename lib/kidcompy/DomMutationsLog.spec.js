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
  domTools = require("./domTools");

describe("DomMutationsLog", function() {
  /**
   * @type {DomMutationsLog}
   */
  var domMutations;

  beforeEach(function() {
    domMutations = new DomMutationsLog();
  });

  describe("logAppendChildEvent", function() {
    it("will track parent-child relationships", function() {
      var parentNode = document.createElement("div"),
        childNode = document.createElement("div"),
        mutationLogEntry;

      domMutations.appendChild(parentNode, childNode);

      // just prove the appendChild dom call was made

      proclaim.equal(parentNode, childNode.parentNode, "Element.appendChild was called properly");
      proclaim.equal(1, domMutations.entries.length, "There was one dom mutation logged");

      // prove the MutationLog has an expected entry in it
      mutationLogEntry = domMutations.entries[0];
      proclaim.equal(DomEventType.APPEND_CHILD, mutationLogEntry.eventType, "logged the right type");
      proclaim.equal(parentNode, mutationLogEntry.data.parentNode, "Parent node was logged");
      proclaim.equal(childNode, mutationLogEntry.data.childNode, "Child node was logged");
    });
  });

  describe("findEntryByClassName", function() {
    it("will find an entry whose classname contains a match", function() {
      var parentNode = document.createElement("div"),
        childNode = document.createElement("div"),
        mutationEntry;

      domTools.addClass(parentNode, "ImaParent");
      domTools.addClass(childNode, "findMe");

      domMutations.appendChild(parentNode, childNode);

      mutationEntry = domMutations.findEntryByClassName(DomEventType.APPEND_CHILD, "findMe");
      proclaim.isNotNull(mutationEntry);
      proclaim.equal(mutationEntry.data.childNode, childNode);

      // also test the sad path of classname not found
      mutationEntry = domMutations.findEntryByClassName(DomEventType.APPEND_CHILD, "ImNotThere");
      proclaim.isNull(mutationEntry);
    });
  });

  describe("reset", function() {
    it("clears the state of the DomMutationsLog entries", function() {
      var parentNode = document.createElement("div"),
        childNode = document.createElement("div");

      domTools.addClass(parentNode, "ImaParent");
      domTools.addClass(childNode, "findMe");

      proclaim.equal(0, domMutations.entries.length);

      domMutations.appendChild(parentNode, childNode);
      proclaim.equal(1, domMutations.entries.length);

      domMutations.reset();
      proclaim.equal(0, domMutations.entries.length, "entries cleared as expected");
    });
  });
});

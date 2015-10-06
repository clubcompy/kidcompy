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

var Playfield = require("./Playfield"),
  DomEventType = require("./DomEventType"),
  DomMutationsLog = require("./DomMutationsLog"),
  domTools = require("./domTools");

describe("Playfield.spec", function() {

  var domMutationsLog;

  beforeEach(function() {
    domMutationsLog = new DomMutationsLog();
  });

  describe("init", function() {
    var playfield;

    it("will throw if a FlipBuffer is not passed for 0th parameter", function() {
      proclaim.throws(function() {
        // the first object passed to playfield is expected to have "isFlipBuffer = true" on its prototype
        // the following will throw
        playfield = new Playfield({}, document.createElement("div"), 1, domMutationsLog);
      }, Error, "Invalid to pass a non-FlipBuffer to Playfield constructor");
    });

    it("will throw if second parameter is not an Element is not passed for 1th parameter", function() {
      proclaim.throws(function() {
        // the first object passed to playfield is expected to have "isFlipBuffer = true" on its prototype
        // the following will throw
        playfield = new Playfield({isPlayfield: true}, "Not a DOM Element", 0, domMutationsLog);
      }, Error, "Invalid to pass a non-DOM Element to Playfield constructor");
    });

    it("will validate required parameters", function() {
      // first parameter must be an object
      // second parameter must be an Element
      playfield = new Playfield({isFlipBuffer: true}, document.createElement("div"), 1, domMutationsLog);

      proclaim.isNotNull(playfield, "playfield initializes successfully");
    });

    // test all the fields, test linkage to parent
    it("will set the classId in the created div", function() {
      var parentFlipBufferDiv,
        logEntry;

      parentFlipBufferDiv = document.createElement("div");
      domTools.addClass(parentFlipBufferDiv, "parentDiv");
      playfield = new Playfield({isFlipBuffer: true}, parentFlipBufferDiv, 1, domMutationsLog);

      logEntry = domMutationsLog.findEntryByClassName(DomEventType.APPEND_CHILD, playfield.classId);
      proclaim.isNotNull(logEntry, "playfield was found in dom mutations log");
      proclaim.equal(parentFlipBufferDiv, logEntry.data.parentNode, "Playfield attached as a child to FB's div");
    });

  });
});

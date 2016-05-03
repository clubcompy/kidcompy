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
  DomNodeType = require("./DomNodeType"),
  DomEventType = require("./DomEventType"),
  DomMutationsLog = require("./DomMutationsLog"),
  DomTools = require("./DomTools"),
  SystemProperties = require("./SystemProperties"),
  DomNodeCache = require("./DomNodeCache"),
  StubDomNodeSurrogate = require("./StubDomNodeSurrogate");

Playfield.tests = (function() {
  describe("Playfield.spec >", function() {

    var domMutationsLog,
      nodeCache,
      fakeFlipBuffer,
      fakeFlipBufferNode;

    beforeEach(function() {
      domMutationsLog = new DomMutationsLog(true);
      nodeCache = new DomNodeCache(window.document);
      fakeFlipBuffer = new StubDomNodeSurrogate(null, "fb0", DomNodeType.FLIPBUFFER);

      fakeFlipBufferNode = document.createElement("div");
      fakeFlipBufferNode.setAttribute("id", "fb0");
      document.getElementsByTagName("body")[0].appendChild(fakeFlipBufferNode);
    });

    afterEach(function() {
      fakeFlipBufferNode.parentNode.removeChild(fakeFlipBufferNode);
    });

    describe("init >", function() {
      var playfield,
        systemProperties;

      beforeEach(function() {
        systemProperties = new SystemProperties();
      });

      it("will throw if a FlipBuffer is not passed for 0th parameter", function() {
        expect.throws(function() {
          // the first object passed to playfield is expected to have "nodeType: DomNodeType.FLIPBUFFER" on as a member
          // the following will throw
          playfield = new Playfield({}, nodeCache, 1, true, window.document, systemProperties, domMutationsLog);
        }, Error, "Invalid to pass a non-FlipBuffer to Playfield constructor");
      });

      it("will throw if second parameter is not an Element is not passed for 1th parameter", function() {
        expect.throws(function() {
          // the first object passed to playfield is expected to have "nodeType: DomNodeType.FLIPBUFFER" on as a member
          // the following will throw
          playfield = new Playfield({nodeType: DomNodeType.PLAYFIELD}, nodeCache, 0, false, window.document,
            systemProperties, domMutationsLog);
        }, Error, "Invalid to pass a non-DOM Element to Playfield constructor");
      });

      it("will validate required parameters", function() {
        // first parameter must be an object
        // second parameter must be an Element
        playfield = new Playfield(fakeFlipBuffer, nodeCache, 1, true, window.document, systemProperties,
          domMutationsLog);

        expect.isNotNull(playfield, "playfield initializes successfully");
      });

      // test all the fields, test linkage to parent
      it("will set the nodeId in the created div", function() {
        var playfieldDiv,
          logEntry,
          clipDiv;

        playfield = new Playfield(fakeFlipBuffer, nodeCache, 1, true, window.document, systemProperties,
          domMutationsLog);

        // all the expected CSS classes were applied
        expect.isTrue(DomTools.hasClass(nodeCache.findDomNode(playfield), "p1"),
          "playfield DIV got the ID css class");
        expect.isTrue(DomTools.hasClass(nodeCache.findDomNode(playfield), "kcPlayfield"),
          "playfield DIV got the styling css class");

        logEntry = domMutationsLog.findEntryByClassName(DomEventType.APPEND_CHILD, playfield.nodeId);
        expect.isNotNull(logEntry, "playfield was found in dom mutations log");
        expect.equals(fakeFlipBufferNode, logEntry.data.parentNode, "Playfield attached as a child to FB's div");
        playfieldDiv = logEntry.data.childNode;

        logEntry = domMutationsLog.findEntryByClassName(DomEventType.APPEND_CHILD, "kcClip");
        expect.isNotNull(logEntry, "clip div was found in dom mutations log");
        expect.equals(playfieldDiv, logEntry.data.parentNode, "Clip div attached as a child to Playfield's div");
        clipDiv = logEntry.data.childNode;

        // don't do any canvas testing on legacy msie
        if(!kidcompy.browser.msie || kidcompy.browser.version > 8) {
          var canvas0, canvas1, canvas2, canvas3;

          // Find the canvases that we attached in the constructor
          canvas0 = DomTools.findChildByClass(clipDiv, "c0");
          expect.isNotNull(canvas0, "canvas 0 was found in the clipDiv subtree");
          expect.equals("CANVAS", canvas0.tagName, "Child is a canvas tag");

          canvas1 = DomTools.findChildByClass(clipDiv, "c1");
          expect.isNotNull(canvas1, "canvas 1 was found in the clipDiv subtree");
          expect.equals("CANVAS", canvas1.tagName, "Child is a canvas tag");

          canvas2 = DomTools.findChildByClass(clipDiv, "c2");
          expect.isNotNull(canvas2, "canvas 2 was found in the clipDiv subtree");
          expect.equals("CANVAS", canvas2.tagName, "Child is a canvas tag");

          canvas3 = DomTools.findChildByClass(clipDiv, "c3");
          expect.isNotNull(canvas3, "canvas 3 was found in the clipDiv subtree");
          expect.equals("CANVAS", canvas3.tagName, "Child is a canvas tag");
        }
      });

      it("will not set a 'last' css className in playfieldDiv when isLast == false", function() {
        playfield = new Playfield(fakeFlipBuffer, nodeCache, 0, false, window.document, systemProperties,
          domMutationsLog);

        expect.isFalse(DomTools.hasClass(nodeCache.findDomNode(playfield), "last"),
          ".last should NOT be present when isLast == false");
      });

      it("will set a 'last' css className in playfieldDiv when isLast == true", function() {
        playfield = new Playfield(fakeFlipBuffer, nodeCache, 7, true, window.document, systemProperties,
          domMutationsLog);

        expect.isTrue(DomTools.hasClass(nodeCache.findDomNode(playfield), "last"),
          ".last should be present when isLast == true");
      });
    });

    describe("reserveCharacterMapSlots", function() {
      it("can reserve slots for character maps in an array", function() {
        var characterMapArray = [];

        Playfield.reserveCharacterMapSlots(characterMapArray, "A".charCodeAt(0));

        expect.equals("A".charCodeAt(0) + 1, characterMapArray.length, "The array has slots up to the 'A' + 1");
      });
    });

    describe("generateCharacterMap", function() {

    });

  });
})();

module.exports = "Playfield.spec.js";

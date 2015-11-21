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
  constants = require("./constants"),
  DomNodeCache = require("./DomNodeCache"),
  StubDomNodeSurrogate = require("./StubDomNodeSurrogate");

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
      proclaim.throws(function() {
        // the first object passed to playfield is expected to have "nodeType: DomNodeType.FLIPBUFFER" on as a member
        // the following will throw
        playfield = new Playfield({}, nodeCache, 1, true, window.document, systemProperties, domMutationsLog);
      }, Error, "Invalid to pass a non-FlipBuffer to Playfield constructor");
    });

    it("will throw if second parameter is not an Element is not passed for 1th parameter", function() {
      proclaim.throws(function() {
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

      proclaim.isNotNull(playfield, "playfield initializes successfully");
    });

    // test all the fields, test linkage to parent
    it("will set the nodeId in the created div", function() {
      var playfieldDiv,
        logEntry,
        clipDiv;

      playfield = new Playfield(fakeFlipBuffer, nodeCache, 1, true, window.document, systemProperties,
        domMutationsLog);

      // all the expected CSS classes were applied
      proclaim.isTrue(DomTools.hasClass(nodeCache.findDomNode(playfield), "p1"),
        "playfield DIV got the ID css class");
      proclaim.isTrue(DomTools.hasClass(nodeCache.findDomNode(playfield), "kcPlayfield"),
        "playfield DIV got the styling css class");

      logEntry = domMutationsLog.findEntryByClassName(DomEventType.APPEND_CHILD, playfield.nodeId);
      proclaim.isNotNull(logEntry, "playfield was found in dom mutations log");
      proclaim.equal(fakeFlipBufferNode, logEntry.data.parentNode, "Playfield attached as a child to FB's div");
      playfieldDiv = logEntry.data.childNode;

      logEntry = domMutationsLog.findEntryByClassName(DomEventType.APPEND_CHILD, "kcClip");
      proclaim.isNotNull(logEntry, "clip div was found in dom mutations log");
      proclaim.equal(playfieldDiv, logEntry.data.parentNode, "Clip div attached as a child to Playfield's div");
      clipDiv = logEntry.data.childNode;

      // Find the canvases that we attached in the constructor
      logEntry = domMutationsLog.findEntryByClassName(DomEventType.APPEND_CHILD, "c0");
      proclaim.isNotNull(logEntry, "canvas 0 was found in dom mutations log");
      proclaim.equal(clipDiv, logEntry.data.parentNode, "Canvas was attached as a child to clip div");
      proclaim.equal("CANVAS", logEntry.data.childNode.tagName, "Child node is a canvas tag");
    });

    it("will not set a 'last' css className in playfieldDiv when isLast == false", function() {
      playfield = new Playfield(fakeFlipBuffer, nodeCache, 0, false, window.document, systemProperties,
        domMutationsLog);

      proclaim.isFalse(DomTools.hasClass(nodeCache.findDomNode(playfield), "last"),
        ".last should NOT be present when isLast == false");
    });

    it("will set a 'last' css className in playfieldDiv when isLast == true", function() {
      playfield = new Playfield(fakeFlipBuffer, nodeCache, 7, true, window.document, systemProperties,
        domMutationsLog);

      proclaim.isTrue(DomTools.hasClass(nodeCache.findDomNode(playfield), "last"),
        ".last should be present when isLast == true");
    });
  });

  describe("createCanvases >", function() {
    var playfieldDiv,
      systemProperties;

    beforeEach(function() {
      playfieldDiv = document.createElement("div");
      systemProperties = new SystemProperties();
    });

    it("will create one clip div and four canvases", function() {
      Playfield.createCanvases(playfieldDiv, systemProperties, domMutationsLog);

      // 1 clip div + 4 canvases were appended to the playfieldDiv and they have identifying css classes
      proclaim.equal(5, domMutationsLog.entries.length, "five dom mutations happened");
      proclaim.equal("DIV", domMutationsLog.entries[0].data.childNode.tagName, "first tag appended was the clip DIV");
      proclaim.equal("CANVAS", domMutationsLog.entries[1].data.childNode.tagName, "second tag appended was a CANVAS");
      proclaim.isTrue(DomTools.hasClass(domMutationsLog.entries[1].data.childNode, "c0"), "0th css class identifier");
      proclaim.isTrue(DomTools.hasClass(domMutationsLog.entries[4].data.childNode, "c3"), "3rd css class identifier");
    });

    it("will set inline styles for width and height", function() {
      Playfield.createCanvases(playfieldDiv, systemProperties, domMutationsLog);

      proclaim.equal(constants.DEFAULT_DISPLAY_WIDTH,
        parseInt(DomTools.getInlineStyle(domMutationsLog.entries[0].data.childNode, "width"), 10),
        "Expect that canvases will receive the default compy display width");
      proclaim.equal(constants.DEFAULT_DISPLAY_HEIGHT,
        parseInt(DomTools.getInlineStyle(domMutationsLog.entries[0].data.childNode, "height"), 10),
        "Expect that canvases will receive the default compy display height");

      proclaim.equal(constants.DEFAULT_DISPLAY_WIDTH,
        parseInt(DomTools.getInlineStyle(domMutationsLog.entries[3].data.childNode, "width"), 10),
        "Expect that canvases will receive the default compy display width");
      proclaim.equal(constants.DEFAULT_DISPLAY_HEIGHT,
        parseInt(DomTools.getInlineStyle(domMutationsLog.entries[3].data.childNode, "height"), 10),
        "Expect that canvases will receive the default compy display height");
    });
  });

  describe("getCanvasWidth and getCanvasHeight >", function() {
    var playfield;

    beforeEach(function() {
      var throwawayLog = new DomMutationsLog(false);

      playfield = new Playfield(fakeFlipBuffer, nodeCache, 1, true, window.document, new SystemProperties(),
        throwawayLog);
    });

    it("must return constants from constants.js by default", function() {
      proclaim.equal(constants.DEFAULT_DISPLAY_WIDTH, playfield.getCanvasWidth(), "width from SystemProperties");
      proclaim.equal(constants.DEFAULT_DISPLAY_HEIGHT, playfield.getCanvasHeight(), "height from SystemProperties");
    });
  });

  describe("layoutCanvases >", function() {
    var playfieldDiv,
      systemProperties;

    beforeEach(function() {
      playfieldDiv = document.createElement("div");
      systemProperties = new SystemProperties();

      // populate the playfieldDiv with four canvases
      var throwawayLog = new DomMutationsLog(false);

      Playfield.createCanvases(playfieldDiv, systemProperties, throwawayLog);
    });

    it("will layout the canvases in the default positions", function() {
      // this should result in the canvases being positioned relative to the playfieldDiv and to each other in
      // the power-on positions
      Playfield.positionCanvases(playfieldDiv, 0, 0, 0, systemProperties, domMutationsLog);

      proclaim.isTrue(DomTools.hasClass(domMutationsLog.entries[0].data.childNode, "c0"));
      proclaim.equal(0, domMutationsLog.entries[0].data.x, "Canvas 0 at (0, 0)");
      proclaim.equal(0, domMutationsLog.entries[0].data.y, "Canvas 0 at (0, 0)");

      proclaim.isTrue(DomTools.hasClass(domMutationsLog.entries[1].data.childNode, "c1"));
      proclaim.equal(constants.DEFAULT_DISPLAY_WIDTH, domMutationsLog.entries[1].data.x, "Canvas 1 at 320, 0)");
      proclaim.equal(0, domMutationsLog.entries[1].data.y, "Canvas 1 at (320, 0)");

      proclaim.isTrue(DomTools.hasClass(domMutationsLog.entries[2].data.childNode, "c2"));
      proclaim.equal(0, domMutationsLog.entries[2].data.x, "Canvas 2 at (0, 240)");
      proclaim.equal(constants.DEFAULT_DISPLAY_HEIGHT, domMutationsLog.entries[2].data.y, "Canvas 2 at (0, 240)");

      proclaim.isTrue(DomTools.hasClass(domMutationsLog.entries[3].data.childNode, "c3"));
      proclaim.equal(constants.DEFAULT_DISPLAY_WIDTH, domMutationsLog.entries[3].data.x, "Canvas 3 at (320, 240)");
      proclaim.equal(constants.DEFAULT_DISPLAY_HEIGHT, domMutationsLog.entries[3].data.y, "Canvas 3 at (320, 240)");
    });

    it("will layout the canvases in a wacky scrolled position", function() {
      // this shows what happens if canvas 3 is in the top-left-most position
      Playfield.positionCanvases(playfieldDiv, -10, -20, 3, systemProperties, domMutationsLog);

      proclaim.isTrue(DomTools.hasClass(domMutationsLog.entries[0].data.childNode, "c3"));
      proclaim.equal(-10, domMutationsLog.entries[0].data.x, "Canvas 3 at (-10, -20)");
      proclaim.equal(-20, domMutationsLog.entries[0].data.y, "Canvas 3 at (-10, -20)");

      proclaim.isTrue(DomTools.hasClass(domMutationsLog.entries[1].data.childNode, "c2"));
      proclaim.equal(constants.DEFAULT_DISPLAY_WIDTH - 10, domMutationsLog.entries[1].data.x, "Canvas 2 at 310, -20)");
      proclaim.equal(-20, domMutationsLog.entries[1].data.y, "Canvas 2 at (310, -20)");

      proclaim.isTrue(DomTools.hasClass(domMutationsLog.entries[2].data.childNode, "c1"));
      proclaim.equal(-10, domMutationsLog.entries[2].data.x, "Canvas 1 at (-10, 220)");
      proclaim.equal(constants.DEFAULT_DISPLAY_HEIGHT - 20, domMutationsLog.entries[2].data.y, "Canvas 1 at (-10, 220)");

      proclaim.isTrue(DomTools.hasClass(domMutationsLog.entries[3].data.childNode, "c0"));
      proclaim.equal(constants.DEFAULT_DISPLAY_WIDTH - 10, domMutationsLog.entries[3].data.x, "Canvas 0 at (310, 220)");
      proclaim.equal(constants.DEFAULT_DISPLAY_HEIGHT - 20, domMutationsLog.entries[3].data.y, "Canvas 0 at (310, 220)");
    });
  });

  describe("fillRectangle() and scroll()", function() {
    var playfield,
      playfieldDiv,
      systemProperties,
      canvasContexts;

    beforeEach(function() {
      var parentDiv;

      // override default canvas size to something small that we can easily test the contents of
      systemProperties = new SystemProperties();
      systemProperties.setProperty(constants.KEY_DISPLAY_WIDTH, 6);
      systemProperties.setProperty(constants.KEY_DISPLAY_HEIGHT, 6);

      // fake parent div
      parentDiv = document.createElement("div");
      document.getElementsByTagName("body")[0].appendChild(parentDiv);

      // playfield under test
      playfield = new Playfield(fakeFlipBuffer, nodeCache, 0, true, window.document, systemProperties,
        domMutationsLog);

      // get the playfieldDiv and canvases out of the DomMutationsLog
      playfieldDiv = domMutationsLog.findEntryByClassName(DomEventType.APPEND_CHILD, "p0").data.childNode;
      canvasContexts = [
        domMutationsLog.findEntryByClassName(DomEventType.APPEND_CHILD, "c0").data.childNode.getContext("2d"),
        domMutationsLog.findEntryByClassName(DomEventType.APPEND_CHILD, "c1").data.childNode.getContext("2d"),
        domMutationsLog.findEntryByClassName(DomEventType.APPEND_CHILD, "c2").data.childNode.getContext("2d"),
        domMutationsLog.findEntryByClassName(DomEventType.APPEND_CHILD, "c3").data.childNode.getContext("2d")
      ];
    });

    it("will fill pixels across the canvas", function() {
      playfield.fillRectangle(2, 2, 2, 2, "#ff00ff");

      var imageData = Array.from(canvasContexts[0].getImageData(0, 0, 6, 6).data);

      proclaim.deepEqual([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 255, 0, 255, 255, 255, 0, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 255, 0, 255, 255, 255, 0, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
      ], imageData, "canvas had white rectangle drawn to it");
    });

    it("will pan the logical canvas and fill pixels that span the actual canvases", function() {
      playfield.pan(-3, -3, domMutationsLog);
      proclaim.equal(3, playfield.topLeftCanvas, "the pan operation left canvas #3 in the top left spot");
      playfield.fillRectangle(2, 2, 2, 2, "#ff00ff");

      var imageData0 = Array.from(canvasContexts[0].getImageData(0, 0, 6, 6).data),
        imageData1 = Array.from(canvasContexts[1].getImageData(0, 0, 6, 6).data),
        imageData2 = Array.from(canvasContexts[2].getImageData(0, 0, 6, 6).data),
        imageData3 = Array.from(canvasContexts[3].getImageData(0, 0, 6, 6).data);

      proclaim.deepEqual([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 0, 255, 255
      ], imageData3, "Upper left of filled rectangle visible on panned playfield's canvas3's bottom right");

      proclaim.deepEqual([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        255, 0, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
      ], imageData2, "Upper right of filled rectangle visible on panned playfield's canvas2's bottom left");

      proclaim.deepEqual([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 0, 255, 255,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
      ], imageData1, "Bottom left of filled rectangle visible on panned playfield's canvas1's top right");

      proclaim.deepEqual([
        255, 0, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
      ], imageData0, "Bottom right of filled rectangle visible on panned playfield's canvas0's top left");
    });
  });
});

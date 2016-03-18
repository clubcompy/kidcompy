/*
 Kidcompy - a virtual computer for kids
 Copyright (C) 2016  Woldrich, Inc.

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

// jscs: disable

var _ = require("./tools/lowbar"),
  DomTools = require("./DomTools"),
  DomEventType = require("./DomEventType"),
  DomMutationsLog = require("./DomMutationsLog"),
  SystemProperties = require("./SystemProperties"),
  constants = require("./constants"),
  DomNodeCache = require("./DomNodeCache"),
  DomNodeType = require("./DomNodeType"),
  Html5ScrollableCanvas = require("./Html5ScrollableCanvas"),
  StubDomNodeSurrogate = require("./StubDomNodeSurrogate"),
  CharacterMap = require("./CharacterMap");

describe("Html5PlayableCanvas.spec >", function() {
  var domMutationsLog,
    systemProperties,
    nodeCache,
    fakePlayfieldDiv,
    stubPlayfield;

  beforeEach(function() {
    systemProperties = new SystemProperties();

    domMutationsLog = new DomMutationsLog(true);
    nodeCache = new DomNodeCache(window.document);

    fakePlayfieldDiv = document.createElement("div");
    fakePlayfieldDiv.setAttribute("id", "fb0");
    document.getElementsByTagName("body")[0].appendChild(fakePlayfieldDiv);

    stubPlayfield = new StubDomNodeSurrogate(null, fakePlayfieldDiv.getAttribute("id"), DomNodeType.PLAYFIELD);
  });

  afterEach(function() {
    fakePlayfieldDiv.parentNode.removeChild(fakePlayfieldDiv);
  });

  describe("init >", function() {
    it("will create one clip div and four canvases", function() {
      var html5ScrollableCanvas = new Html5ScrollableCanvas(stubPlayfield, document, nodeCache, systemProperties,
        domMutationsLog);

      expect.isNotNull(html5ScrollableCanvas);

      // Summary of expected mutations listed in the DomMutationsLog:
      // 1 clip div (containing 4 canvases) was appended to the playfieldDiv and they have identifying css
      // classes
      // 4 child canvases were positioned
      expect.equals(5, domMutationsLog.entries.length, "five mutations happened");

      var scrollableCanvasDiv, canvas0, canvas1, canvas2, canvas3;

      // added subtree for the Html5ScrollableCanvas is a DIV
      scrollableCanvasDiv = domMutationsLog.entries[0].data.childNode;
      expect.equals(DomEventType.APPEND_CHILD, domMutationsLog.entries[0].eventType);
      expect.equals("DIV", scrollableCanvasDiv.tagName, "tag appended was a DIV");
      expect.isTrue(DomTools.hasClass(scrollableCanvasDiv, "sc"), "DIV was tagged as a scrollable canvas");

      canvas0 = domMutationsLog.entries[1].data.childNode;
      expect.equals(DomEventType.POSITION_CHILD, domMutationsLog.entries[1].eventType);
      expect.equals("CANVAS", canvas0.tagName, "canvas0 tag in the scrollableCanvasDiv subtree was positioned");
      expect.isTrue(DomTools.hasClass(canvas0, "c0"), "canvas0 has a unique tag class");

      canvas1 = domMutationsLog.entries[2].data.childNode;
      expect.equals(DomEventType.POSITION_CHILD, domMutationsLog.entries[2].eventType);
      expect.equals("CANVAS", canvas1.tagName, "canvas1 tag in the scrollableCanvasDiv subtree was positioned");
      expect.isTrue(DomTools.hasClass(canvas1, "c1"), "canvas1 has a unique tag class");

      canvas2 = domMutationsLog.entries[3].data.childNode;
      expect.equals(DomEventType.POSITION_CHILD, domMutationsLog.entries[3].eventType);
      expect.equals("CANVAS", canvas2.tagName, "canvas2 tag in the scrollableCanvasDiv subtree was positioned");
      expect.isTrue(DomTools.hasClass(canvas2, "c2"), "canvas2 has a unique tag class");

      canvas3 = domMutationsLog.entries[4].data.childNode;
      expect.equals(DomEventType.POSITION_CHILD, domMutationsLog.entries[4].eventType);
      expect.equals("CANVAS", canvas3.tagName, "canvas3 tag in the scrollableCanvasDiv subtree was positioned");
      expect.isTrue(DomTools.hasClass(canvas3, "c3"), "canvas3 has a unique tag class");
    });

    it("will set inline styles for width and height", function() {
      var html5ScrollableCanvas = new Html5ScrollableCanvas(stubPlayfield, document, nodeCache, systemProperties,
        domMutationsLog);

      expect.isNotNull(html5ScrollableCanvas);

      expect.equals(constants.DEFAULT_DISPLAY_WIDTH,
        parseInt(DomTools.getTagAttribute(domMutationsLog.entries[1].data.childNode, "width"), 10),
        "Expect that canvases will receive the default compy display width");
      expect.equals(constants.DEFAULT_DISPLAY_HEIGHT,
        parseInt(DomTools.getTagAttribute(domMutationsLog.entries[1].data.childNode, "height"), 10),
        "Expect that canvases will receive the default compy display height");

      expect.equals(constants.DEFAULT_DISPLAY_WIDTH,
        parseInt(DomTools.getTagAttribute(domMutationsLog.entries[4].data.childNode, "width"), 10),
        "Expect that canvases will receive the default compy display width");
      expect.equals(constants.DEFAULT_DISPLAY_HEIGHT,
        parseInt(DomTools.getTagAttribute(domMutationsLog.entries[4].data.childNode, "height"), 10),
        "Expect that canvases will receive the default compy display height");
    });
  });

  describe("getCanvasWidth and getCanvasHeight >", function() {
    var html5ScrollableCanvas;

    beforeEach(function() {
      html5ScrollableCanvas = new Html5ScrollableCanvas(stubPlayfield, document, nodeCache, systemProperties, domMutationsLog);
    });

    it("must return constants from constants.js by default", function() {
      expect.equals(constants.DEFAULT_DISPLAY_WIDTH, html5ScrollableCanvas.getCanvasWidth(), "width from SystemProperties");
      expect.equals(constants.DEFAULT_DISPLAY_HEIGHT, html5ScrollableCanvas.getCanvasHeight(), "height from SystemProperties");
    });
  });

  describe("reposition >", function() {
    var html5ScrollableCanvas;

    beforeEach(function() {
      var dummyDomMutationsLog = new DomMutationsLog();

      // populate the playfieldDiv with four canvases
      html5ScrollableCanvas = new Html5ScrollableCanvas(stubPlayfield, document, nodeCache, systemProperties,
        dummyDomMutationsLog);
    });

    it("will layout the canvases in the default positions", function() {
      html5ScrollableCanvas.canvasPositionX = 0;
      html5ScrollableCanvas.canvasPositionY = 0;
      html5ScrollableCanvas.topLeftCanvas = 0;

      // this should result in the canvases being positioned relative to the playfieldDiv and to each other in
      // the power-on positions
      html5ScrollableCanvas.reposition(domMutationsLog);

      expect.isTrue(DomTools.hasClass(domMutationsLog.entries[0].data.childNode, "c0"), "c0 is 0th dom mutation");
      expect.equals(0, domMutationsLog.entries[0].data.x, "Canvas 0 at (0, 0)");
      expect.equals(0, domMutationsLog.entries[0].data.y, "Canvas 0 at (0, 0)");

      expect.isTrue(DomTools.hasClass(domMutationsLog.entries[1].data.childNode, "c1"), "c1 is 1st dom mutation");
      expect.equals(constants.DEFAULT_DISPLAY_WIDTH, domMutationsLog.entries[1].data.x, "Canvas 1 at 320, 0)");
      expect.equals(0, domMutationsLog.entries[1].data.y, "Canvas 1 at (320, 0)");

      expect.isTrue(DomTools.hasClass(domMutationsLog.entries[2].data.childNode, "c2"), "c2 is 2nd dom mutation");
      expect.equals(0, domMutationsLog.entries[2].data.x, "Canvas 2 at (0, 240)");
      expect.equals(constants.DEFAULT_DISPLAY_HEIGHT, domMutationsLog.entries[2].data.y, "Canvas 2 at (0, 240)");

      expect.isTrue(DomTools.hasClass(domMutationsLog.entries[3].data.childNode, "c3"), "c3 is 3rd dom mutation");
      expect.equals(constants.DEFAULT_DISPLAY_WIDTH, domMutationsLog.entries[3].data.x, "Canvas 3 at (320, 240)");
      expect.equals(constants.DEFAULT_DISPLAY_HEIGHT, domMutationsLog.entries[3].data.y, "Canvas 3 at (320, 240)");
    });

    it("will layout the canvases in a wacky scrolled position", function() {
      html5ScrollableCanvas.canvasPositionX = -10;
      html5ScrollableCanvas.canvasPositionY = -20;
      html5ScrollableCanvas.topLeftCanvas = 3;

      // this shows what happens if canvas 3 is in the top-left-most position
      html5ScrollableCanvas.reposition(domMutationsLog);

      expect.isTrue(DomTools.hasClass(domMutationsLog.entries[0].data.childNode, "c3"));
      expect.equals(-10, domMutationsLog.entries[0].data.x, "Canvas 3 at (-10, -20)");
      expect.equals(-20, domMutationsLog.entries[0].data.y, "Canvas 3 at (-10, -20)");

      expect.isTrue(DomTools.hasClass(domMutationsLog.entries[1].data.childNode, "c2"));
      expect.equals(constants.DEFAULT_DISPLAY_WIDTH - 10, domMutationsLog.entries[1].data.x, "Canvas 2 at 310, -20)");
      expect.equals(-20, domMutationsLog.entries[1].data.y, "Canvas 2 at (310, -20)");

      expect.isTrue(DomTools.hasClass(domMutationsLog.entries[2].data.childNode, "c1"));
      expect.equals(-10, domMutationsLog.entries[2].data.x, "Canvas 1 at (-10, 220)");
      expect.equals(constants.DEFAULT_DISPLAY_HEIGHT - 20, domMutationsLog.entries[2].data.y, "Canvas 1 at (-10, 220)");

      expect.isTrue(DomTools.hasClass(domMutationsLog.entries[3].data.childNode, "c0"));
      expect.equals(constants.DEFAULT_DISPLAY_WIDTH - 10, domMutationsLog.entries[3].data.x, "Canvas 0 at (310, 220)");
      expect.equals(constants.DEFAULT_DISPLAY_HEIGHT - 20, domMutationsLog.entries[3].data.y, "Canvas 0 at (310, 220)");
    });
  });

  describe("fillRectangle() and scroll()", function() {
    var html5ScrollableCanvas,
      canvasContexts;

    beforeEach(function() {
      // override default canvas size to something small that we can easily test the contents of
      systemProperties = new SystemProperties();
      systemProperties.setProperty(constants.KEY_DISPLAY_WIDTH, 6);
      systemProperties.setProperty(constants.KEY_DISPLAY_HEIGHT, 6);

      // populate the playfieldDiv with four canvases
      html5ScrollableCanvas = new Html5ScrollableCanvas(stubPlayfield, document, nodeCache, systemProperties, domMutationsLog);

      // get the playfieldDiv and canvases out of the DomMutationsLog
      canvasContexts = [
        domMutationsLog.findEntryByClassName(DomEventType.APPEND_CHILD, "c0").data.childNode.getContext("2d"),
        domMutationsLog.findEntryByClassName(DomEventType.APPEND_CHILD, "c1").data.childNode.getContext("2d"),
        domMutationsLog.findEntryByClassName(DomEventType.APPEND_CHILD, "c2").data.childNode.getContext("2d"),
        domMutationsLog.findEntryByClassName(DomEventType.APPEND_CHILD, "c3").data.childNode.getContext("2d")
      ];
    });

    it("will fill pixels across the canvas", function() {
      html5ScrollableCanvas.fillRectangle(2, 2, 2, 2, "#ff00ff");

      var imageData = Array.from(canvasContexts[0].getImageData(0, 0, 6, 6).data);

      expect.deepEquals([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 255, 0, 255, 255, 255, 0, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 255, 0, 255, 255, 255, 0, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
      ], imageData, "canvas had white rectangle drawn to it");
    });

    it("will pan the logical canvas and fill pixels that span the actual canvases", function() {
      html5ScrollableCanvas.pan(-3, -3, domMutationsLog);
      expect.equals(3, html5ScrollableCanvas.topLeftCanvas, "the pan operation left canvas #3 in the top left spot");
      html5ScrollableCanvas.fillRectangle(2, 2, 2, 2, "#ff00ff");

      var imageData0 = Array.from(canvasContexts[0].getImageData(0, 0, 6, 6).data),
        imageData1 = Array.from(canvasContexts[1].getImageData(0, 0, 6, 6).data),
        imageData2 = Array.from(canvasContexts[2].getImageData(0, 0, 6, 6).data),
        imageData3 = Array.from(canvasContexts[3].getImageData(0, 0, 6, 6).data);

      expect.deepEquals([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 0, 255, 255
      ], imageData3, "Upper left of filled rectangle visible on panned playfield's canvas3's bottom right");

      expect.deepEquals([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        255, 0, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
      ], imageData2, "Upper right of filled rectangle visible on panned playfield's canvas2's bottom left");

      expect.deepEquals([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 0, 255, 255,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
      ], imageData1, "Bottom left of filled rectangle visible on panned playfield's canvas1's top right");

      expect.deepEquals([
        255, 0, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
      ], imageData0, "Bottom right of filled rectangle visible on panned playfield's canvas0's top left");
    });
  });

  describe("paintCharacter >", function() {
    var html5ScrollableCanvas,
      canvasContexts,
      characterMap8x8;

    /**
     * make string containing 16bit unsigned integers in its characters from number parameters
     *
     * @param {...number} var_args array[8] of 8-bit integer numbers
     * @returns {string} 8 character string, each character is an encoded 8-bit row of a character definition
     */
    function makeU16String() {
      var out = [],
        numberArray = Array.from(arguments);

      for(var i = 0; i < 8; i++) {
        out.push(constants.ALL_CHARACTERS[numberArray[i]]);
      }

      return out.join("");
    }

    /**
     * @param {string} str
     * @returns {Array.<number>}
     */
    function makeU16Array(str) {
      var out = [],
        i, ii;

      for(i = 0, ii = str.length; i < ii; i++) {
        out.push(str.charCodeAt(i));
      }

      return out;
    }

    beforeEach(function() {
      characterMap8x8 = new CharacterMap(CharacterMap.Format.W8H8B1, 0, makeU16String(0xf0, 0xf0, 0xf0, 0xf0, 0x0f, 0x0f, 0x0f, 0x0f));

      // override default canvas size to something small that we can easily test the contents of
      systemProperties = new SystemProperties();
      systemProperties.setProperty(constants.KEY_DISPLAY_WIDTH, 16);
      systemProperties.setProperty(constants.KEY_DISPLAY_HEIGHT, 16);

      // populate the playfieldDiv with four canvases
      html5ScrollableCanvas = new Html5ScrollableCanvas(stubPlayfield, document, nodeCache, systemProperties, domMutationsLog);

      // get the playfieldDiv and canvases out of the DomMutationsLog
      canvasContexts = [
        domMutationsLog.findEntryByClassName(DomEventType.APPEND_CHILD, "c0").data.childNode.getContext("2d"),
        domMutationsLog.findEntryByClassName(DomEventType.APPEND_CHILD, "c1").data.childNode.getContext("2d"),
        domMutationsLog.findEntryByClassName(DomEventType.APPEND_CHILD, "c2").data.childNode.getContext("2d"),
        domMutationsLog.findEntryByClassName(DomEventType.APPEND_CHILD, "c3").data.childNode.getContext("2d")
      ];
    });

    it("can render an 8x8 character map to the scrollable canvas", function() {
      html5ScrollableCanvas.paintCharacter(0, 0, "#ffffff", characterMap8x8);

      var imageData0 = Array.from(canvasContexts[0].getImageData(0, 0, 16, 16).data),
        imageData1 = Array.from(canvasContexts[1].getImageData(0, 0, 16, 16).data),
        imageData2 = Array.from(canvasContexts[2].getImageData(0, 0, 16, 16).data),
        imageData3 = Array.from(canvasContexts[3].getImageData(0, 0, 16, 16).data);

      expect.deepEquals([
/*0 */  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
/*1 */  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
/*2 */  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
/*3 */  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
/*4 */  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
/*5 */  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
/*6 */  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
/*7 */  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
/*8 */  255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
/*9 */  255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
/*10*/  255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
/*11*/  255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
/*12*/  255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
/*13*/  255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
/*14*/  255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
/*15*/  255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
      ], imageData0, "expected 16x16 pixel checkerboard pattern was written to canvas 0");

      expect.equals(_.reduce(imageData1, function(accum, value) { return accum + value; }), 0, "nothing painted to canvas 1");
      expect.equals(_.reduce(imageData2, function(accum, value) { return accum + value; }), 0, "nothing painted to canvas 2");
      expect.equals(_.reduce(imageData3, function(accum, value) { return accum + value; }), 0, "nothing painted to canvas 3");
    });
  });
});

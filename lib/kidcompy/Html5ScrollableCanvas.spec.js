var DomTools = require("./DomTools"),
  DomEventType = require("./DomEventType"),
  DomMutationsLog = require("./DomMutationsLog"),
  SystemProperties = require("./SystemProperties"),
  constants = require("./constants"),
  DomNodeCache = require("./DomNodeCache"),
  Html5ScrollableCanvas = require("./Html5ScrollableCanvas");

describe("Html5PlayableCanvas.spec >", function() {
  var domMutationsLog,
    systemProperties,
    nodeCache,
    fakePlayfieldNode;

  beforeEach(function() {
    systemProperties = new SystemProperties();

    domMutationsLog = new DomMutationsLog(true);
    nodeCache = new DomNodeCache(window.document);

    fakePlayfieldNode = document.createElement("div");
    fakePlayfieldNode.setAttribute("id", "fb0");
    document.getElementsByTagName("body")[0].appendChild(fakePlayfieldNode);
  });

  afterEach(function() {
    fakePlayfieldNode.parentNode.removeChild(fakePlayfieldNode);
  });

  describe("init >", function() {
    it("will create one clip div and four canvases", function() {
      var html5ScrollableCanvas = new Html5ScrollableCanvas(fakePlayfieldNode, systemProperties, domMutationsLog);

      proclaim.isNotNull(html5ScrollableCanvas);

      // 1 clip div + 4 canvases were appended to the playfieldDiv and they have identifying css classes +
      // 4 position child
      proclaim.equal(9, domMutationsLog.entries.length, "nine dom mutations happened");
      proclaim.equal("DIV", domMutationsLog.entries[0].data.childNode.tagName, "first tag appended was the clip DIV");
      proclaim.equal("CANVAS", domMutationsLog.entries[1].data.childNode.tagName, "second tag appended was a CANVAS");
      proclaim.isTrue(DomTools.hasClass(domMutationsLog.entries[1].data.childNode, "c0"), "0th css class identifier");
      proclaim.isTrue(DomTools.hasClass(domMutationsLog.entries[4].data.childNode, "c3"), "3rd css class identifier");
    });

    it("will set inline styles for width and height", function() {
      var html5ScrollableCanvas = new Html5ScrollableCanvas(fakePlayfieldNode, systemProperties, domMutationsLog);

      proclaim.isNotNull(html5ScrollableCanvas);

      proclaim.equal(constants.DEFAULT_DISPLAY_WIDTH,
        parseInt(DomTools.getTagAttribute(domMutationsLog.entries[1].data.childNode, "width"), 10),
        "Expect that canvases will receive the default compy display width");
      proclaim.equal(constants.DEFAULT_DISPLAY_HEIGHT,
        parseInt(DomTools.getTagAttribute(domMutationsLog.entries[1].data.childNode, "height"), 10),
        "Expect that canvases will receive the default compy display height");

      proclaim.equal(constants.DEFAULT_DISPLAY_WIDTH,
        parseInt(DomTools.getTagAttribute(domMutationsLog.entries[4].data.childNode, "width"), 10),
        "Expect that canvases will receive the default compy display width");
      proclaim.equal(constants.DEFAULT_DISPLAY_HEIGHT,
        parseInt(DomTools.getTagAttribute(domMutationsLog.entries[4].data.childNode, "height"), 10),
        "Expect that canvases will receive the default compy display height");
    });
  });

  describe("getCanvasWidth and getCanvasHeight >", function() {
    var html5ScrollableCanvas;

    beforeEach(function() {
      html5ScrollableCanvas = new Html5ScrollableCanvas(fakePlayfieldNode, systemProperties, domMutationsLog);
    });

    it("must return constants from constants.js by default", function() {
      proclaim.equal(constants.DEFAULT_DISPLAY_WIDTH, html5ScrollableCanvas.getCanvasWidth(), "width from SystemProperties");
      proclaim.equal(constants.DEFAULT_DISPLAY_HEIGHT, html5ScrollableCanvas.getCanvasHeight(), "height from SystemProperties");
    });
  });

  describe("reposition >", function() {
    var html5ScrollableCanvas;

    beforeEach(function() {
      var dummyDomMutationsLog = new DomMutationsLog();

      // populate the playfieldDiv with four canvases
      html5ScrollableCanvas = new Html5ScrollableCanvas(fakePlayfieldNode, systemProperties, dummyDomMutationsLog);
    });

    it("will layout the canvases in the default positions", function() {
      html5ScrollableCanvas.canvasPositionX = 0;
      html5ScrollableCanvas.canvasPositionY = 0;
      html5ScrollableCanvas.topLeftCanvas = 0;

      // this should result in the canvases being positioned relative to the playfieldDiv and to each other in
      // the power-on positions
      html5ScrollableCanvas.reposition(fakePlayfieldNode, domMutationsLog);

      proclaim.isTrue(DomTools.hasClass(domMutationsLog.entries[0].data.childNode, "c0"), "c0 is 0th dom mutation");
      proclaim.equal(0, domMutationsLog.entries[0].data.x, "Canvas 0 at (0, 0)");
      proclaim.equal(0, domMutationsLog.entries[0].data.y, "Canvas 0 at (0, 0)");

      proclaim.isTrue(DomTools.hasClass(domMutationsLog.entries[1].data.childNode, "c1"), "c1 is 1st dom mutation");
      proclaim.equal(constants.DEFAULT_DISPLAY_WIDTH, domMutationsLog.entries[1].data.x, "Canvas 1 at 320, 0)");
      proclaim.equal(0, domMutationsLog.entries[1].data.y, "Canvas 1 at (320, 0)");

      proclaim.isTrue(DomTools.hasClass(domMutationsLog.entries[2].data.childNode, "c2"), "c2 is 2nd dom mutation");
      proclaim.equal(0, domMutationsLog.entries[2].data.x, "Canvas 2 at (0, 240)");
      proclaim.equal(constants.DEFAULT_DISPLAY_HEIGHT, domMutationsLog.entries[2].data.y, "Canvas 2 at (0, 240)");

      proclaim.isTrue(DomTools.hasClass(domMutationsLog.entries[3].data.childNode, "c3"), "c3 is 3rd dom mutation");
      proclaim.equal(constants.DEFAULT_DISPLAY_WIDTH, domMutationsLog.entries[3].data.x, "Canvas 3 at (320, 240)");
      proclaim.equal(constants.DEFAULT_DISPLAY_HEIGHT, domMutationsLog.entries[3].data.y, "Canvas 3 at (320, 240)");
    });

    it("will layout the canvases in a wacky scrolled position", function() {
      html5ScrollableCanvas.canvasPositionX = -10;
      html5ScrollableCanvas.canvasPositionY = -20;
      html5ScrollableCanvas.topLeftCanvas = 3;

      // this shows what happens if canvas 3 is in the top-left-most position
      html5ScrollableCanvas.reposition(fakePlayfieldNode, domMutationsLog);

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
    var html5ScrollableCanvas,
      canvasContexts;

    beforeEach(function() {
      // override default canvas size to something small that we can easily test the contents of
      systemProperties = new SystemProperties();
      systemProperties.setProperty(constants.KEY_DISPLAY_WIDTH, 6);
      systemProperties.setProperty(constants.KEY_DISPLAY_HEIGHT, 6);

      // populate the playfieldDiv with four canvases
      html5ScrollableCanvas = new Html5ScrollableCanvas(fakePlayfieldNode, systemProperties, domMutationsLog);

      // get the playfieldDiv and canvases out of the DomMutationsLog
      canvasContexts = [
        domMutationsLog.findEntryByClassName(DomEventType.APPEND_CHILD, "c0").data.childNode.getContext("2d"),
        domMutationsLog.findEntryByClassName(DomEventType.APPEND_CHILD, "c1").data.childNode.getContext("2d"),
        domMutationsLog.findEntryByClassName(DomEventType.APPEND_CHILD, "c2").data.childNode.getContext("2d"),
        domMutationsLog.findEntryByClassName(DomEventType.APPEND_CHILD, "c3").data.childNode.getContext("2d")
      ];
    });

    it("will fill pixels across the canvas", function() {
      html5ScrollableCanvas.fillRectangle(fakePlayfieldNode, 2, 2, 2, 2, "#ff00ff");

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
      html5ScrollableCanvas.pan(fakePlayfieldNode, -3, -3, domMutationsLog);
      proclaim.equal(3, html5ScrollableCanvas.topLeftCanvas, "the pan operation left canvas #3 in the top left spot");
      html5ScrollableCanvas.fillRectangle(fakePlayfieldNode, 2, 2, 2, 2, "#ff00ff");

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

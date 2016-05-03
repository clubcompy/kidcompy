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

var KidcompyHost = require("../kidcompy/KidcompyHost"),
  FlipBuffer = require("../kidcompy/FlipBuffer"),
  DomTools = require("../kidcompy/DomTools");

describe("kidcompy.comp", function() {
  var frame,
    kidcompyHost,
    kcHostTag;

  beforeEach(function() {
    frame = kidcompy.quixoteFrame;
    frame.reset();

    // always start with an initialized KidcompyHost in the frame with all its power-on DOM complete
    kcHostTag = frame.add("<div id='kidcompyHost'></div>", "kidcompy DOM tree");
    var kcHostDiv = kcHostTag.toDomElement();

    // just for robust testing of alignments of children, add horizontal centering and a top margin so that we can
    // test relative positioning with children of the host
    DomTools.setInlineStyle(kcHostDiv, "margin", "25px auto 0px auto");

    kidcompyHost = new KidcompyHost("kidcompyHost", kcHostDiv.ownerDocument);

    // verify the alignments are working before we get out of this beforeEach
    kcHostTag.assert({
      top: frame.page().top.plus(25)
    }, "top of host is 25px from top of frame");

    kcHostTag.assert({
      center: frame.page().center
    }, "host is horizontally centered in frame");
  });

  describe("flipbuffers under kidcompyHost", function() {
    it("aligns all flipbuffers with the top-left of the kidcompyHost", function() {
      var flipBuffer0 = frame.get("#kidcompyHost .f0"),
        flipBuffer1 = frame.get("#kidcompyHost .f1");

      flipBuffer1.assert({
        top: flipBuffer0.top,
        left: flipBuffer0.left
      }, "FlipBuffer #0 is overlapping FlipBuffer #1");
    });
  });

  describe("playfields under flipbuffers", function() {
    var flipBufferPlayfields;

    // find all of the playfields in both flipbuffers
    beforeEach(function() {
      var i, j;

      flipBufferPlayfields = [];

      for(i = 0; i < 2; i++) {
        flipBufferPlayfields.push([]);
        for(j = 0; j < 8; j++) {
          flipBufferPlayfields[i][j] = frame.get("#kidcompyHost .f" + i + " .p" + j);
        }
      }
    });

    it("aligns all playfields with the top-left of the parent flipbuffer", function() {
      var i, j;

      for(i = 0; i < 2; i++) {
        for(j = 1; j < FlipBuffer.PLAYFIELD_COUNT; j++) {
          flipBufferPlayfields[i][j].assert({
            top: flipBufferPlayfields[i][0].top,
            left: flipBufferPlayfields[i][0].left
          }, "Playfield " + j + " in FlipBuffer " + i + " must align to the top-left of Playfield 0");
        }
      }
    });
  });
});

module.exports = "kidcompy.comp.js";

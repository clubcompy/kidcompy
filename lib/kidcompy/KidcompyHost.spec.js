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

var KidcompyHost = require("./KidcompyHost");

// jscs: disable

describe("KidcompyHost > ", function() {
  var theDiv;

  beforeEach(function() {
    theDiv = document.createElement("div");
  });

  afterEach(function() {
    if(theDiv.parentNode) {
      theDiv.parentNode.removeChild(theDiv);
    }
  });

  describe("constructor (called via kidcompy.create()) > ", function() {
    it("pulls the id out of theDiv", function() {
      // if theDiv has no ID or blank ID, it should throw
      theDiv.setAttribute("id", "");
      proclaim.throws(function() {
        kidcompy.create(theDiv);
      }, Error, "blank ID should not be tolerated");

      // if theDiv has a non-empty ID, it should succeed and get a copy of the ID in kidcompyHost.rootId
      var expectedId = "divtacularDiv";
      theDiv.setAttribute("id", expectedId);

      var kidcompyHost = kidcompy.create(theDiv);
      proclaim.isNotNull(kidcompyHost);

      kidcompy.log(kidcompyHost);

      proclaim.equal(kidcompyHost.rootId, expectedId, "The id should have been extracted from theDiv");
    });

    it("adds FlipBuffers to theDiv", function() {
      theDiv.setAttribute("id", "myID");

      var kidcompyHost = kidcompy.create(theDiv);

      proclaim.equal(2, kidcompyHost.flipBuffers.length, "The flipbuffers were attached");
      proclaim.equal("f0", kidcompyHost.flipBuffers[0].id);
      proclaim.equal("f1", kidcompyHost.flipBuffers[1].id);
    });

  });

  describe("attachFlipBuffers (static) > ", function() {
    it("constructs two FlipBuffers with expected attributes", function() {
      var flipBuffers = KidcompyHost.attachFlipBuffers(theDiv);

      proclaim.equal(2, flipBuffers.length);
      proclaim.equal("f0", flipBuffers[0].id);
      proclaim.equal("f1", flipBuffers[1].id);

      proclaim.equal(2, theDiv.childNodes.length);
    });
  });
});


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

describe("KidcompyHost", function() {
  /** @type {Element} */
  var theDiv;

  beforeEach(function() {
    theDiv = document.createElement("div");
  });

  afterEach(function() {
    if(theDiv.parentNode) {
      theDiv.parentNode.removeChild(theDiv);
    }
  });

  it("pulls the id out of theDiv", function() {
    var expectedId = "divtacularDiv";

    theDiv.setAttribute("id", expectedId);

    var kidcompyHost = kidcompy.create(theDiv);
    proclaim.equal(kidcompyHost.rootId, expectedId, "The id should have been extracted from theDiv");
  });

  it("adds FlipBuffer content to theDiv", function() {
    theDiv.setAttribute("id", "myID");

    var kidcompyHost = kidcompy.create(theDiv);

    proclaim.equal(2, kidcompyHost.flipBuffers.length, "The flipbuffers were attached");
  });

  describe("attachFlipBuffers (static)", function() {
    it("constructs two FlipBuffers with expected attributes", function() {
      var flipBuffers = KidcompyHost.attachFlipBuffers(theDiv);

      proclaim.equal(2, flipBuffers.length);
      proclaim.equal("f0", flipBuffers[0].id);
      proclaim.equal("f1", flipBuffers[1].id);

      proclaim.equal(2, theDiv.childNodes.length);
    });
  });

  });


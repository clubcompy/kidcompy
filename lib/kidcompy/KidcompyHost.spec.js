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

var KidcompyHost = require("./KidcompyHost"),
  DomEventType = require("./DomEventType"),
  SystemProperties = require("./SystemProperties"),
  DomMutationsLog = require("./DomMutationsLog");

// jscs: disable

describe("KidcompyHost.spec", function() {
  var theDiv;

  beforeEach(function() {
    theDiv = document.createElement("div");
  });

  afterEach(function() {
    if(theDiv.parentNode) {
      theDiv.parentNode.removeChild(theDiv);
    }
  });

  describe("init", function() {
    it("pulls the id out of theDiv", function() {
      var kidcompyHost;

      // if theDiv has no ID or blank ID, it should throw
      theDiv.setAttribute("id", "");
      proclaim.throws(function() {
        kidcompyHost = new KidcompyHost(theDiv);
      }, Error, "blank ID should not be tolerated");


      // if theDiv has a non-empty ID, it should succeed and get a copy of the ID in kidcompyHost.nodeId
      var expectedId = "divtacularDiv";
      theDiv.setAttribute("id", expectedId);

      kidcompyHost = new KidcompyHost(theDiv);
      proclaim.isNotNull(kidcompyHost);

      proclaim.equal(kidcompyHost.nodeId, expectedId, "The id should have been extracted from theDiv");
    });

    it("adds FlipBuffers to theDiv", function() {
      theDiv.setAttribute("id", "myID");

      var domMutations = new DomMutationsLog(true),
        kidcompyHost = new KidcompyHost(theDiv, domMutations);

      proclaim.equal(2, kidcompyHost.flipBuffers.length, "The flipbuffers were attached");
      proclaim.equal("f0", kidcompyHost.flipBuffers[0].nodeId);
      proclaim.equal("f1", kidcompyHost.flipBuffers[1].nodeId);

      // the mutations log should have a record of the DOM appends inside KidcompyHost
      proclaim.isNotNull(domMutations.findEntryByClassName(DomEventType.APPEND_CHILD, "f0"));
      proclaim.isNotNull(domMutations.findEntryByClassName(DomEventType.APPEND_CHILD, "f1"));
    });

  });

  describe("attachFlipBuffers", function() {
    it("constructs two FlipBuffers with expected attributes", function() {
      theDiv.setAttribute("id", "myID");

      // test call the function on the prototype directly, it should be safe to do since the 'this' isn't accessed
      var flipBuffers = KidcompyHost.attachFlipBuffers({ isKidcompyHost: true }, theDiv, new SystemProperties(),
        new DomMutationsLog());

      proclaim.equal(2, flipBuffers.length, "there are 2 flipbuffers");
      proclaim.equal("f0", flipBuffers[0].nodeId, "first id is correct");
      proclaim.equal("f1", flipBuffers[1].nodeId, "first id is correct");

      proclaim.equal(2, Array.from(theDiv.childNodes).length, "there are two new child Elements under theDiv");
    });
  });
});


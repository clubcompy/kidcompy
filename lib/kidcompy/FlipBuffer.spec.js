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

var FlipBuffer = require("./FlipBuffer"),
  DomMutationsLog = require("./DomMutationsLog"),
  DomTools = require("./DomTools"),
  SystemProperties = require("./SystemProperties");

// jscs: disable

describe("FlipBuffer.spec", function() {
  var rootDiv;

  beforeEach(function() {
    rootDiv = document.createElement("div");
  });

  describe("init", function() {
    it("should add its div to the Host's div", sinon.test(function() {
      // the FlipBuffer will inject it's div directly under the rootDiv that gets passed in by the KidcompyHost
      var flipBuffer = new FlipBuffer({isKidcompyHost: true}, rootDiv, 0, new SystemProperties(), new DomMutationsLog());

      proclaim.isTrue(DomTools.hasClass(rootDiv.firstChild, "f0"), "the FlipBuffer's div has the expected class name");
      proclaim.equal("f0", flipBuffer.classId, "the flipBuffer has a copy of its div's classId");
    }));

    it("must add 8 Playfields to the FlipBuffer", function() {
      var flipBuffer = new FlipBuffer({isKidcompyHost: true}, rootDiv, 1, new SystemProperties(), new DomMutationsLog());

      proclaim.equal(8, flipBuffer.playfields.length, "8 Playfields were created");

      // now check to see that the playfield ID's are ordered and wired up to the parent
      for(var i = 0, ii = 8; i < ii; i++) {
        proclaim.equal(flipBuffer, flipBuffer.playfields[i].parent, "parent is correct");
        proclaim.equal("p" + i, flipBuffer.playfields[i].classId, "ID's are correct");
      }
    });

  });
});

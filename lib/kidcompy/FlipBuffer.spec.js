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
  DomNodeType = require("./DomNodeType"),
  DomMutationsLog = require("./DomMutationsLog"),
  DomTools = require("./DomTools"),
  DomNodeCache = require("./DomNodeCache"),
  StubDomNodeSurrogate = require("./StubDomNodeSurrogate"),
  SystemProperties = require("./SystemProperties");

// jscs: disable

describe("FlipBuffer.spec", function() {
  var rootDiv,
    nodeCache,
    fakeKidcompyHost;

  beforeEach(function() {
    nodeCache = new DomNodeCache(window.document);

    rootDiv = document.createElement("div");
    rootDiv.setAttribute("id", "rootDiv");
    document.getElementsByTagName("body")[0].appendChild(rootDiv);

    fakeKidcompyHost = new StubDomNodeSurrogate(null, "rootDiv", DomNodeType.KIDCOMPY_HOST);
  });

  afterEach(function() {
    rootDiv.parentNode.removeChild(rootDiv);
  });

  describe("init", function() {
    it("should add its div to the Host's div", sinon.test(function() {
      // the FlipBuffer will inject it's div directly under the rootDiv that gets passed in by the KidcompyHost
      var flipBuffer = new FlipBuffer(fakeKidcompyHost, nodeCache, 0, false, window.document, new SystemProperties(),
        new DomMutationsLog());

      expect.isTrue(DomTools.hasClass(rootDiv.firstChild, "kcFlipBuffer"), "the FlipBuffer's div has the css style class name");
      expect.isTrue(DomTools.hasClass(rootDiv.firstChild, "f0"), "the FlipBuffer's div has the identifier class name");
      expect.equals("f0", flipBuffer.nodeId, "the flipBuffer has a copy of its div's nodeId");
    }));

    it("will not add 'last' css classname to flipbuffer div's when isLast is false", sinon.test(function() {
      // the FlipBuffer will inject it's div directly under the rootDiv that gets passed in by the KidcompyHost
      var props = new SystemProperties(),
        log = new DomMutationsLog(),
        flipBuffer = new FlipBuffer(fakeKidcompyHost, nodeCache, 0, false, window.document, props, log);

      expect.isFalse(DomTools.hasClass(rootDiv.firstChild, "last"), "No 'last' class on " + flipBuffer.nodeId);
    }));

    it("will add 'last' css classname to flipbuffer div's when isLast is true", sinon.test(function() {
      // the FlipBuffer will inject it's div directly under the rootDiv that gets passed in by the KidcompyHost
      var props = new SystemProperties(),
        log = new DomMutationsLog(),
        flipBuffer = new FlipBuffer(fakeKidcompyHost, nodeCache, 1, true, window.document, props, log);

      expect.isTrue(DomTools.hasClass(rootDiv.firstChild, "last"), "'last' class daded on " + flipBuffer.nodeId);
    }));

    it("must add 8 Playfields to the FlipBuffer", function() {
      var flipBuffer = new FlipBuffer(fakeKidcompyHost, nodeCache, 1, true, window.document, new SystemProperties(),
        new DomMutationsLog());

      expect.equals(8, flipBuffer.playfields.length, "8 Playfields were created");

      // now check to see that the playfield ID's are ordered and wired up to the parent
      for(var i = 0, ii = 8; i < ii; i++) {
        expect.equals(flipBuffer, flipBuffer.playfields[i].parent, "parent is correct");
        expect.equals("p" + i, flipBuffer.playfields[i].nodeId, "ID's are correct");
      }
    });

  });
});

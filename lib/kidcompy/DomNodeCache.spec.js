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

// jshint -W098
var DomNodeCache = require("./DomNodeCache"),
  KidcompyHost = require("./KidcompyHost"),
  DomMutationsLog = require("./DomMutationsLog"),
  DomNodeType = require("./DomNodeType"),
  FlipBuffer = require("./FlipBuffer"),
  Playfield = require("./Playfield"),
  SystemProperties = require("./SystemProperties"),
  StubDomNodeSurrogate = require("./StubDomNodeSurrogate");

describe("DomNodeCache.spec", function() {
  var domNodeCache,
    systemProperties = new SystemProperties(),
    mutationsLog = new DomMutationsLog(true),
    hostDiv = null;

  beforeEach(function() {
    domNodeCache = new DomNodeCache(window.document);
  });

  afterEach(function() {
    if(hostDiv && hostDiv.parentNode) {
      hostDiv.parentNode.removeChild(hostDiv);
    }

    hostDiv = null;
  });

  describe("putNodeInCache, getCachedNode", function() {
    it("can add something to the cache and then get it out again by its ID", function() {
      var hostDiv = document.createElement("div"),
        fakeKidcompyHost;

      hostDiv.setAttribute("id", "myHostDiv");
      document.getElementsByTagName("body")[0].appendChild(hostDiv);
      fakeKidcompyHost = new StubDomNodeSurrogate(null, "myHostDiv", DomNodeType.KIDCOMPY_HOST, domNodeCache);

      expect.isNull(domNodeCache.getCachedNode(fakeKidcompyHost), "not there yet");
      domNodeCache.putNodeInCache(fakeKidcompyHost, hostDiv);
      expect.isNotNull(domNodeCache.getCachedNode(fakeKidcompyHost), "ok it's in there");
    });
  });

  describe("findDomNode", function() {
    it("can get an already cached Node", function() {
      var fakeKidcompyHost;

      hostDiv = document.createElement("div");
      hostDiv.setAttribute("id", "myHostDiv");
      document.getElementsByTagName("body")[0].appendChild(hostDiv);

      fakeKidcompyHost = new StubDomNodeSurrogate(null, "myHostDiv", window.document, DomNodeType.KIDCOMPY_HOST,
        domNodeCache);

      // use the internal putNodeInCache to force a node into the cache
      domNodeCache.putNodeInCache(fakeKidcompyHost, hostDiv);
      expect.isNotNull(domNodeCache.findDomNode(fakeKidcompyHost));
    });

    it("can get a root Node not already cached", function() {
      var fakeKidcompyHost;

      // create a div for the KidcompyHost and attach it to the body
      hostDiv = /** @type {Node} */ document.createElement("div");
      hostDiv.setAttribute("id", "myHostDiv");
      document.getElementsByTagName("body")[0].appendChild(hostDiv);

      fakeKidcompyHost = new StubDomNodeSurrogate(null, "myHostDiv", window.document, DomNodeType.KIDCOMPY_HOST,
        domNodeCache);
      expect.isNotNull(domNodeCache.findDomNode(fakeKidcompyHost));
    });

    it("can get a nested Node not already cached", function() {
      var kidcompyHost,
        nested1stLevel,
        nested2ndLevel;

      // create a div for the KidcompyHost and attach it to the body
      hostDiv = /** @type {Node} */ document.createElement("div");
      hostDiv.setAttribute("id", "myHostDiv");
      document.getElementsByTagName("body")[0].appendChild(hostDiv);

      kidcompyHost = new KidcompyHost("myHostDiv", window.document, domNodeCache);
      nested1stLevel = kidcompyHost.flipBuffers[0];
      nested2ndLevel = nested1stLevel.playfields[0];

      expect.isNotNull(domNodeCache.findDomNode(nested2ndLevel), "the DomNodeCache is able to find nodes");
      expect.isNotNull(domNodeCache.getCachedNode(nested1stLevel), "the DomNodeCache also cached the 1st level");
      expect.isNotNull(domNodeCache.getCachedNode(kidcompyHost), "the DomNodeCache also cached root/host level");
    });
  });
});

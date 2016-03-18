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
var DomNodeType = require("./DomNodeType"),
  StubDomNodeSurrogate = require("./StubDomNodeSurrogate"),
  DomNodeCache = require("./DomNodeCache");

describe("DomNodeSurrogate.spec", function() {
  beforeEach(function() {
    var rootNode = document.createElement("div");

    rootNode.setAttribute("id", "rootNodeId");

    document.getElementsByTagName("body")[0].appendChild(rootNode);
  });

  afterEach(function() {
    var rootNode = document.getElementById("rootNodeId");

    rootNode.parentNode.removeChild(rootNode);
  });

  describe("generateCacheId", function() {
    it("can generate a cache id for a root DomNodeSurrogate", function() {
      // build a new surrogate
      var aSurrogate = new StubDomNodeSurrogate(null, "rootNodeId", DomNodeType.KIDCOMPY_HOST);

      expect.equals("#rootNodeId", aSurrogate.cacheId, "what a root node's cache ID looks like");
    });

    it("can generate a cache id for a nested DomNodeSurrogate", function() {
      // build a new surrogate
      var aSurrogate = new StubDomNodeSurrogate(null, "rootNodeId", DomNodeType.KIDCOMPY_HOST),
        bSurrogate = new StubDomNodeSurrogate(aSurrogate, "1stLevelId", DomNodeType.FLIPBUFFER),
        cSurrogate = new StubDomNodeSurrogate(bSurrogate, "2ndLevelId", DomNodeType.PLAYFIELD);

      expect.equals("#rootNodeId", aSurrogate.cacheId, "what a root node's cache ID looks like");
      expect.equals("#rootNodeId .1stLevelId", bSurrogate.cacheId, "what a nested node's cache ID looks like");
      expect.equals("#rootNodeId .1stLevelId .2ndLevelId", cSurrogate.cacheId, "what a nested node's cache ID looks like");
    });
  });
});

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

var DomNodeType = require("./DomNodeType"),
  DomNodeSurrogate = require("./DomNodeSurrogate");

/**
 * Surrogate stub for tests below
 *
 * @constructor
 * @extends {DomNodeSurrogate}
 * @param {(DomNodeSurrogate|null)} parent parent {@link DomNodeSurrogate} or null
 * @param {string} nodeId "id" attribute from related DOM Node, or css classname uniquely identifying a DOM Node in
 * a subtree
 * @param {DomNodeType} nodeType enum characterizing this node's type
 */
function StubDomNodeSurrogate(parent, nodeId, nodeType) {
  DomNodeSurrogate.call(this, parent, nodeId, nodeType);
}

StubDomNodeSurrogate.prototype = Object.create(DomNodeSurrogate.prototype);

describe("DomNodeSurrogate.spec", function() {
  describe("generateCacheId", function() {
    it("can generate a cache id for a root DomNodeSurrogate", function() {
      // build a new surrogate
      var aSurrogate = new StubDomNodeSurrogate(null, "rootNodeId", DomNodeType.KIDCOMPY_HOST);

      proclaim.equal(aSurrogate.cacheId, "#rootNodeId", "what a root node's cache ID looks like");
    });

    it("can generate a cache id for a nested DomNodeSurrogate", function() {
      // build a new surrogate
      var aSurrogate = new StubDomNodeSurrogate(null, "rootNodeId", DomNodeType.KIDCOMPY_HOST),
        bSurrogate = new StubDomNodeSurrogate(aSurrogate, "1stLevelId", DomNodeType.FLIPBUFFER),
        cSurrogate = new StubDomNodeSurrogate(bSurrogate, "2ndLevelId", DomNodeType.PLAYFIELD);

      proclaim.equal(aSurrogate.cacheId, "#rootNodeId", "what a root node's cache ID looks like");
      proclaim.equal(bSurrogate.cacheId, "#rootNodeId .1stLevelId", "what a nested node's cache ID looks like");
      proclaim.equal(cSurrogate.cacheId, "#rootNodeId .1stLevelId .2ndLevelId", "what a nested node's cache ID looks like");
    });
  });
});

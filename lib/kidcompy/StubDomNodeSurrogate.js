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

var DomNodeSurrogate = require("./DomNodeSurrogate"),
  DomMutationsLog = require("./DomMutationsLog"),
  DomNodeCache = require("./DomNodeCache");

/**
 * Surrogate stub for use in unit tests, do not import this into production code
 *
 * @constructor
 * @extends {DomNodeSurrogate}
 * @param {(DomNodeSurrogate|null)} parent parent {@link DomNodeSurrogate} or null
 * @param {string} nodeId "id" attribute from related DOM Node, or css classname uniquely identifying a DOM Node in
 * a subtree
 * @param {DomNodeType} nodeType enum characterizing this node's type
 */
function StubDomNodeSurrogate(parent, nodeId, nodeType) {
  DomNodeSurrogate.call(this, parent, nodeId, nodeType, new DomNodeCache(), new DomMutationsLog());
}

StubDomNodeSurrogate.prototype = Object.create(DomNodeSurrogate.prototype);

/**
 * @private
 * @module kidcompy/StubDomNodeSurrogate
 */
module.exports = StubDomNodeSurrogate;

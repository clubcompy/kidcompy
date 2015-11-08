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

/**
 * Long-term JavaScript references to DOM nodes can lead to memory leaks.  This cache gives a convenient
 * way to search for and provide short-term cached references to DOM nodes that live in a common DOM subtree.
 *
 * <p>Within a subtree, searchable nodes are linked to a JavaScript {@link DomNodeSurrogate} object by a node id
 * at the subtree root, and by unique identifying css classnames for all nodes within the subtree.
 *
 * <p>A javascript object is always paired with a DOM node (or node cluster), and implements the DomNodeSurrogate
 * API in order to be cacheable by this class
 *
 * <p>A reset() function is provided that should be called regularly (like once per drawn frame) and prior to
 * system shutdown to release cached references and to give the browser a chance to garbage collect both the DOM
 * nodes and JavaScripts if needed.
 *
 * @constructor
 * @param {!DomNodeSurrogate} rootSurrogate this object represents the subtree root within JavaScript.  The root
 * surrogate is responsible for creating the DomNodeCache and shares its instance with all the child surrogate
 * objects it owns.
 */
function DomNodeCache(rootSurrogate) {
  /**
   * The JavaScript surrogate that points to the root of the DOM subtree this cache is responsible for
   *
   * @type {!DomNodeSurrogate}
   */
  this.rootSurrogate = rootSurrogate;

  /**
   * Cached DOM node that belongs to the rootSurrogate
   *
   * @type {?(Node|Element)}
   */
  this.rootDomNode = null;
}

/**
 * <strong>require("./kidcompy/DomNodeCache")</strong> &rArr;
 *
 * @module kidcompy/DomNodeCache
 */
module.exports = DomNodeCache;

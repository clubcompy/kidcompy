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

var DomTools = require("./DomTools");

/**
 * Long-term JavaScript references to DOM nodes can lead to memory leaks.  This cache gives a convenient
 * way to search for and provide short-term cached references to DOM nodes that live in a common DOM subtree. The
 * design of this class assumes that nodes it caches are never removed from the DOM until a total system reset or
 * shutdown.  Therefore, no staleness checks should ever be required for any of the nodes that this class caches.
 *
 * <p>Within a subtree, searchable nodes are linked to a JavaScript {@link DomNodeSurrogate} object by a node id
 * at the subtree root, and by unique identifying css classnames for all nodes within the subtree.
 *
 * <p>A javascript object is always paired with a DOM node (or node cluster), and implements the DomNodeSurrogate
 * API in order to be cacheable by this class
 *
 * <p>A reset() function is provided that should be called regularly (like once per drawn frame) and prior to
 * system shutdown to release cached references and to give the browser a chance to garbage collect both the DOM
 * nodes and JavaScripts if necessary.
 *
 * @constructor
 * @param {!Document} ownerDocument owner DOM Document of all Nodes in the cache
 */
function DomNodeCache(ownerDocument) {
  var self = this;

  /**
   * @name DomNodeCache#surrogateNodeMap
   * @type {!Object.<string,(Node|Element)>}
   */
  self.surrogateNodeMap = {};

  /**
   * @name DomNodeCache#ownerDocument
   * @type {!Document}
   */
  self.ownerDocument = ownerDocument;
}

/**
 * Find and cache a DOM node belonging to a DomNodeSurrogate.
 *
 * @param {!DomNodeSurrogate} domNodeSurrogate domNodeSurrogate is a javascript object that links to/owns a DOM node
 * @returns {(Node|Element)} DOM Node found by searching the cache and then the DOM
 * @throws {Error} if a Node is not found in the cache or in the DOM matching domNodeSurrogate
 */
DomNodeCache.prototype.findDomNode = function(domNodeSurrogate) {
  var self = this,
    domNode = self.getCachedNode(domNodeSurrogate),
    parentDomNode;

  if(domNode) {
    return domNode;
  }

  // recurse if there is a parent DomNodeSurrogate, otherwise just find the root Node by it's id
  if(domNodeSurrogate.parent) {
    parentDomNode = self.findDomNode(domNodeSurrogate.parent);

    domNode = DomTools.findChildByClass(parentDomNode, domNodeSurrogate.nodeId);
  }
  else {
    domNode = self.ownerDocument.getElementById(domNodeSurrogate.nodeId);
  }

  if(!domNode) {
    throw new Error("Failed to find " + domNodeSurrogate.nodeId);
  }

  // domNode was found!  cache and return it
  self.putNodeInCache(domNodeSurrogate, domNode);
  return domNode;
};

/**
 * Clear any cached DOM node references to allow the DOM and JavaScript to do garbage collection.
 *
 * You should call this method regularly, like once per drawn frame
 */
DomNodeCache.prototype.reset = function() {

};

/**
 * Get a DOM Node from the cache by its surrogate, if one exists there
 *
 * @package
 * @param {!DomNodeSurrogate} domNodeSurrogate
 * @returns {(Node|Element|null)} DOM Node found by searching the cache, or null if not found
 */
DomNodeCache.prototype.getCachedNode = function(domNodeSurrogate) {
  return this.surrogateNodeMap[domNodeSurrogate.cacheId] || null;
};

/**
 * Put a DOM Node in the cache.
 *
 * No parameter validation is performed.  It is assumed domNodeSurrogate and domNode got together and are non-null
 *
 * @package
 * @param {!DomNodeSurrogate} domNodeSurrogate domNodeSurrogate
 * @param {!(Node|Element)} domNode DOM Node
 */
DomNodeCache.prototype.putNodeInCache = function(domNodeSurrogate, domNode) {
  this.surrogateNodeMap[domNodeSurrogate.cacheId] = domNode;
};

/**
 * <strong>require("./kidcompy/DomNodeCache")</strong> &rArr;
 *
 * @module kidcompy/DomNodeCache
 */
module.exports = DomNodeCache;

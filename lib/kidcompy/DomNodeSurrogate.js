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
 * Base class for all DOM Node surrogate classes
 *
 * <p>A DOM Node surrogate is a JavaScript object in an object tree that represents one or more DOM Nodes in a
 * related cluster of nodes in a DOM subtree.  Actual references to the DOM are not held in the DOM Node surrogate,
 * only nodeId's are held.  {@link DomNodeCache} is responsible for holding any references into the DOM.
 *
 * @abstract
 * @constructor
 * @param {(DomNodeSurrogate|null)} parent parent {@link DomNodeSurrogate} or null
 * @param {string} nodeId "id" attribute from related DOM Node, or css classname uniquely identifying a DOM Node in
 * a subtree
 * @param {DomNodeType} nodeType enum characterizing this node's type
 */
function DomNodeSurrogate(parent, nodeId, nodeType) {
  var self = this;

  /**
   * The parent of this DomNodeSurrogate.  If null, then this is the root of a DOM Node subtree
   *
   * @name DomNodeSurrogate#parent
   * @type {(DomNodeSurrogate|null)}
   */
  self.parent = parent;

  /**
   * DOM Node id used in lookups to find the DOM Node related to this DomNodeSurrogate
   *
   * <p>This value varies depending on the value of DomNodeSurrogate#parent.  If parent is null, then this is
   * the "id" attribute from the related DOM Node, which serves as the root of a subtree.  If the parent is non-null,
   * then this is a css classname that uniquely identifies the related DOM Node within the subtree under the subtree
   * root.
   *
   * @name DomNodeSurrogate#nodeId
   * @type {string}
   */
  self.nodeId = nodeId;

  /**
   * Identifies the type of DomNodeSurrogate we are
   *
   * @name DomNodeSurrogate#nodeType
   * @type {DomNodeType}
   */
  self.nodeType = nodeType;
}

/**
 * <strong>require("./kidcompy/DomNodeSurrogate")</strong> &rArr; {@link DomNodeSurrogate}
 *
 * @module kidcompy/DomNodeSurrogate
 */
module.exports = DomNodeSurrogate;

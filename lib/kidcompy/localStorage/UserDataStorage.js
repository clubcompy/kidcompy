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

var DomNodeType = require("../DomNodeType"),
  DomNodeSurrogate = require("../DomNodeSurrogate"),
  DomTools = require("../DomTools");

/**
 * @extends {DomNodeSurrogate}
 * @param {!DomNodeSurrogate} kidcompyHost parent {@link KidcompyHost} that owns this UserDataStorage
 * @param {!DomNodeCache} nodeCache the cache for dom elements that provides our DOM CRUD operations
 * @param {!Document} ownerDocument owner DOM Document
 * @param {!DomMutationsLog} mutationsLog logger for mutations made to the DOM
 * @constructor
 */
function UserDataStorage(kidcompyHost, nodeCache, ownerDocument, mutationsLog) {
  var self = this,
    parentId = kidcompyHost.nodeId;

  /**
   * Owner {@link KidcompyHost} instance
   *
   * @name UserDataStorage#kidcompyHost
   * @type {!DomNodeSurrogate}
   */
  self.kidcompyHost = kidcompyHost;

  /**
   * @name UserDataStorage#nodeCache
   * @type {!DomNodeCache}
   */
  self.nodeCache = nodeCache;

  /* call super constructor */
  DomNodeSurrogate.call(self, null, parentId + "_kidcompyUserData", ownerDocument, DomNodeType.USER_DATA_STORAGE,
    nodeCache, mutationsLog);
}

/**
 * Generate DOM element for this DomNodeStorage.
 *
 * @returns {Element} root of your DomNodeSurrogate DOM subtree
 */
UserDataStorage.prototype.createDom = function() {
  var self = this,
    userDataLink = self.ownerDocument.createElement("link");

  // User Data Behaviors in IE6-8 require an ID that is consistent across page reloads to be set
  DomTools.setTagAttribute(userDataLink, "id", self.nodeId);

  // activate the user data behavior so that we have access to the user data API
  DomTools.setInlineStyle(userDataLink, "behavior", "url(#default#userData)");

  return userDataLink;
};

/**
 * Attach our userDataLink node to the head of the DOM.
 *
 * @param {DomMutationsLog} domMutationsLog
 * @param {(Element|Node)} domNode
 */
UserDataStorage.prototype.attachNodeToParent = function(domMutationsLog, domNode) {
  var self = this;

  domMutationsLog.appendChild(self.ownerDocument.getElementsByTagName("head")[0], domNode);
};

/**
 * put
 *
 * @param {!string} key
 * @param {!string} value
 */
UserDataStorage.prototype.put = function(key, value) {

};

/**
 * get
 *
 * @param {!string} key
 */
UserDataStorage.prototype.get = function(key) {

};

/**
 * <strong>require("./kidcompy/localStorage/UserDataStorage")</strong> &rArr; {@link UserDataStorage}
 *
 * @module kidcompy/localStorage/UserDataStorage
 */
module.exports = UserDataStorage;

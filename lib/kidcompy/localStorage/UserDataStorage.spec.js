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

var UserDataStorage = require("./UserDataStorage"),
  DomNodeCache = require("../DomNodeCache"),
  StubDomNodeSurrogate = require("../StubDomNodeSurrogate"),
  DomNodeType = require("../DomNodeType"),
  DomMutationsLog = require("../DomMutationsLog");

describe("UserDataStorage.spec", function() {
  // don't do any UserDataStorage testing on non-legacy msie
  if(!kidcompy.browser.msie || kidcompy.browser.version > 8) {
    return;
  }

  var userDataStorage = null,
    nodeCache,
    rootDiv,
    fakeKidcompyHost,
    domMutationsLog;

  beforeEach(function() {
    nodeCache = new DomNodeCache(window.document);

    rootDiv = document.createElement("div");
    rootDiv.setAttribute("id", "rootDiv");
    document.getElementsByTagName("body")[0].appendChild(rootDiv);

    fakeKidcompyHost = new StubDomNodeSurrogate(null, "rootDiv", DomNodeType.KIDCOMPY_HOST);
    domMutationsLog = new DomMutationsLog();

    userDataStorage = new UserDataStorage(fakeKidcompyHost, nodeCache, document, domMutationsLog);
  });

  afterEach(function() {
    var userDataStorageNode = nodeCache.findDomNode(userDataStorage);

    userDataStorageNode.parentNode.removeChild(userDataStorageNode);
  });

  it("inits with functioning user data store", function(done) {
    var userDataStorageNode = nodeCache.findDomNode(userDataStorage),
      retrievedValue;

    // set a persistent 'dataStorage' value
    userDataStorageNode.setAttribute("dataStorage", "test value");
    userDataStorageNode.save("dataStorage");

    // if everything is working, we should be able to load the dataStorage value successfully
    userDataStorageNode.load("dataStorage");
    retrievedValue = userDataStorageNode.getAttribute("dataStorage");
    expect.equals("test value", retrievedValue, "can retrieve data storage attr!");
  });
});

module.exports = "UserDataStorage.spec.js";

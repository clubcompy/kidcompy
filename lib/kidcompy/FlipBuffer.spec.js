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

var FlipBuffer = require("./FlipBuffer");

// jscs: disable

describe("FlipBuffer", function() {
  it("should add its div to the Host's div", function() {
    var rootDiv = document.createElement("div");

    // the FlipBuffer will inject it's div directly under the rootDiv that gets passed in by the KidcompyHost
    var flipBuffer = new FlipBuffer(rootDiv, 0);

    proclaim.equal("f0", rootDiv.firstChild.getAttribute("id"), "the FlipBuffer injects its div as a child under into the host's div");
    proclaim.equal("f0", flipBuffer.id, "the flipBuffer has a copy of its div's id");
  });
});

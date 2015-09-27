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

var Playfield = require("./Playfield");

describe("Playfield.spec >", function() {

  describe("constructor", function() {
    it("must take a truthy FlipBuffer", function() {
      proclaim.throws(function() {
        // jshint -W031
        new Playfield(null, null, 1);
      }, Error, "throws if it is a null FlipBuffer");
    });

    // test all the fields, test linkage to parent

  });
});

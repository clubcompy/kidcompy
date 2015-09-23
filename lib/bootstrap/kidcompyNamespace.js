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

// make the global kidcompy namespace if it doesn't already exist
if(typeof window["kidcompy"] === "undefined") {
  window["kidcompy"] = {};
}

// no module.exports here ... this module gets imported only once and the kidcompy symbol is added to the global scope.
// Access the kidcompy object directly with the assumption that the forward declarations in the externs.js will connect
// you with publicly exported properties

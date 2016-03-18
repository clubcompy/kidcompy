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

var SystemProperties = require("./SystemProperties"),
  constants = require("./constants");

describe("SystemProperties.spec", function() {
  describe("System defaults", function() {
    var oldSystemPropDefaults;

    beforeEach(function() {
      oldSystemPropDefaults = kidcompy.globalPropertyDefaults;
    });

    afterEach(function() {
      kidcompy.globalPropertyDefaults = oldSystemPropDefaults;
    });

    it("allows for system defaults to be set in a static map", function() {
      var systemProperties = new SystemProperties();

      expect.isFalse(systemProperties.hasProperty("propName"), "The property does not exist by default");

      // add a system default
      SystemProperties.setGlobalDefaultProperty("propName", "propValue");
      expect.isFalse(systemProperties.hasProperty("propName"), "Existing SystemProperties are not affected");

      // make a new system properties, see if the default is there
      systemProperties = new SystemProperties();
      expect.isTrue(systemProperties.hasProperty("propName"), "Property exists as default for new SystemProperties");
    });

    it("won't die if we construct a SystemProperties without any global defaults set", function() {
      var mySystemProperties = null;

      mySystemProperties = new SystemProperties();
      expect.isNotNull(mySystemProperties);
      expect.equals(constants.DEFAULT_DISPLAY_WIDTH, mySystemProperties.getNumberProperty(constants.KEY_DISPLAY_WIDTH));

      kidcompy.globalPropertyDefaults = null;

      expect.notThrows(function() {
        mySystemProperties = new SystemProperties();
      }, "SystemProperties should be created even though there are no globalPropertyDefaults set");

      expect.isNotNull(mySystemProperties, "construction should have worked");
      expect.isFalse(mySystemProperties.hasProperty(constants.KEY_DISPLAY_WIDTH));
    });
  });
});

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

var quixote = require("quixote"),
  ElapsedTime = require("elapsed-time");

/*
 * Root hooks that are installed before all tests
 */

before(function(done) {
  this.timeout(30000);

  // need to pause mocha for kidcompy's onCodeGo event to fire.  This ensures that all the scripts have loaded AND
  // inited before we attempt to run our tests
  kidcompy.lifecycleEvents.addOnCodeGoHandler(function() {
    var stopwatch = (new ElapsedTime()).start();

    // create the quixote frame
    kidcompy.quixoteFrame = quixote.createFrame({
      stylesheet: require("!url?limit=1&mimeType=text/css&name=[name].css?[hash]" +
                          "!text-webpack" +
                          "!sass?outputStyle=expanded!../lib/styles/kidcompy.scss")
    }, function() {
      kidcompy.log("quixote frame inited in " + stopwatch.getValue());

      done();
    });
  });
});

after(function() {
  if(kidcompy.quixoteFrame) {
    kidcompy.quixoteFrame.remove();
  }
});

// this is just here to get the before() hook above to trigger
it("starts with one test", function() {
  proclaim.isTrue(true, "yeah, it passes");
});

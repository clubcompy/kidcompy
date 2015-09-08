"use strict";

/*
 * Root hooks that run once before all tests
 */

before(function(done) {
  this.timeout(5000);

  // need to pause mocha for kidcompy's onCodeGo event to fire.  This ensures that all the scripts have loaded AND
  // inited before we attempt to run our tests
  kidcompy.lifecycleEvents.addOnCodeGoHandler(done);
});

// this is just here to get the before above to trigger
it("starts with one test", function() {
  proclaim.isTrue(true, "yeah, it passes");
});

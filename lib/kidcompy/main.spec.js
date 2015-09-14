"use strict";

describe("kidcompy main", function() {
  it("has its callback called after initialize is done", function(done) {
    this.timeout(5000);

    kidcompy.lifecycleEvents.addOnLoadHandler(function() {
      proclaim.equal(true, true, "true should equal true");

      done();
    });
  });
});

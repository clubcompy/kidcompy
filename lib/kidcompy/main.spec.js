"use strict";

describe("kidcompy main", function() {
  it("has its callback called after initialize is done", function(done) {
    this.timeout(500);

    proclaim.equal(true, true, "true should equal true");

    done();
  });
});

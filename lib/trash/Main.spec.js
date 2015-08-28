"use strict";

var Main = require("./Main");

describe("Main", function() {
  var main;

  beforeEach(function() {
    main = new Main();
  });

  it("will get non-zero from f", sinon.test(function() {
    proclaim.greaterThan(main.f(), 0);
  }));
});

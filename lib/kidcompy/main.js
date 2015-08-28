(function() {
  "use strict";

  var exportPublicProperties = require("../symbols/exportPublicProperties"),
    extendKidcompyNamespace = require("../symbols/extend");

  extendKidcompyNamespace(/** @lends kidcompy */ {
    /**
     * Called by the bootstrap script to start initialing the kidcompy module
     *
     * @public
     * @param {Function} done callback called when the kidcompy module is initialized
     */
    initialize: function(done) {
      console.log("kidcompy initialized");

      done();
    }
  });

  // global exports
  exportPublicProperties(kidcompy, [
    ["initialize", kidcompy.initialize]
  ]);
})();

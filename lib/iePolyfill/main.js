(function() {
  "use strict";

  var exportPublicProperties = require("../symbols/exportPublicProperties");

  /**
   * Called by bootstrap script to start the Legacy IE Polyfills
   *
   * @public
   * @param {function()} done callback to be called once the IE Polyfills init is complete
   */
  kidcompy.initializeIePolyfills = function(done) {
    console.log("IePolyfill loaded");

    done();
  };

  // global exports
  exportPublicProperties(kidcompy, [
    ["initializeIePolyfills", kidcompy.initializeIePolyfills]
  ]);
})();


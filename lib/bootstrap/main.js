  "use strict";

// creates the global kidcompy namespace before anything else ...
require("./kidcompy");

var extendKidcompyNamespace = require("../symbols/extendKidcompyNamespace"),
  XHConn2 = require("./XHConn2");

extendKidcompyNamespace(/** @lends kidcompy */ {
  /**
   * medialize URI.js constructor function
   *
   * @see http://medialize.github.io/URI.js/
   * @type {Function}
   */
  URI: require("URIjs"),

  /**
   * bootstrap script tag
   *
   * @type {Element}
   */
  BOOTSTRAP_SCRIPT: (function() {
    var scripts = document.getElementsByTagName("script");

    return scripts[scripts.length - 1];
  })(),

  /**
   * URI of the directory that the bootstrap script was loaded from.  Other scripts should be loaded from the same folder
   *
   * @type {URI}
   */
  SCRIPT_BASE_URI: (function() {
    var URI = kidcompy.URI,
      boostrapScriptUri = URI(kidcompy.BOOTSTRAP_SCRIPT.getAttribute("src"));

    return URI({
      protocol: boostrapScriptUri.protocol(),
      authority: boostrapScriptUri.authority(),
      directory: boostrapScriptUri.directory()
    });
  })()
});

if(PRODUCTION_MODE) {
  (function() {
    var detectIePolyfill = require("./detectIePolyfill"),
      detectHtml5Polyfill = require("./detectHtml5Polyfill"),

      iePolyfillDone = false,
      html5Xhr = null,
      html5PolyfillDone = false,
      kidcompyXhr = null;

    function completeKidcompyInit() {
      if(iePolyfillDone && html5Xhr) {
        XHConn2.injectResponseAsScript(html5Xhr);
        html5Xhr = null;
        html5PolyfillDone = true;
      }

      if(iePolyfillDone && html5PolyfillDone && kidcompyXhr) {
        XHConn2.injectResponseAsScript(kidcompyXhr);
        kidcompyXhr = null;

        callOnScriptHandlers();
      }
    }

    function loadKidcompyBundle() {
      var kidcompyUrl = kidcompy.SCRIPT_BASE_URI.clone();

      kidcompyUrl.filename("kidcompy.js");

      (new XHConn2()).connect(kidcompyUrl.toString(), "GET", function(xhr) {
        kidcompyXhr = xhr;

        completeKidcompyInit();
      });
    }

    function processHtml5Polyfills(done) {
      detectHtml5Polyfill.check(function(html5PolyfillsRequired) {

      });
    }

    detectIePolyfill.check(function(iePolyfillsRequired) {
    });
  })();
}
else {
  require("../iePolyfill/main");
  require("../html5Polyfill/main");
  require("../kidcompy/main");
}

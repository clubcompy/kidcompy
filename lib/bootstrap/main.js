"use strict";

// creates the global kidcompy namespace before anything else ...
require("./kidcompy");

var extendKidcompyNamespace = require("../symbols/extendKidcompyNamespace"),
  XHConn2 = require("./XHConn2");

/**
 * Empty do-nothing function
 *
 * @private
 */
function EMPTY_FUNC() {}

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
  })(),

  /**
   * Load kidcompy scripts asynchronously
   *
   * @protected
   */
  loadScriptsAsync: function() {
    kidcompy.loadScriptsAsync = EMPTY_FUNC; // don't allow this to be called more than once

    // in production mode, all scripts are loaded ajaxically as needed
    // in development mode, all scripts are inlined in the bootstrap script using require statements
    if(PRODUCTION_MODE) {
      (function() {
        var detectIePolyfill = require("./detectIePolyfill"),
          detectHtml5Polyfill = require("./detectHtml5Polyfill"),

          iePolyfillXhr = null,
          iePolyfillDone = false,
          html5PolyfillXhr = null,
          html5PolyfillDone = false,
          kidcompyXhr = null;

        /**
         * Complete in-order processing of AJAX responses coming from the script requests
         *
         * @private
         */
        function completeScriptInit() {
          if(iePolyfillXhr) {
            XHConn2.injectResponseAsScript(iePolyfillXhr);
            iePolyfillXhr = null;
            iePolyfillDone = true;
          }

          if(iePolyfillDone && html5PolyfillXhr) {
            XHConn2.injectResponseAsScript(html5PolyfillXhr);
            html5PolyfillXhr = null;
            html5PolyfillDone = true;
          }

          if(iePolyfillDone && html5PolyfillDone && kidcompyXhr) {
            XHConn2.injectResponseAsScript(kidcompyXhr);
            kidcompyXhr = null;

            // after the main kidcompy script is added to the page, we can trigger onScript
            kidcompy.triggerOnScript();
          }
        }

        /**
         * load the kidcompy script ajaxically
         *
         * @private
         */
        function loadKidcompyBundle() {
          var kidcompyUrl = kidcompy.SCRIPT_BASE_URI.clone();

          kidcompyUrl.filename("kidcompy.js");

          (new XHConn2()).connect(kidcompyUrl.toString(), "GET", function(xhr) {
            kidcompyXhr = xhr;

            completeScriptInit();
          });
        }

        /**
         * Load HTML5 polyfills script ajaxically
         *
         * @private
         */
        function processHtml5Polyfills() {
          detectHtml5Polyfill.check(function(html5PolyfillsRequired) {
            if(html5PolyfillsRequired) {
              var html5PolyfillUrl = kidcompy.SCRIPT_BASE_URI.clone();

              html5PolyfillUrl.filename("html5Polyfill.js");

              (new XHConn2()).connect(html5PolyfillUrl.toString(), "GET", function(xhr) {
                html5PolyfillXhr = xhr;

                completeScriptInit();
              });
            }
            else {
              html5PolyfillDone = true;
              completeScriptInit();
            }
          });
        }

        /**
         * Load the legacy IE polyfills ajaxically, if needed
         *
         * @private
         */
        function processIePolyfills() {
          detectIePolyfill.check(function(iePolyfillsRequired) {
            if(iePolyfillsRequired) {
              var iePolyfillUrl = kidcompy.SCRIPT_BASE_URI.clone();

              iePolyfillUrl.filename("iePolyfill.js");

              (new XHConn2()).connect(iePolyfillUrl.toString(), "GET", function(xhr) {
                iePolyfillXhr = xhr;

                completeScriptInit();
              });
            }
            else {
              iePolyfillDone = true;
              completeScriptInit();
            }
          });
        }

        processIePolyfills();
        processHtml5Polyfills();
        loadKidcompyBundle();
      })();
    }
    else {
      require("../iePolyfill/main");
      require("../html5Polyfill/main");
      require("../kidcompy/main");

      kidcompy.scriptsLoading = false;
      kidcompy.triggerOnScript();
    }
  }
});

kidcompy.loadScriptsAsync();

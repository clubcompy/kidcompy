"use strict";

// creates the global kidcompy namespace before anything else ...
require("./kidcompy");

var extendKidcompyNamespace = require("../symbols/extendKidcompyNamespace"),
  XHConn2 = require("./XHConn2");

extendKidcompyNamespace(/** @lends kidcompy */ {
  /**
   * Empty do-nothing function
   *
   * @protected
   */
  NOOP: function() {},

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
    kidcompy.loadScriptsAsync = kidcompy.NOOP; // don't allow this to be called more than once

    // in production mode, all scripts are loaded ajaxically as needed
    // in development mode, all scripts are inlined in the bootstrap script using require statements
    if(PRODUCTION_MODE) {
      (function() {
        var detectIePolyfill = require("./detectIePolyfill"),
          detectHtml5Polyfill = require("./detectHtml5Polyfill"),

          iePolyfillXhr = null,
          iePolyfillLoaded = false,
          iePolyfillInitialized = false,
          html5PolyfillXhr = null,
          html5PolyfillLoaded = false,
          html5PolyfillInitialized = false,
          kidcompyXhr = null,
          kidcompyInitialized = false;

        function completeIePolyfillInit() {
          iePolyfillInitialized = true;

          completeOnCodeGo();
        }

        function completeHtml5PolyfillInit() {
          html5PolyfillInitialized = true;

          completeOnCodeGo();
        }

        function completeKidcompyInit() {
          kidcompyInitialized = true;

          completeOnCodeGo();
        }

        /**
         * Complete in-order processing of AJAX responses coming from the script requests
         *
         * @private
         */
        function completeOnScript() {
          if(iePolyfillXhr) {
            XHConn2.injectResponseAsScript(iePolyfillXhr);
            iePolyfillXhr = null;
            iePolyfillLoaded = true;

            kidcompy.initializeIePolyfills(completeIePolyfillInit);
          }

          if(iePolyfillLoaded && html5PolyfillXhr) {
            XHConn2.injectResponseAsScript(html5PolyfillXhr);
            html5PolyfillXhr = null;
            html5PolyfillLoaded = true;

            kidcompy.initializeIePolyfills(completeHtml5PolyfillInit);
          }

          if(iePolyfillLoaded && iePolyfillInitialized &&
              html5PolyfillLoaded && html5PolyfillInitialized &&
              kidcompyXhr) {
            XHConn2.injectResponseAsScript(kidcompyXhr);
            kidcompyXhr = null;

            // after the main kidcompy script is added to the page, we can finally trigger onScript
            kidcompy.triggerOnScript();

            // this is the async initializer function for all of kidcompy.js
            kidcompy.initialize(completeKidcompyInit);
          }
        }

        /**
         * Called after initializers are invoked asynchronously, triggers onCodeGo after all the scripts
         * have completed initialization
         */
        function completeOnCodeGo() {
          if(iePolyfillInitialized && html5PolyfillInitialized && kidcompyInitialized) {
            kidcompy.triggerOnCodeGo();
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

            completeOnScript();
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

                completeOnScript();
              });
            }
            else {
              html5PolyfillLoaded = true;
              completeOnScript();
              completeHtml5PolyfillInit();
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

                completeOnScript();
              });
            }
            else {
              iePolyfillLoaded = true;
              completeIePolyfillInit();
              completeOnScript();
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

      // for development mode, just run each of the script initializers in order asynchronously and then trigger
      // onCodeGo once we're ready to go
      kidcompy.initializeIePolyfills(function() {
        kidcompy.initializeHtml5Polyfills(function() {
          kidcompy.initialize(function() {
            kidcompy.triggerOnCodeGo();
          });
        });
      });
      kidcompy.triggerOnCodeGo();
    }
  }
});

kidcompy.loadScriptsAsync();

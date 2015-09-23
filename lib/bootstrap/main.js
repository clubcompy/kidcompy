"use strict";

// all kidcompy code starts execution here

/**
 * @constructor
 */
function Main() {
  var self = this;

  /**
   * @private
   * @type {XMLHttpRequest}
   */
  self.iePolyfillXhr = null;

  /**
   * @private
   * @type {boolean}
   */
  self.iePolyfillLoaded = false;

  /**
   * @private
   * @type {boolean}
   */
  self.iePolyfillInitialized = false;

  /**
   * @private
   * @type {XMLHttpRequest}
   */
  self.html5PolyfillXhr = null;

  /**
   * @private
   * @type {boolean}
   */
  self.html5PolyfillLoaded = false;

  /**
   * @private
   * @type {boolean}
   */
  self.html5PolyfillInitialized = false;

  /**
   * @private
   * @type {XMLHttpRequest}
   */
  self.kidcompyXhr = null;

  /**
   * @private
   * @type {boolean}
   */
  self.kidcompyInitialized = false;

  self.installLifecycleEvents();

  // kick off the async script loading immediately
  self.loadScriptsAsync();
}

/**
 * Install polyfill for Array.prototype.indexOf, if needed
 *
 * @package
 */
Main.polyfillArrayIndexOf = function() {
  // Code adapted from listing at:
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
  //
  // copied 09/13/2015
  //
  // Production steps of ECMA-262, Edition 5, 15.4.4.14
  // Reference: http://es5.github.io/#x15.4.4.14
  if(!Array.prototype["indexOf"]) {
    // jshint -W016

    /**
     * @param {*} searchElement
     * @param {number=} fromIndex
     * @returns {number}
     */
    Array.prototype["indexOf"] = function(searchElement, fromIndex) {
      var k, O, len, n;

      // 1. Let O be the result of calling ToObject passing
      //    the this value as the argument.
      if(this === null) {
        throw new TypeError('"this" is null or not defined');
      }

      O = Object(this);

      // 2. Let lenValue be the result of calling the Get
      //    internal method of O with the argument "length".
      // 3. Let len be ToUint32(lenValue).
      len = O.length >>> 0;

      // 4. If len is 0, return -1.
      if(len === 0) {
        return -1;
      }

      // 5. If argument fromIndex was passed let n be
      //    ToInteger(fromIndex); else let n be 0.
      n = +fromIndex || 0;

      if(Math.abs(n) === Infinity) {
        n = 0;
      }

      // 6. If n >= len, return -1.
      if(n >= len) {
        return -1;
      }

      // 7. If n >= 0, then Let k be n.
      // 8. Else, n<0, Let k be len - abs(n).
      //    If k is less than 0, then let k be 0.
      k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

      // 9. Repeat, while k < len
      while(k < len) {
        // a. Let Pk be ToString(k).
        //   This is implicit for LHS operands of the in operator
        // b. Let kPresent be the result of calling the
        //    HasProperty internal method of O with argument Pk.
        //   This step can be combined with c
        // c. If kPresent is true, then
        //    i.  Let elementK be the result of calling the Get
        //        internal method of O with the argument ToString(k).
        //   ii.  Let same be the result of applying the
        //        Strict Equality Comparison Algorithm to
        //        searchElement and elementK.
        //  iii.  If same is true, return k.
        if(k in O && O[k] === searchElement) {
          return k;
        }

        k++;
      }

      return -1;
    };
  }
};

/**
 * @package
 */
Main.stubWindowPostMessage = function() {
  if(!window["postMessage"]) {
    /**
     * @private
     */
    window["postMessage"] = function() {
    };
  }
};

// Immediately polyfill any built-in object functions that frameworks that Webpack will call.
// This should carry us over until we load iePolyfill and html5Polyfill which can do a more complete job of filling
// the gaps
Main.polyfillArrayIndexOf();
Main.stubWindowPostMessage();

// declare the kidcompy namespace as soon as possible ...
require("./kidcompyNamespace");

// include modernizr, which puts its object on the window object (for now), transcribe that onto the kidcompy
// namespace
require("./modernizr-custom");
kidcompy.Modernizr = window.Modernizr;

var XHConn2 = require("./XHConn2"),
  detectIePolyfill = require("../iePolyfill/detectIePolyfill"),
  detectHtml5Polyfill = require("../html5Polyfill/detectHtml5Polyfill"),
  exportPublicProperties = require("../symbols/exportPublicProperties"),
  lifecycleEvents = require("./lifecycleEvents"),
  URI = require("URIjs");

/* Inject our stylesheets dynamically.  IE6 madness: you can't inject a link tag safely unless the injecting function is
   called from the window context??  (That's what the setTimeout() is doing here, escapes us from scripty-loady
   context?)

     http://www.codeproject.com/Articles/26330/UFrame-goodness-of-UpdatePanel-and-IFRAME-combined */

setTimeout(function() {
  // Load the SASS with the bootstrapper.  Later we might want to figure out how to ajaxically load this using XHConn2
  require("../styles/kidcompy.scss");
}, 0);

/**
 * URI of the directory that the bootstrap script was loaded from.  Other scripts should be loaded from the same folder
 *
 * @const
 * @type {URI}
 */
kidcompy.SCRIPT_BASE_URI = (function() {
  var scripts = document.getElementsByTagName("script"),
    bootstrapScriptTag = scripts[scripts.length - 1],
    bootstrapScriptUri = new URI(bootstrapScriptTag.getAttribute("src")),
    newUri;

  newUri = new URI();

  newUri.protocol(bootstrapScriptUri.protocol());
  newUri.authority(bootstrapScriptUri.authority());
  newUri.directory(bootstrapScriptUri.directory());

  return newUri;
})();

exportPublicProperties(kidcompy, [
  ["SCRIPT_BASE_URI", kidcompy.SCRIPT_BASE_URI]
]);

/**
 * @private
 */
Main.prototype.installLifecycleEvents = function() {
  // export the lifecycleEvents and consolelog to the global kidcompy object
  kidcompy.lifecycleEvents = lifecycleEvents;

  exportPublicProperties(kidcompy, [
    ["lifecycleEvents", kidcompy.lifecycleEvents]
  ]);
};

/**
 * loadScriptsAsync can only be called once
 * @type {boolean}
 */
Main.loadScriptsStarted = false;

/**
 * Load kidcompy scripts asynchronously
 *
 * @protected
 */
Main.prototype.loadScriptsAsync = function() {
  // run this code once per browser session only
  if(Main.loadScriptsStarted) {
    return;
  }

  Main.loadScriptsStarted = true;

  var self = this,
    intervalId,
    scriptTag,
    scriptUri;

  // we will need to load firebug-lite in a script tag to supply us a console.log if we're on IE6 or IE7
  if(typeof window["console"] === "undefined") {
    scriptUri = kidcompy.SCRIPT_BASE_URI.clone();
    scriptUri.filename("firebug-lite/build/firebug-lite.js");
    scriptUri.query(""); // clear out query string, if any
    scriptUri.fragment(""); // clear out hash, if any

    scriptTag = document.createElement("script");
    scriptTag.setAttribute("type", "text/javascript");
    scriptTag.setAttribute("src", scriptUri.toString());
    document.getElementsByTagName("head")[0].appendChild(scriptTag);
    scriptTag = null;

    // poll the global namespace until firebug-lite's window.console symbol appears
    intervalId = setInterval(function() {
      if(typeof window["console"] !== "undefined") {
        clearInterval(intervalId);

        self.continueLoadScriptsAsync();
      }
    }, 10);
  }
  else {
    self.continueLoadScriptsAsync();
  }
};

/**
 * Now that firebug-lite has been loaded (if necessary), it's safe to install the console.log shim as kidcompy.log()
 *
 * Continue loading polyfill modules and the main kidcompy bundle
 *
 * @private
 */
Main.prototype.continueLoadScriptsAsync = function() {
  var self = this;

  // console logging on legacy IE is treacherous!  Use a well-known shim and assign it to kidcompy.log.
  // See http://patik.com/blog/complete-cross-browser-console-log/
  kidcompy.log = require("consolelog");
  kidcompy.log.options.lineNumber = false; // the sourcemap'd line numbers looked bogus, turn them off for now

  // export the consolelog to the global kidcompy object
  exportPublicProperties(kidcompy, [
    ["log", kidcompy.log]
  ]);

  // in production mode, all scripts are loaded ajaxically as needed
  // in development mode, all scripts are inlined in the bootstrap script using require statements
  if(SPLIT_BUNDLES) {
    self.processIePolyfills();
    self.processHtml5Polyfills();
    self.loadKidcompyBundle();
  }
  else {
    require("../iePolyfill/main");
    require("../html5Polyfill/main");
    require("../kidcompy/main");

    self.scriptsLoading = false;
    lifecycleEvents.triggerOnScript();

    (function() {
      /**
       * @param {function(boolean)} done callback
       */
      function doIePolyfill(done) {
        detectIePolyfill.check(function(iePolyfillsRequired) {
          if(!iePolyfillsRequired) {
            done();
          }
          else {
            kidcompy.initializeIePolyfills(done);
          }
        });
      }

      /**
       * @param {function(boolean)} done callback
       */
      function doHtml5Polyfill(done) {
        detectHtml5Polyfill.check(function(html5PolyfillsRequired) {
          if(!html5PolyfillsRequired) {
            done();
          }
          else {
            kidcompy.initializeHtml5Polyfills(done);
          }
        });
      }

      // for development mode, run each of the script initializers in order asynchronously and then trigger
      // onCodeGo once we're ready to go
      doIePolyfill(function() {
        doHtml5Polyfill(function() {
          kidcompy.initialize(function() {
            lifecycleEvents.triggerOnCodeGo();
          });
        });
      });

    })();
  }
};

/**
 * The IE Polyfill init signalled completion, bootstrap continues ...
 */
Main.prototype.completeIePolyfillInit = function() {
  this.iePolyfillInitialized = true;

  this.completeOnCodeGoIfPossible();
};

/**
 * The HTML5 Polyfill init signalled completion, bootstrap continues ...
 */
Main.prototype.completeHtml5PolyfillInit = function() {
  this.html5PolyfillInitialized = true;

  this.completeOnCodeGoIfPossible();
};

/**
 * The kidcompy module signalled completion, bootstrap continues ...
 */
Main.prototype.completeKidcompyInit = function() {
  this.kidcompyInitialized = true;

  this.completeOnCodeGoIfPossible();
};

/**
 * Complete in-order processing of AJAX responses coming from the script requests
 *
 * @private
 */
Main.prototype.completeOnScript = function() {
  var self = this,
    responseText;

  if(self.iePolyfillXhr) {
    responseText = "" + self.iePolyfillXhr.responseText;
    self.iePolyfillXhr = null;

    XHConn2.injectInlineScript(responseText, function() {
      self.iePolyfillLoaded = true;

      // call out to the IE polyfill module that just got injected to initialize itself
      kidcompy.initializeIePolyfills(function() {
        self.completeIePolyfillInit();

        self.completeOnScriptPart2();
      });
    });
  }
  else {
    self.completeOnScriptPart2();
  }
};

/**
 * @private
 */
Main.prototype.completeOnScriptPart2 = function() {
  var self = this,
    responseText;

  if(self.iePolyfillLoaded && self.html5PolyfillXhr) {
    responseText = "" + self.html5PolyfillXhr.responseText;
    self.html5PolyfillXhr = null;

    XHConn2.injectInlineScript(responseText, function() {
      self.html5PolyfillLoaded = true;

      // call out to the html5 polyfill module that just got injected to initialize itself
      kidcompy.initializeHtml5Polyfills(function() {
        self.completeHtml5PolyfillInit();

        self.completeOnScriptPart3();
      });
    });
  }
  else {
    self.completeOnScriptPart3();
  }
};

/**
 * @private
 */
Main.prototype.completeOnScriptPart3 = function() {
  var self = this,
    responseText;

  if(self.iePolyfillLoaded && self.iePolyfillInitialized &&
      self.html5PolyfillLoaded && self.html5PolyfillInitialized &&
      self.kidcompyXhr) {
    responseText = "" + self.kidcompyXhr.responseText;
    self.kidcompyXhr = null;

    XHConn2.injectInlineScript(responseText, function() {
      // after the main kidcompy script is added to the page, we can finally trigger onScript
      lifecycleEvents.triggerOnScript();

      // call out to the main kidcompy.js script's async initializer which should complete the bootstrapping process
      kidcompy.initialize(function() {
        self.completeKidcompyInit();
      });
    });
  }
};

/**
 * Called after initializers are invoked asynchronously, triggers onCodeGo after all the scripts
 * have completed initialization
 */
Main.prototype.completeOnCodeGoIfPossible = function() {
  var self = this;

  if(self.iePolyfillInitialized && self.html5PolyfillInitialized && self.kidcompyInitialized) {
    lifecycleEvents.triggerOnCodeGo();
  }
};

/**
 * load the kidcompy script ajaxically
 *
 * @private
 */
Main.prototype.loadKidcompyBundle = function() {
  var self = this,
    kidcompyUrl = kidcompy.SCRIPT_BASE_URI.clone();

  kidcompyUrl.filename("kidcompy.js");

  (new XHConn2()).connect(kidcompyUrl.toString(), "GET", function(xhr) {
    self.kidcompyXhr = xhr;

    self.completeOnScript();
  });
};

/**
 * Load HTML5 polyfills script ajaxically, if needed
 *
 * @private
 */
Main.prototype.processHtml5Polyfills = function() {
  var self = this;

  detectHtml5Polyfill.check(function(html5PolyfillsRequired) {
    if(html5PolyfillsRequired) {
      var html5PolyfillUrl = kidcompy.SCRIPT_BASE_URI.clone();

      html5PolyfillUrl.filename("html5Polyfill.js");

      (new XHConn2()).connect(html5PolyfillUrl.toString(), "GET", function(xhr) {
        self.html5PolyfillXhr = xhr;

        self.completeOnScript();
      });
    }
    else {
      self.html5PolyfillLoaded = true;
      self.completeOnScript();
      self.completeHtml5PolyfillInit();
    }
  });
};

/**
 * Load the legacy IE polyfills ajaxically, if needed
 *
 * @private
 */
Main.prototype.processIePolyfills = function() {
  var self = this;

  detectIePolyfill.check(function(iePolyfillsRequired) {
    if(iePolyfillsRequired) {
      var iePolyfillUrl = kidcompy.SCRIPT_BASE_URI.clone();

      iePolyfillUrl.filename("iePolyfill.js");

      (new XHConn2()).connect(iePolyfillUrl.toString(), "GET", function(xhr) {
        self.iePolyfillXhr = xhr;

        self.completeOnScript();
      });
    }
    else {
      self.iePolyfillLoaded = true;
      self.completeIePolyfillInit();
      self.completeOnScript();
    }
  });
};

/**
 * require("./bootstrap/main") &rArr; singleton instance of {@link Main}
 *
 * @module bootstrap/main
 */
module.exports = new Main(); // immediately construct singleton bootstrap Main which invokes the async script loader

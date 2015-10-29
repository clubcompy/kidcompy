/*
 Kidcompy - a virtual computer for kids
 Copyright (C) 2015  Woldrich, Inc.

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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
 * Just in case some script decides to get fancy, give them a global object pointing at
 * our window
 */
Main.defineGlobalObjectIfNecc = function() {
  if(typeof window["global"] === "undefined") {
    window["global"] = window;
  }
};

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

/**
 * @package
 */
Main.polyfillStringTrim = function() {
  if(!String.prototype["trim"]) {
    /**
     * @package
     * @returns {string}
     */
    String.prototype["trim"] = function() {
      return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
    };
  }
};

/**
 * @package
 */
Main.polyfillFunctionBind = function() {
  // jscs: disable
  if(!Function.prototype["bind"]) {
    /**
     * @package
     * @param {*} oThis
     * @returns {Function}
     */
    Function.prototype["bind"] = function(oThis) {
      if(typeof this !== "function") {
        // closest thing possible to the ECMAScript 5
        // internal IsCallable function
        throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
      }

      function FnOP() {}

      var self = this,
        fBound = function() {
          return self.apply(this instanceof FnOP ? this : oThis,
            aArgs.concat(Array.prototype.slice.call(arguments)));
        };

      var aArgs = Array.prototype.slice.call(arguments, 1);

      if(this.prototype) {
        // native functions don't have a prototype
        FnOP.prototype = this.prototype;
      }

      fBound.prototype = new FnOP();

      return fBound;
    };
  }
};

Main.polyfillArrayFilter = function() {
  // jshint -W016
  if (!Array.prototype["filter"]) {
    Array.prototype["filter"] = function(fun/*, thisArg*/) {
      if (this === void 0 || this === null) {
        throw new TypeError();
      }

      var t = Object(this);
      var len = t.length >>> 0;
      if (typeof fun !== "function") {
        throw new TypeError();
      }

      var res = [];
      var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
      for (var i = 0; i < len; i++) {
        if (i in t) {
          var val = t[i];

          // NOTE: Technically this should Object.defineProperty at
          //       the next index, as push can be affected by
          //       properties on Object.prototype and Array.prototype.
          //       But that method's new, and collisions should be
          //       rare, so use the more-compatible alternative.
          if (fun.call(thisArg, val, i, t)) {
            res.push(val);
          }
        }
      }

      return res;
    };
  }
};

/**
 * @package
 */
Main.stubMissingConsoleFunctions = function() {
  if(!window["console"]) {
    window["console"] = {};
  }
  if(!console["log"]) {
    console["log"] = function() {};
  }
  if(!console["group"]) {
    console["group"] = function() {};
  }
  if(!console["groupCollapsed"]) {
    console["groupCollapsed"] = function() {};
  }
  if(!console["groupEnd"]) {
    console["groupEnd"] = function() {};
  }
};

/* Inject our stylesheets dynamically.  IE6 madness: you can't inject a link tag safely unless the injecting function is
 called from the window context??  (That's what the setTimeout() is doing here, escapes us from scripty-loady
 context?)

 http://www.codeproject.com/Articles/26330/UFrame-goodness-of-UpdatePanel-and-IFRAME-combined */

setTimeout(function() {
  // Load the SASS with the bootstrapper.  Later we might want to figure out how to ajaxically load this using XHConn2
  require("../styles/kidcompy.scss");
}, 0);

// declare the kidcompy namespace as soon as possible ...
require("./kidcompyNamespace");

// do browser sniffing and capabilities testing
kidcompy.browser = require("./browser"); // this is a copy of jquery.browser's output
require("./modernizr-custom");
// modernizr puts its object on the window object (for now), just transcribe it to the kidcompy namespace
kidcompy.Modernizr = window.Modernizr;

var XHConn2 = require("./XHConn2"),
  detectIePolyfill = require("../iePolyfill/detectIePolyfill"),
  DetectHtml5Polyfill = require("../html5Polyfill/DetectHtml5Polyfill"),
  exportPublicProperties = require("../symbols/exportPublicProperties"),
  lifecycleEvents = require("./lifecycleEvents"),
  URI = require("urijs");

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
  ["SCRIPT_BASE_URI", kidcompy.SCRIPT_BASE_URI],
  ["Modernizr", kidcompy.Modernizr],
  ["browser", kidcompy.browser]
]);

exportPublicProperties(kidcompy.Modernizr, [
  ["on", kidcompy.Modernizr.on]
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

  this.continueLoadScriptsAsync();
};

/**
 * Continue loading polyfill modules and the main kidcompy bundle, initialize the kidcompy.log if the host
 * browser supports it
 *
 * @private
 */
Main.prototype.continueLoadScriptsAsync = function() {
  var self = this;

  // we don't want a kidcompy.log if console is missing or we're IE <= 8
  if(typeof window["console"] === "undefined" || kidcompy.browser.msie && kidcompy.browser.version <= 8) {
    /**
     * real browser console not available, set a dummy kidcompy log
     */
    kidcompy.log = function() {};
  }
  else {
    // console logging on legacy IE is treacherous!  Use a well-known shim and assign it to kidcompy.log.
    // See http://patik.com/blog/complete-cross-browser-console-log/
    kidcompy.log = require("consolelog");
    kidcompy.log.settings({
      lineNumber: false, // the sourcemap'd line numbers looked bogus, turn them off for now
      group: false
    });
  }

  // export the consolelog to the global kidcompy object
  exportPublicProperties(kidcompy, [
    ["log", kidcompy.log]
  ]);

  // As soon as the logger is safely in place, we can polyfill any built-in object functions that
  // frameworks like Webpack will call. This should carry us over until we load iePolyfill and
  // html5Polyfill which can do a more complete job of filling the gaps
  Main.defineGlobalObjectIfNecc();
  Main.polyfillArrayIndexOf();
  Main.stubWindowPostMessage();
  Main.polyfillStringTrim();
  Main.polyfillArrayFilter();
  Main.polyfillFunctionBind();
  Main.stubMissingConsoleFunctions();

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
        DetectHtml5Polyfill.check(function(html5PolyfillsRequired) {
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

  DetectHtml5Polyfill.check(function(html5PolyfillsRequired) {
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
      self.completeHtml5PolyfillInit();
      self.completeOnScript();
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
 * @protected
 * @module bootstrap/main
 */
module.exports = new Main(); // immediately construct singleton bootstrap Main which invokes the async script loader

/*
 Kidcompy - a virtual computer for kids
 Copyright (C) 2016  Woldrich, Inc.

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

// declare the kidcompy global namespace as soon as possible ...
require("./kidcompyNamespace");

var URI = require("urijs"),
  exportPublicProperties = require("../symbols/exportPublicProperties");

/**
 * Mandatory polyfills we must have installed before Kidcompy bootstrap starts
 *
 * @constructor
 */
function MandatoryGlobals() {
  var self = this;

  self.gatherScriptBaseUri();
  self.defineGlobalObjectIfNecc();
  self.installBrowserSniffer();
  self.setupConsoleFunctions();
  self.installModernizrFeatureDetection();
  self.installHiresTimer();
  self.installRxjs();
  self.polyfillArrayIndexOf();
  self.stubWindowPostMessage();
  self.polyfillStringTrim();
  self.polyfillArrayFilter();
  self.polyfillFunctionBind();
  self.installLifecycleEvents();
  self.doPublicSymbolExports();
}

/**
 * @package
 */
MandatoryGlobals.prototype.gatherScriptBaseUri = function() {
  /**
   * URI of the directory that the bootstrap script was loaded from.  Other scripts should be
   * loaded from the same folder
   *
   * @const
   * @type {URI}
   */
  kidcompy.SCRIPT_BASE_URI = kidcompy.SCRIPT_BASE_URI || (function() {
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
};

/**
 * Just in case some script decides to get node fancy, give them a global object pointing at
 * our window
 *
 * @package
 */
MandatoryGlobals.prototype.defineGlobalObjectIfNecc = function() {
  if(typeof window["global"] === "undefined") {
    window["global"] = window;
  }
};

/**
 * When it comes to a known quantity like legacy IE, it helps to just do the work to sniff the browser and version
 * and be done with it.  This calls through to a copy of jQuery.browser
 *
 * @package
 */
MandatoryGlobals.prototype.installBrowserSniffer = function() {
  // do browser sniffing and capabilities testing
  kidcompy.browser = kidcompy.browser || require("./browser"); // this is a copy of jquery.browser's output
};

/**
 * @package
 */
MandatoryGlobals.prototype.installModernizrFeatureDetection = function() {
  if(typeof kidcompy.Modernizr === "undefined") {
    require("./modernizr-custom");

    // modernizr puts its object on the window object (for now), just transcribe it to the kidcompy namespace
    // see: https://github.com/Modernizr/Modernizr/issues/1204
    kidcompy.Modernizr = window.Modernizr;
  }
};

/**
 * Install polyfill for Array.prototype.indexOf, if needed
 *
 * @package
 */
MandatoryGlobals.prototype.polyfillArrayIndexOf = function() {
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
 * Super old IE browsers don't have a postMessage() API.  Webpack tries to be chatty and call it, but it's not necessary
 * for our purposes, so just sham it so we can move along.
 *
 * @package
 */
MandatoryGlobals.prototype.stubWindowPostMessage = function() {
  if(!window["postMessage"]) {
    /**
     * @private
     */
    window["postMessage"] = function() {
    };
  }
};

/**
 * Some libraries called during bootstrap use String.prototype.trim().  Polyfill to get us past.
 *
 * @package
 */
MandatoryGlobals.prototype.polyfillStringTrim = function() {
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
 * Some libraries called during bootstrap use Array.prototype.filter().  Polyfill to get us past.
 *
 * @package
 */
MandatoryGlobals.prototype.polyfillArrayFilter = function() {
  // jshint -W016
  // jscs: disable
  if(!Array.prototype["filter"]) {
    Array.prototype["filter"] = function(fun/*, thisArg*/) {
      if(this === void 0 || this === null) {
        throw new TypeError();
      }

      var t = Object(this),
        len = t.length >>> 0;

      if(typeof fun !== "function") {
        throw new TypeError();
      }

      var res = [],
        thisArg = arguments.length >= 2 ? arguments[1] : void 0;

      for(var i = 0; i < len; i++) {
        if(i in t) {
          var val = t[i];

          // NOTE: Technically this should Object.defineProperty at
          //       the next index, as push can be affected by
          //       properties on Object.prototype and Array.prototype.
          //       But that method's new, and collisions should be
          //       rare, so use the more-compatible alternative.
          if(fun.call(thisArg, val, i, t)) {
            res.push(val);
          }
        }
      }

      return res;
    };
  }
};

/**
 * Some libraries called during bootstrap use Function.prototype.bind().  Polyfill to get us past.
 *
 * @package
 */
MandatoryGlobals.prototype.polyfillFunctionBind = function() {
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
        aArgs = Array.prototype.slice.call(arguments, 1),
        fBound = function() {
          return self.apply(this instanceof FnOP ? this : oThis,
            aArgs.concat(Array.prototype.slice.call(arguments)));
        };

      if(this.prototype) {
        // native functions don't have a prototype
        FnOP.prototype = this.prototype;
      }

      fBound.prototype = new FnOP();

      return fBound;
    };
  }
};

/**
 * @package
 */
MandatoryGlobals.prototype.setupConsoleFunctions = function() {
  // Be super-duper careful and set console and its functions to something innocuous if there is anything missing
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

  if(typeof kidcompy.log == "undefined") {
    // we don't want a kidcompy.log if console is missing or we're IE <= 8
    if (kidcompy.browser.msie && kidcompy.browser.version <= 8) {
      /**
       * real browser console not available, set a dummy kidcompy log
       */
      kidcompy.log = function() {
      };

      // Legacy IE can be a real pain when it comes to console.log, so just make a dummy that exists for all 1st and
      // 3rd party modules when the scripts startup
      window["console"] = {
        "log": function() {
        },
        "group": function() {
        },
        "groupCollapsed": function() {
        },
        "groupEnd": function() {
        }
      };
    }
    else {
      // Use a well-known shim and assign it to kidcompy.log.
      // See http://patik.com/blog/complete-cross-browser-console-log/
      kidcompy.log = require("consolelog");
      kidcompy.log["settings"]({
        lineNumber: false, // the sourcemap'd line numbers looked bogus, turn them off for now
        group: false
      });
    }
  }
};

/**
 * load the browser's high-resolution timer polyfill into kidcompy.now
 *
 * @package
 */
MandatoryGlobals.prototype.installHiresTimer = function() {
  kidcompy.now = kidcompy.now || require("./tools/hiresTimer");
};

/**
 * Install reactive extensions for JavaScript
 *
 * @package
 */
MandatoryGlobals.prototype.installRxjs = function() {
  // get our Reactive Extensions for JavaScript (but don't actually try to use them until kidcompy.initialize is called)
  kidcompy.rxjs = kidcompy.rxjs || require("./tools/rxjs");
};

/**
 * @package
 */
MandatoryGlobals.prototype.installLifecycleEvents = function() {
  if(typeof kidcompy.lifecycleEvents === "undefined") {
    // export the lifecycleEvents to the global kidcompy object
    kidcompy.lifecycleEvents = require("./lifecycleEvents");
  }
};



/**
 * Make sure an un-mangled symbol is set for all public members in the kidcompy and Modernizr
 * global objects
 *
 * @package
 */
MandatoryGlobals.prototype.doPublicSymbolExports = function() {
  exportPublicProperties(kidcompy, [
    ["SCRIPT_BASE_URI", kidcompy.SCRIPT_BASE_URI],
    ["Modernizr", kidcompy.Modernizr],
    ["now", kidcompy.now],
    ["browser", kidcompy.browser],
    ["rxjs", kidcompy.rxjs],
    ["log", kidcompy.log],
    ["lifecycleEvents", kidcompy.lifecycleEvents]
  ]);

  exportPublicProperties(kidcompy.Modernizr, [
    ["on", kidcompy.Modernizr.on]
  ]);
};

/**
 * require("./bootstrap/mandatoryGlobals") &rArr; singleton instance of {@link MandatoryGlobals}
 *
 * @protected
 * @module bootstrap/mandatoryGlobals
 */
module.exports = new MandatoryGlobals();

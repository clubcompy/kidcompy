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

// all kidcompy code starts execution here

// There are polyfills, shims, and aliases that need to be installed, (especially for legacy IE), before we attempt to
// load our 3rd party scripts

// As soon as the logger is safely in place, we can polyfill any built-in object functions that
// frameworks like Webpack will call. This should carry us over until we load iePolyfill and
// html5Polyfill which will do a more complete job of filling any API gaps the host browser has

// polyfills and global changes that must be installed before any other libraries are inited
var mandatoryGlobals = require("./mandatoryGlobals"),

  XHConn2 = require("./XHConn2"),
  DetectIePolyfill = require("../iePolyfill/DetectIePolyfill"),
  DetectHtml5Polyfill = require("../html5Polyfill/DetectHtml5Polyfill"),
  lifecycleEvents = require("./lifecycleEvents"),
  exportPublicProperties = require("../symbols/exportPublicProperties");

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

  // load the kidcompy css asap
  self.loadStylesheet();

  // kick off the async script loading immediately
  self.loadScriptsAsync();
}

/**
 * @private
 */
Main.prototype.loadStylesheet = function() {
  /* Inject our stylesheets dynamically.  IE6 madness: you can't inject a link tag safely unless the injecting
   function is called from the window context??  (That's what the onReadyFired() is doing here, to hopefully
   escape us from scripty-loady context?)

   http://www.codeproject.com/Articles/26330/UFrame-goodness-of-UpdatePanel-and-IFRAME-combined */

  kidcompy.lifecycleEvents.addOnReadyFiredHandler(function() {
    // Load the SASS with the bootstrapper.  Later we might want to figure out how to ajaxically load this using XHConn2
    require("../styles/kidcompy.scss");
  });
};

/**
 * Load kidcompy scripts asynchronously
 *
 * @protected
 */
Main.prototype.loadScriptsAsync = function() {
  if(typeof kidcompy.loadScriptsStarted === "undefined") {
    /**
     * loadScriptsAsync can only be called once
     *
     * @type {boolean}
     */
    kidcompy.loadScriptsStarted = false;
  }

  // run this code once per browser session only
  if(kidcompy.loadScriptsStarted) {
    return;
  }

  kidcompy.loadScriptsStarted = true;

  // this.load();
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

  // in production mode, all scripts are loaded ajaxically as needed as split javascript bundles
  // in development mode, all scripts are inlined in the bootstrap script using require statements
  if(SPLIT_BUNDLES) {
    self.processIePolyfills();
    self.processHtml5Polyfills();
    self.loadKidcompyBundle();
  }
  else {
    require("../iePolyfill/main");
    require("../html5Polyfill/main");

    self.scriptsLoading = false;
    lifecycleEvents.triggerOnScript();

    (function() {
      /**
       * @param {function(boolean)} done callback
       */
      function doIePolyfill(done) {
        DetectIePolyfill.check(function(iePolyfillsRequired) {
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
          require("../kidcompy/main");

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

  DetectIePolyfill.check(function(iePolyfillsRequired) {
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
 * Create an Observable sequence with one boolean value and then completion.  If the boolean value
 * is true then the IE Polyfills need to be loaded
 *
 * @returns {kidcompy.rxjs.Observable} observable sequence
 */
Main.prototype.checkIePolyfillsNeeded = function() {
  var observableFactory = kidcompy.rxjs.Observable.fromCallback(DetectIePolyfill.check);

  return observableFactory();
};

/**
 * Create an Observable sequence with a string value and then completion.  The string value
 * contains the string contents of the IE polyfills javascript file after it is ajaxically loaded.
 */
Main.prototype.loadIePolyfills = function() {
  var polyfillLoadSubject = new kidcompy.rxjs.ReplaySubject(),
    iePolyfillUrl = kidcompy.SCRIPT_BASE_URI.clone();

  iePolyfillUrl.filename("iePolyfill.js");

  (new XHConn2()).connect(iePolyfillUrl.toString(), "GET", function(xhr) {
    if(!xhr) {
      polyfillLoadSubject.onError("XHR was null");
    }
    else if(xhr.status > 199 && xhr.status < 300) {
      polyfillLoadSubject.onNext("" + xhr.responseText);
    }
    else {
      polyfillLoadSubject.onError("" + xhr.responseText);
    }

    polyfillLoadSubject.onCompleted();
  });

  return polyfillLoadSubject.asObservable();
};

/**
 * injectIePolyfill
 *
 * @param {string} responseText
 * @returns {Observable}
 */
Main.prototype.injectIePolyfill = function(responseText) {
  var injectObservableFactory = kidcompy.rxjs.fromFunction(XHConn2.injectInlineScript);

  return injectObservableFactory(responseText);
};

/**
 * load
 */
Main.prototype.load = function() {
  var self = this,
    iePolyfillCheck,
    iePolyfillLoader,
    iePolyfillSequence;

  iePolyfillCheck = self.checkIePolyfillsNeeded()
    .tapOnNext(function(value) {
      kidcompy.log("IePolyfill needed? " + value);
    });

  // convert to string sequence of ie polyfill payload if isIePolyfillNeeded == true
  iePolyfillLoader = iePolyfillCheck
    .flatMap(function(isIePolyfillNeeded) {
      if(isIePolyfillNeeded) {
        kidcompy.log("will load Ie polyfills");
        return self.loadIePolyfills();
      }
      else {
        kidcompy.log("will skip Ie polyfills");
        return kidcompy.rxjs.Observable.empty();
      }
    });

  iePolyfillSequence = iePolyfillLoader
    .flatMap(function(polyfillScript) {
      kidcompy.log("Ie polyfill script loaded");
      return self.injectIePolyfill(polyfillScript);
    });

  iePolyfillSequence
    .forEach(
      function(n) {
        kidcompy.log("IE Polyfill sequence next: ", n);
      },
      function(e) {
        kidcompy.log("IE Polyfill sequence had an error: ", e);
      },
      function() {
        kidcompy.log("IE Polyfill sequence complete");
      });
};

/**
 * require("./bootstrap/main") &rArr; singleton instance of {@link Main}
 *
 * @protected
 * @module bootstrap/main
 */
module.exports = new Main(); // immediately construct singleton bootstrap Main which invokes the async script loader

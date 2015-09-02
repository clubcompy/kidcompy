"use strict";

// declare the kidcompy namespace first thing ...
require("./kidcompyNamespace");

var XHConn2 = require("./XHConn2"),
  detectIePolyfill = require("../iePolyfill/detectIePolyfill"),
  detectHtml5Polyfill = require("../html5Polyfill/detectHtml5Polyfill"),
  exportPublicProperties = require("../symbols/exportPublicProperties"),
  lifecycleEvents = require("./lifecycleEvents"),
  URI = require("URIjs");

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

  // export the lifecycleEvents to the global kidcompy object
  kidcompy.lifecycleEvents = lifecycleEvents;
  exportPublicProperties(kidcompy, [
    ["lifecycleEvents", kidcompy.lifecycleEvents]
  ]);

  // kick off the async script loading immediately
  self.loadScriptsAsync();
}

/**
 * URI of the directory that the bootstrap script was loaded from.  Other scripts should be loaded from the same folder
 *
 * @const
 * @type {URI}
 */
Main.SCRIPT_BASE_URI = (function() {
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

  var self = this;

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

    // for development mode, just run each of the script initializers in order asynchronously and then trigger
    // onCodeGo once we're ready to go
    kidcompy.initializeIePolyfills(function() {
      kidcompy.initializeHtml5Polyfills(function() {
        kidcompy.initialize(function() {
          lifecycleEvents.triggerOnCodeGo();
        });
      });
    });
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
  var self = this;

  if(self.iePolyfillXhr) {
    XHConn2.injectResponseAsScript(self.iePolyfillXhr);
    self.iePolyfillXhr = null;
    self.iePolyfillLoaded = true;

    // call out to the IE polyfill module that just got injected to initialize itself
    kidcompy.initializeIePolyfills(function() {
      self.completeIePolyfillInit();
    });
  }

  if(self.iePolyfillLoaded && self.html5PolyfillXhr) {
    XHConn2.injectResponseAsScript(self.html5PolyfillXhr);
    self.html5PolyfillXhr = null;
    self.html5PolyfillLoaded = true;

    // call out to the html5 polyfill module that just got injected to initialize itself
    kidcompy.initializeHtml5Polyfills(function() {
      self.completeHtml5PolyfillInit();
    });
  }

  if(self.iePolyfillLoaded && self.iePolyfillInitialized &&
      self.html5PolyfillLoaded && self.html5PolyfillInitialized &&
      self.kidcompyXhr) {
    XHConn2.injectResponseAsScript(self.kidcompyXhr);
    self.kidcompyXhr = null;

    // after the main kidcompy script is added to the page, we can finally trigger onScript
    lifecycleEvents.triggerOnScript();

    // call out to the main kidcompy.js script's async initializer which should complete the bootstrapping process
    kidcompy.initialize(function() {
      self.completeKidcompyInit();
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
    kidcompyUrl = Main.SCRIPT_BASE_URI.clone();

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
      var html5PolyfillUrl = Main.SCRIPT_BASE_URI.clone();

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
      var iePolyfillUrl = Main.SCRIPT_BASE_URI.clone();

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

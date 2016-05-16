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

  this.load();
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

  if(SPLIT_BUNDLES) {
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
  }
  else {
    // in local development mode, the iePolyfills are simply baked into this script by way of
    // a require.  Immediately return with an onCompleted()
    require("../iePolyfill/main");

    // immediately complete
    polyfillLoadSubject.onCompleted();
  }

  return polyfillLoadSubject.asObservable();
};

/**
 * injectIePolyfill
 *
 * @param {string} responseText
 * @returns {Observable}
 */
Main.prototype.injectIePolyfill = function(responseText) {
  var injectObservableFactory = kidcompy.rxjs.Observable.fromCallback(XHConn2.injectInlineScript);

  return injectObservableFactory(responseText);
};

/**
 * Create an Observable sequence with one boolean value and then completion.  If the boolean value
 * is true then the HTML5 Polyfills need to be loaded
 *
 * @returns {kidcompy.rxjs.Observable} observable sequence
 */
Main.prototype.checkHtml5PolyfillsNeeded = function() {
  var observableFactory = kidcompy.rxjs.Observable.fromCallback(DetectHtml5Polyfill.check);

  return observableFactory();
};

/**
 * Create an Observable sequence with a string value and then completion.  The string value
 * contains the string contents of the Html5 polyfills javascript file after it is ajaxically loaded.
 */
Main.prototype.loadHtml5Polyfills = function() {
  var polyfillLoadSubject = new kidcompy.rxjs.ReplaySubject(),
    html5PolyfillUrl = kidcompy.SCRIPT_BASE_URI.clone();

  html5PolyfillUrl.filename("html5Polyfill.js");

  if(SPLIT_BUNDLES) {
    (new XHConn2()).connect(html5PolyfillUrl.toString(), "GET", function(xhr) {
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
  }
  else {
    // in local development mode, the html5Polyfills are simply baked into this script by way of
    // a require.  Immediately return with an onCompleted()
    require("../html5Polyfill/main");

    // immediately complete
    polyfillLoadSubject.onCompleted();
  }

  return polyfillLoadSubject.asObservable();
};

/**
 * injectHtml5Polyfill
 *
 * @param {string} responseText
 * @returns {Observable}
 */
Main.prototype.injectHtml5Polyfill = function(responseText) {
  var injectObservableFactory = kidcompy.rxjs.Observable.fromCallback(XHConn2.injectInlineScript);

  return injectObservableFactory(responseText);
};

/**
 * Create an Observable sequence with a string value and then completion.  The string value
 * contains the string contents of the IE polyfills javascript file after it is ajaxically loaded.
 */
Main.prototype.loadKidcompyScript = function() {
  var kidcompyLoadSubject = new kidcompy.rxjs.ReplaySubject(),
    kidcompyUrl = kidcompy.SCRIPT_BASE_URI.clone();

  kidcompyUrl.filename("kidcompy.js");

  if(SPLIT_BUNDLES) {
    (new XHConn2()).connect(kidcompyUrl.toString(), "GET", function(xhr) {
      if(!xhr) {
        kidcompyLoadSubject.onError("XHR was null");
      }
      else if(xhr.status > 199 && xhr.status < 300) {
        kidcompyLoadSubject.onNext("" + xhr.responseText);
      }
      else {
        kidcompyLoadSubject.onError("" + xhr.responseText);
      }

      kidcompyLoadSubject.onCompleted();
    });
  }
  else {
    // in local development mode, the kidcompy scripts are simply baked into this script by way of
    // a require.  Immediately return with an onCompleted()
    require("../kidcompy/main");

    // immediately complete
    kidcompyLoadSubject.onCompleted();
  }

  return kidcompyLoadSubject.asObservable();
};

/**
 * injectKidcompyScript
 *
 * @param {string} responseText
 * @returns {Observable<boolean>}
 */
Main.prototype.injectKidcompyScript = function(responseText) {
  var injectObservableFactory = kidcompy.rxjs.Observable.fromCallback(XHConn2.injectInlineScript);

  return injectObservableFactory(responseText);
};

/**
 * initializeKidcompyScript
 *
 * @returns {Observable<boolean>}
 */
Main.prototype.initializeKidcompyScript = function() {
  var initFactory = kidcompy.rxjs.Observable.fromCallback(kidcompy.initialize);

  return initFactory()
    .doOnCompleted(function() {
      // once the kidcompy script is initialized, we can trigger the onCodeGo event - it is safe for the parent page
      // to start making kidcompy instances
      lifecycleEvents.triggerOnCodeGo();

      kidcompy.log("on code go triggered");
    });
};


/**
 * load
 */
Main.prototype.load = function() {
  var self = this,
    iePolyfillCheck,
    iePolyfillLoader,
    iePolyfillInitialize,
    iePolyfillInject,
    iePolyfillInitSequence,
    iePolyfillCompleteSubject,
    html5PolyfillCheck,
    html5PolyfillLoader,
    html5PolyfillInject,
    html5PolyfillInitialize,
    html5PolyfillInitSequence,
    html5PolyfillCompleteSubject,
    kidcompyScriptInject,
    kidcompyInitialize,
    kidcompyScriptInitSequence;

  iePolyfillCompleteSubject = new kidcompy.rxjs.AsyncSubject();
  html5PolyfillCompleteSubject = new kidcompy.rxjs.AsyncSubject();

  iePolyfillCheck = self.checkIePolyfillsNeeded()
    .doOnNext(function(isIePolyfillNeeded) {
      // if IE Polyfills are not needed, notify the subject immediately that iePolyfill work is complete
      if(!isIePolyfillNeeded) {
        iePolyfillCompleteSubject.onNext(true);
        iePolyfillCompleteSubject.onCompleted();
      }
    })
    .doOnCompleted(function() {
      kidcompy.log("iePolyfill check complete");
    });

  // convert to string sequence of ie polyfill payload if isIePolyfillNeeded == true
  iePolyfillLoader = iePolyfillCheck
    .flatMap(function(isIePolyfillNeeded) {
      if(isIePolyfillNeeded) {
        return self.loadIePolyfills();
      }
      else {
        // there will be no polyfill script to inject, so return an empty sequence
        return kidcompy.rxjs.Observable.empty();
      }
    })
    .doOnCompleted(function() {
      kidcompy.log("iePolyfill loader complete");
    });

  // inject IE Polyfill script if we got one from the loader Observable
  iePolyfillInject = iePolyfillLoader
    .flatMap(function(polyfillScript) {
      return self.injectIePolyfill(polyfillScript);
    })
    .doOnCompleted(function() {
      kidcompy.log("iePolyfill injection complete");
    });

  iePolyfillInitialize = iePolyfillCheck
    .flatMap(function(isIePolyfillNeeded) {

      if(isIePolyfillNeeded) {
        var initFactory = kidcompy.rxjs.Observable.fromCallback(kidcompy.initializeIePolyfills);

        return initFactory()
          .doOnNext(function() {
            iePolyfillCompleteSubject.onNext(true);
            iePolyfillCompleteSubject.onCompleted();
          });
      }
    });

  iePolyfillInitSequence = kidcompy.rxjs.Observable.concat(
    iePolyfillInject,
    iePolyfillInitialize);

  html5PolyfillCheck = self.checkHtml5PolyfillsNeeded()
    .doOnNext(function(isHtml5PolyfillNeeded) {
      // if HTML5 Polyfills are NOT needed, notify the subject immediately that html5Polyfill work is complete
      if(!isHtml5PolyfillNeeded) {
        html5PolyfillCompleteSubject.onNext(true);
        html5PolyfillCompleteSubject.onCompleted();
      }
    })
    .doOnCompleted(function() {
      kidcompy.log("html5Polyfill check complete");
    });

  // convert to string sequence of html5 polyfill payload if isHtml5PolyfillNeeded == true
  html5PolyfillLoader = html5PolyfillCheck
    .flatMap(function(isHtml5PolyfillNeeded) {
      if(isHtml5PolyfillNeeded) {
        return self.loadHtml5Polyfills();
      }
      else {
        // there will be no polyfill script to inject, so return an empty sequence
        return kidcompy.rxjs.Observable.empty();
      }
    })
    .doOnCompleted(function() {
      kidcompy.log("html5Polyfill loader complete");
    });

  // inject HTML5 Polyfill script if we got one from the loader Observable
  html5PolyfillInject = html5PolyfillLoader
    .flatMap(function(polyfillScript) {
      return self.injectHtml5Polyfill(polyfillScript);
    })
    .doOnCompleted(function() {
      kidcompy.log("html5Polyfill injection complete");
    });

  html5PolyfillInitialize = html5PolyfillCheck
    .flatMap(function(isHtml5PolyfillNeeded) {

      if(isHtml5PolyfillNeeded) {
        var initFactory = kidcompy.rxjs.Observable.fromCallback(kidcompy.initializeHtml5Polyfills);

        return initFactory()
          .doOnNext(function() {
            html5PolyfillCompleteSubject.onNext(true);
            html5PolyfillCompleteSubject.onCompleted();
          });
      }
    });

  html5PolyfillInitSequence = kidcompy.rxjs.Observable.concat(
    html5PolyfillInject,
    iePolyfillCompleteSubject,
    html5PolyfillInitialize);

  kidcompyScriptInject = self.loadKidcompyScript()
    .flatMap(function(kidcompyScript) {
      return self.injectKidcompyScript(kidcompyScript);
    })
    .doOnCompleted(function() {
      // after the main kidcompy script is added to the page, we can finally trigger onScript
      lifecycleEvents.triggerOnScript();
      kidcompy.log("on script triggered");

      kidcompy.log("kidcompy script injection complete");
    });

  kidcompyInitialize = self.initializeKidcompyScript()
    .doOnCompleted(function() {
      kidcompy.log("kidcompy script init complete");
    });

  kidcompyScriptInitSequence = kidcompy.rxjs.Observable.concat(
    kidcompyScriptInject,
    iePolyfillCompleteSubject,
    html5PolyfillCompleteSubject,
    kidcompyInitialize
  );

  iePolyfillInitSequence.subscribe(
    function(n) {
      kidcompy.log("IE Polyfill sequence next: ", n);
    },
    function(e) {
      kidcompy.log("IE Polyfill sequence had an error: ", e);
    },
    function() {
      kidcompy.log("IE Polyfill sequence complete");
    });

  html5PolyfillInitSequence.subscribe(
    function(n) {
      kidcompy.log("HTML5 Polyfill sequence next: ", n);
    },
    function(e) {
      kidcompy.log("HTML5 Polyfill sequence had an error: ", e);
    },
    function() {
      kidcompy.log("HTML5 Polyfill sequence complete");
    });

  kidcompyScriptInitSequence.subscribe(
    function(n) {
      kidcompy.log("Kidcompy script init sequence next: ", n);
    },
    function(e) {
      kidcompy.log("Kidcompy script init sequence had an error: ", e);
    },
    function() {
      kidcompy.log("Kidcompy script init sequence complete");
    });
};

/**
 * require("./bootstrap/main") &rArr; singleton instance of {@link Main}
 *
 * @protected
 * @module bootstrap/main
 */
module.exports = new Main(); // immediately construct singleton bootstrap Main which invokes the async script loader

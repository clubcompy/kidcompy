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
    polyfillLoadSubject.onNext(false); // nothing to inject, signal with a null
    polyfillLoadSubject.onCompleted();
  }

  return polyfillLoadSubject;
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
    polyfillLoadSubject.onNext(false); // nothing to inject, signal with a null
    polyfillLoadSubject.onCompleted();
  }

  return polyfillLoadSubject;
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
        kidcompy.log("" + xhr.responseText);

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
    kidcompyLoadSubject.onNext(false); // nothing to inject, signal with a null
    kidcompyLoadSubject.onCompleted();
  }

  return kidcompyLoadSubject;
};

/**
 * injectKidcompyScript
 *
 * @param {string} responseText
 * @returns {Observable}
 */
Main.prototype.injectKidcompyScript = function(responseText) {
  var injectObservableFactory = kidcompy.rxjs.Observable.fromCallback(XHConn2.injectInlineScript);

  return injectObservableFactory(responseText);
};

/**
 * initializeKidcompyScript
 *
 * @returns {Observable}
 */
Main.prototype.initializeKidcompyScript = function() {
  var initFactory = kidcompy.rxjs.Observable.fromCallback(kidcompy.initialize);

  return initFactory();
};

/**
 * load
 */
Main.prototype.load = function() {
  var self = this,
    iePolyfillInitSequence,
    iePolyfillCompleteSubject,
    html5PolyfillInitSequence,
    html5PolyfillCompleteSubject,
    kidcompyScriptInitSequence;

  iePolyfillCompleteSubject = new kidcompy.rxjs.AsyncSubject();
  html5PolyfillCompleteSubject = new kidcompy.rxjs.AsyncSubject();

  console.log("Was here 1");

  iePolyfillInitSequence = self.checkIePolyfillsNeeded()
    .select(function(isIePolyfillNeeded) {
      kidcompy.log("iePolyfill check complete: " + isIePolyfillNeeded);

      if(!isIePolyfillNeeded) {
        // there will be no polyfill script to inject, so return an empty sequence
        return kidcompy.rxjs.Observable.just(false);
      }

      return self.loadIePolyfills()
        .flatMap(function(polyfillScript) {
          kidcompy.log("iePolyfill loader complete");

          if(polyfillScript) {
            return self.injectIePolyfill(polyfillScript);
          }
          else {
            return kidcompy.rxjs.Observable.just(true);
          }
        })
        .flatMap(function() {
          kidcompy.log("iePolyfill injection complete");

          var initFactory = kidcompy.rxjs.Observable.fromCallback(kidcompy.initializeIePolyfills);

          return initFactory();
        });
    })
    .select(function() {
      iePolyfillCompleteSubject.onNext(kidcompy.rxjs.Observable.just(true));
      iePolyfillCompleteSubject.onCompleted();

      kidcompy.log("iePolyfill init complete");

      return true;
    });

  console.log("Was here 5");

  html5PolyfillInitSequence = self.checkHtml5PolyfillsNeeded()
    .select(function(isHtml5PolyfillNeeded) {
      kidcompy.log("html5Polyfill check complete: " + isHtml5PolyfillNeeded);

      if(!isHtml5PolyfillNeeded) {
        // there will be no polyfill script to inject, so return a null in a sequence to indicate no inject should occur
        return kidcompy.rxjs.Observable.just(false);
      }

      return self.loadHtml5Polyfills()
        .flatMap(function(polyfillScript) {
          kidcompy.log("html5Polyfill loader complete");

          if(polyfillScript) {
            return self.injectHtml5Polyfill(polyfillScript);
          }
          else {
            return kidcompy.rxjs.Observable.just(true);
          }
        })
        .flatMap(function() {
          kidcompy.log("html5Polyfill injection complete");

          var initFactory = kidcompy.rxjs.Observable.fromCallback(kidcompy.initializeHtml5Polyfills);

          return initFactory();
        });
    })
    .select(function() {
      html5PolyfillCompleteSubject.onNext(kidcompy.rxjs.Observable.just(true));
      html5PolyfillCompleteSubject.onCompleted();

      return true;
    });

  console.log("Was here 10");

  console.log("Was here 11");

  console.log("Was here 12");

  // kidcompyInitialize = kidcompyLoadCompleteSubject
  //  .select(function(value) {
  //    return self.initializeKidcompyScript();
  //  })
  //  .flatMap(function() {
  //    // once the kidcompy script is initialized, we can trigger the onCodeGo event - it is safe for the parent page
  //    // to start making kidcompy instances
  //    kidcompy.lifecycleEvents.triggerOnCodeGo();
  //
  //    kidcompy.log("on code go triggered");
  //    return true;
  //  });

  console.log("Was here 13");

  // it's in here somewhere ...
  kidcompyScriptInitSequence = self.loadKidcompyScript()
    .select(function(kidcompyScript) {
      if(kidcompyScript) {
        kidcompy.log("yep!");
        return self.injectKidcompyScript(kidcompyScript);
      }
      else {
        kidcompy.log("Nothing to inject!");
        return kidcompy.rxjs.Observable.just(false);
      }
    })
    .flatMap(function() {
      // after the main kidcompy script is added to the page, we can finally trigger onScript
      kidcompy.log("triggering on script event");
      kidcompy.lifecycleEvents.triggerOnScript();
      kidcompy.log("on script triggered");

      return kidcompy.rxjs.Observable.just(true);
    })
    .flatMap(function() {
      kidcompy.log("subject");
      return iePolyfillCompleteSubject;
    })
    .flatMap(function() {
      kidcompy.log("subject 2");
      return html5PolyfillCompleteSubject;
    })
    .flatMap(function() {
      return self.initializeKidcompyScript();
    })
    .select(function() {
      // once the kidcompy script is initialized, we can trigger the onCodeGo event - it is safe for the parent page
      // to start making kidcompy instances
      kidcompy.lifecycleEvents.triggerOnCodeGo();

      kidcompy.log("on code go triggered");
      return true;
    });

  // kidcompyScriptInitSequence = kidcompy.rxjs.Observable.concat(
  //  kidcompyScriptInject,
  //  iePolyfillCompleteSubject,
  //  html5PolyfillCompleteSubject,
  //  kidcompyInitialize);

  console.log("Was here 14");

  iePolyfillInitSequence
    .subscribe(
      function(n) {
        kidcompy.log("iePolyfill init sequence next: ", n);
      },
      function(e) {
        kidcompy.log("iePolyfill init sequence had an error: " + e.message + "\n" + e.stack, e);
      },
      function() {
        kidcompy.log("iePolyfill init sequence complete");
      });

  html5PolyfillInitSequence
    .subscribe(
      function(n) {
        kidcompy.log("html5Polyfill init sequence next: ", n);
      },
      function(e) {
        kidcompy.log("html5Polyfill init sequence had an error: " + e.message + "\n" + e.stack, e);
      },
      function() {
        kidcompy.log("html5Polyfill init sequence complete");
      });

  kidcompyScriptInitSequence
    .subscribe(
      function(n) {
        kidcompy.log("kidcompy script init sequence next: ", n);
      },
      function(e) {
        kidcompy.log("kidcompy script init sequence had an error: " + e.message + "\n" + e.stack, e);
      },
      function() {
        kidcompy.log("kidcompy script init sequence complete");
      });

  console.log("Was here 16");
};

/**
 * require("./bootstrap/main") &rArr; singleton instance of {@link Main}
 *
 * @protected
 * @module bootstrap/main
 */
module.exports = new Main(); // immediately construct singleton bootstrap Main which invokes the async script loader

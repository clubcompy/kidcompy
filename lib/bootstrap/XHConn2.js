"use strict";

/**
 * <p>A simple XMLHttpRequest wrapper based loosely on JQuery's XHR routines and ...
 *
 * <pre>
 *      XHConn - Simple XMLHTTP Interface - bfults@gmail.com - 2005-04-08
 *      Code licensed under Creative Commons Attribution-ShareAlike License
 *      http://creativecommons.org/licenses/by-sa/2.0/
 * </pre>
 *
 * @constructor
 */
function XHConn2() {
  var self = this;

  try {
    self.xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
  }
  catch(e) {
    try {
      self.xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    catch(e1) {
      try {
        self.xmlhttp = new XMLHttpRequest();
      }
      catch(e2) {
        self.xmlhttp = null;
      }
    }
  }

  /**
   * @type {?XMLHttpRequest}
   * @private
   */
  self.xmlhttp = null;

  /**
   * @private
   */
  self.bComplete = false;

  /**
   * @private
   * @type {?function(XMLHttpRequest)}
   */
  self.doneCallback = null;

  /**
   * @private
   */
  self.connId = 0;
}

/**
 * @dict
 * @protected
 */
XHConn2.xmlConns = {};

/**
 * @private
 */
XHConn2.xmlConnId = 0;

/**
 * Empty do-nothing function
 *
 * @private
 */
XHConn2.EMPTY_FUNC = function() {};

/**
 * Register a listener for a named DOM event on an element and when that event fires once, auto-unregister the listener
 *
 * @param {Element} el element to listen on
 * @param {string} eventName DOM event name
 * @param {function(Element,string)} handler callback that gets called with el and eventName when eventName event fires
 */
XHConn2.addOneShotEventListener = function(el, eventName, handler) {
  var callback;

  // jscs:disable requireFunctionDeclarations
  if(el.addEventListener) {
    /**
     * one-shot event listener callback
     */
    callback = function() {
      handler.call(el);
      el.removeEventListener(eventName, callback, false);
    };

    el.addEventListener(eventName, callback);
  }
  else {
    /**
     * one-shot event listener callback
     */
    callback = function() {
      handler.call(el);
      el.detachEvent(eventName, callback);
    };

    el.attachEvent("on" + eventName, callback);
  }
};

/**
 * Utility for injecting the text response of an AJAX request as a new script tag in the head of the document
 *
 * @param {XMLHttpRequest} xhr
 */
XHConn2.injectResponseAsScript = function(xhr) {
  var scriptTag = document.createElement("script");

  scriptTag["type"] = "text/javascript";
  scriptTag["src"] = xhr.responseText;

  document.getElementsByTagName("head")[0].appendChild(scriptTag);
};

/**
 * Open the XHR connection
 *
 * @param {string} sURL url to open
 * @param {string} sMethod "GET" or "POST"
 * @param {function(XMLHttpRequest)} fnDone callback for when the connection is complete and caller can listen to
 *        events
 * @returns {boolean}
 */
XHConn2.prototype.connect = function(sURL, sMethod, fnDone) {
  var self = this,
    firstQuestion = sURL.indexOf("?"),
    uri = firstQuestion >= 0 ? sURL.substring(0, firstQuestion) : sURL,
    queryString = firstQuestion >= 0 ? sURL.substring(firstQuestion + 1) : "";

  if(!self.xmlhttp) {
    return false;
  }

  sMethod = sMethod.toUpperCase();
  self.doneCallback = fnDone;

  if(sMethod === "GET") {
    self.xmlhttp.open(sMethod, uri + (queryString.length ? "?" + queryString : ""), true);
  }
  else {
    self.xmlhttp.open(sMethod, uri, true);
    self.xmlhttp.setRequestHeader("Method", "POST " + uri + " HTTP/1.1");
    self.xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  }

  try {
    self.setOnReadyStateChangeHandler();
    self.xmlhttp.send(queryString);

    self.connId = XHConn2.xmlConnId++;
    XHConn2.xmlConns[self.connId] = self;

    return true;
  }
  catch(e) {
    return false;
  }
};

/**
 * Abort the XHR
 */
XHConn2.prototype.abort = function() {
  var self = this;

  if(self.xmlhttp) {
    self.bComplete = true;
    self.xmlhttp.abort();
    self.cleanup();
  }
};

/**
 * @private
 */
XHConn2.prototype.cleanup = function() {
  var self = this;

  try {
    self.xmlhttp.onreadystatechange = XHConn2.EMPTY_FUNC;
    self.xmlhttp.abort = XHConn2.EMPTY_FUNC;
  }
  catch(e) {
  }

  self.xmlhttp = null;

  // unhook from the global xmlConns set
  delete XHConn2.xmlConns[self.connId];
};

/**
 * @private
 */
XHConn2.prototype.setOnReadyStateChangeHandler = function() {
  var self = this;

  /**
   * onDomReady handler
   */
  self.xmlhttp.onreadystatechange = function() {
    if(self.xmlhttp.readyState === 4 && !self.bComplete) {
      self.bComplete = true;
      self.doneCallback(self.xmlhttp);
      self.cleanup();
    }
  };
};

// manually abort for <= IE8 when the page is unloading so that we don't leave our garbage lying around
if(window.ActiveXObject) {
  XHConn2.addOneShotEventListener(window, "unload", function() {
    var key, aConn;

    for(key in XHConn2.xmlConns) {
      if(XHConn2.xmlConns.hasOwnProperty(key)) {
        aConn = XHConn2.xmlConns[key];

        if(aConn) {
          try {
            aConn.abort();
          }
          catch(e) {}
        }

        delete XHConn2.xmlConns[key];
      }
    }
  });
}

/**
 * require("./bootstrap/XHConn2.js") &rArr; {@link XHConn2}
 *
 * @module bootstrap/XHConn2.js
 */
module.exports = XHConn2;

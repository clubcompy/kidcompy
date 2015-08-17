"use strict";

var xmlConns = {},
  xmlConnId = 0;

/**
 * Empty do-nothing function
 *
 * @private
 */
function EMPTY_FUNC() {}

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
}

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

  scriptTag.type = "text/javascript";
  scriptTag.src = xhr.responseText;

  document.getElementsByTagName("head")[0].appendChild(scriptTag);
};

XHConn2.prototype = {
  xmlhttp: null,
  bComplete: false,
  doneCallback: null,
  connId: 0,

  /**
   * Open the XHR connection
   *
   * @param {string} sURL url to open
   * @param {string} sMethod "GET" or "POST"
   * @param {function(XMLHttpRequest)} fnDone callback for when the connection is complete and caller can listen to
   *        events
   * @returns {boolean}
   */
  connect: function(sURL, sMethod, fnDone) {
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

      self.connId = xmlConnId++;
      xmlConns[self.connId] = self;

      return true;
    }
    catch(e) {
      return false;
    }
  },

  /**
   * Abort the XHR
   */
  abort: function() {
    var self = this;

    if(self.xmlhttp) {
      self.bComplete = true;
      self.xmlhttp.abort();
      self.cleanup();
    }
  },

  /**
   * @private
   */
  cleanup: function() {
    var self = this;

    try {
      self.xmlhttp.onreadystatechange = EMPTY_FUNC;
      self.xmlhttp.abort = EMPTY_FUNC;
    }
    catch(e) {
    }

    self.xmlhttp = null;

    // unhook from the global xmlConns set
    delete xmlConns[self.connId];
  },

  /**
   * @private
   */
  setOnReadyStateChangeHandler: function() {
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
  }
};

// manually abort for <= IE8 when the page is unloading so that we don't leave our garbage lying around
if(window.ActiveXObject) {
  XHConn2.addOneShotEventListener(window, "unload", function() {
    var key, aConn;

    for(key in xmlConns) {
      if(xmlConns.hasOwnProperty(key)) {
        aConn = xmlConns[key];
        if(aConn) {
          aConn.abort();
        }
      }
    }

    // reset the XML connections object, just in case
    xmlConns = {};
  });
}

/**
 * require("./bootstrap/XHConn2.js") &rArr; {@link XHConn2}
 *
 * @module bootstrap/XHConn2.js
 */
module.exports = XHConn2;

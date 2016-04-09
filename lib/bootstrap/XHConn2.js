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
  var self = this,
    xhr = null;

  try {
    xhr = new ActiveXObject("Msxml2.XMLHTTP");
  }
  catch(e) {
    try {
      xhr = new ActiveXObject("Microsoft.XMLHTTP");
    }
    catch(e1) {
      try {
        xhr = new XMLHttpRequest();
      }
      catch(e2) {
      }
    }
  }

  /**
   * @type {?XMLHttpRequest}
   * @private
   */
  self.xmlhttp = xhr;

  /**
   * @type {boolean}
   * @private
   */
  self.bComplete = false;

  /**
   * @type {?function(XMLHttpRequest)}
   * @private
   */
  self.doneCallback = null;

  /**
   * @type {number}
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
 * @type {number}
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
 * @param {string} scriptText
 * @param {function()=} callback optional callback
 */
XHConn2.injectInlineScript = function(scriptText, callback) {
  // It is very important that we wait for onReady to fire here (but no later).  We're allowed to initiate
  // AJAX script loads before that time, but we must NOT inject scripts or affect the DOM before onDOMReady
  // fires
  kidcompy.lifecycleEvents.addOnReadyFiredHandler(XHConn2.injectScriptCallback(scriptText, callback));
};

/**
 * @private
 * @param {string} responseText
 * @param {function()=} callback optional callback
 * @returns {function()} closure to be called onReady
 */
XHConn2.injectScriptCallback = function(responseText, callback) {
  var script;

  return function() {
    if(typeof document === "undefined") {
      // jshint -W061
      eval(responseText);

      if(callback) {
        callback();
      }

      return;
    }

    // approach for DOM-based eval adapted from DOMEval() in JQuery.  Seems to be friendlier with Firebug than eval()

    script = document.createElement("script");
    script.text = responseText;
    document.head.appendChild(script);
    script.parentNode.removeChild(script);
    script = null;

    if(callback) {
      callback();
    }
  };
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
 * Public utility for loading and initializing a script
 *
 * @param {string} relativeUri uri pointing to script that is relative or root-relative to the calling page
 * @param {function()=} callback optional callback function to be called after script is loaded and initialized
 */
kidcompy.loadScript = function(relativeUri, callback) {
  (new XHConn2()).connect(relativeUri, "GET", function(xhr) {
    var scriptToInject = "" + xhr.responseText + "\n//# sourceURL=" + relativeUri + "\n";

    XHConn2.injectInlineScript(scriptToInject, callback);
  });
};

/**
 * require("./bootstrap/XHConn2.js") &rArr; {@link XHConn2}
 *
 * @protected
 * @module bootstrap/XHConn2.js
 */
module.exports = XHConn2;

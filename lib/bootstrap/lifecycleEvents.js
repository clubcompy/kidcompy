"use strict";

var exportPublicProperties = require("../symbols/exportPublicProperties"),
  XHConn2 = require("./XHConn2");

/**
 * Lifecycle events
 *
 * @constructor
 */
function LifecycleEvents() {
  var self = this;

  // There are four page lifecycle events we trigger, and we guarantee they trigger in the following order:
  //   onscript:  all kidcompy scripts have finished loading (but not finished initializing)
  //   onready:  DOM Ready state fired within the parent page
  //   oncodego:  all kidcompy scripts have finished initializing, you may now create interactive kidcompy instances
  //   onload:  window.onload triggered in the parent page's window

  self.onscriptHandlers = [];
  self.onscriptTriggered = false;
  self.onreadyHandlers = [];
  self.onreadyFired = false;
  self.onreadyTriggered = false;
  self.oncodegoHandlers = [];
  self.oncodegoFired = false;
  self.oncodegoTriggered = false;
  self.onloadHandlers = [];
  self.onloadFired = false;
  self.onloadTriggered = false;

  // immediately bind to the dom events
  self.initLifecycleEvents();
}

/**
 * @type {boolean}
 * @private
 */
LifecycleEvents.domEventsBound = false;

/**
 * register onReady and onLoad listeners
 *
 * @protected
 */
LifecycleEvents.prototype.initLifecycleEvents = function() {
  // only allow this function to be called once per browser session
  if(LifecycleEvents.domEventsBound) {
    return;
  }

  LifecycleEvents.domEventsBound = true;

  var self = this;

  // ready state is a different event for legacy IE browsers and the rest
  if(document.addEventListener) { // Mozilla, Opera, Webkit
    XHConn2.addOneShotEventListener(document, "DOMContentLoaded", function() {
      self.triggerOnReady();
    });
  }
  else if(document.attachEvent) { // If IE event model is used
    XHConn2.addOneShotEventListener(document, "readystatechange", function() {
      self.triggerOnReady();
    });
  }

  // if onReady never fires, onLoad will provide a fallback and trigger onReady so it won't be
  // a showstopper if onReady event never happens on its own
  XHConn2.addOneShotEventListener(window, "load", function() {
    self.triggerOnLoad();
  });
};

/**
 * <p>Add a callback to be called once after all scripts have been loaded
 *
 * <p>If the onScript event has already triggered when this function is called, then cb will be invoked immediately
 *
 * @public
 * @param {Function} cb callback
 */
LifecycleEvents.prototype.addOnScriptHandler = function(cb) {
  if(this.onscriptTriggered) {
    cb();
  }
  else {
    this.onscriptHandlers.push(cb);
  }
};

/**
 * Trigger onScript to fire
 *
 * @protected
 */
LifecycleEvents.prototype.triggerOnScript = function() {
  var self = this;

  if(!self.onscriptTriggered) {
    while(self.onscriptHandlers.length) {
      self.onscriptHandlers.shift()();
    }

    self.onscriptTriggered = true;

    self.executeOnReadyIfNeccessary();
  }
};

/**
 * <p>Add a callback to be called once after the DOM ready event has occurred
 *
 * <p>If DOM ready occurs before onScript is triggered, then onReady triggering will be deferred until after onScript
 * completes.
 *
 * <p>If the onReady event has already triggered when this function is called, then cb will be invoked immediately
 *
 * @public
 * @param {Function} cb callback
 */
LifecycleEvents.prototype.addOnReadyHandler = function(cb) {
  if(this.onreadyTriggered) {
    cb();
  }
  else {
    this.onreadyHandlers.push(cb);
  }
};

/**
 * Trigger onReady to fire
 *
 * @protected
 */
LifecycleEvents.prototype.triggerOnReady = function() {
  this.onreadyFired = true;

  this.executeOnReadyIfNeccessary();
};

/**
 * <p>Add a callback to be called once after the DOM ready event has occurred
 *
 * <p>If the code go event occurs before onReady is triggered, then onCodeGo triggering will be deferred until after
 * onReady completes.
 *
 * <p>If the onCodeGo event has already triggered when this function is called, then cb will be invoked immediately
 *
 * @public
 * @param {Function} cb callback
 */
LifecycleEvents.prototype.addOnCodeGoHandler = function(cb) {
  if(this.oncodegoTriggered) {
    cb();
  }
  else {
    this.oncodegoHandlers.push(cb);
  }
};

/**
 * Trigger onCodeGo to fire
 *
 * @protected
 */
LifecycleEvents.prototype.triggerOnCodeGo = function() {
  this.oncodegoFired = true;

  this.executeOnCodeGoIfNeccessary();
};

/**
 * <p>Add a callback to be called once after the window's onLoad event has occurred
 *
 * <p>If the onLoad event occurs before onCodeGo is triggered, then onLoad triggering will be deferred until after
 * onCodeGo completes.
 *
 * <p>If the onLoad event has already triggered when this function is called, then cb will be invoked immediately
 *
 * @public
 * @param {Function} cb callback
 */
LifecycleEvents.prototype.addOnLoadHandler = function(cb) {
  if(this.onloadTriggered) {
    cb();
  }
  else {
    this.onloadHandlers.push(cb);
  }
};

/**
 * Trigger onLoad to fire
 *
 * @protected
 */
LifecycleEvents.prototype.triggerOnLoad = function() {
  // force onReady to trigger if it hasn't already
  this.triggerOnReady();

  this.onloadFired = true;

  this.executeOnLoadIfNeccessary();
};

/**
 * @private
 */
LifecycleEvents.prototype.executeOnReadyIfNeccessary = function() {
  var self = this;

  if(self.onreadyFired && !self.onreadyTriggered) {
    // only trigger onReady if onScript has already triggered
    if(self.onscriptTriggered) {
      while(self.onreadyHandlers.length) {
        self.onreadyHandlers.shift()();
      }

      self.onreadyTriggered = true;
      self.executeOnCodeGoIfNeccessary();
    }
  }
};

/**
 * @private
 */
LifecycleEvents.prototype.executeOnCodeGoIfNeccessary = function() {
  var self = this;

  if(self.oncodegoFired && !self.oncodegoTriggered) {
    // only trigger onCodeGo if onScript and onReady has already triggered
    if(self.onscriptTriggered && self.onreadyTriggered) {
      while(self.oncodegoHandlers.length) {
        self.oncodegoHandlers.shift()();
      }

      self.oncodegoTriggered = true;
      self.executeOnLoadIfNeccessary();
    }
  }
};

/**
 * @private
 */
LifecycleEvents.prototype.executeOnLoadIfNeccessary = function() {
  var self = this;

  if(self.onloadFired && !self.onloadTriggered) {
    // only trigger onLoad if onScript, onReady, and onCodeGo has already triggered
    if(self.onscriptTriggered && self.onreadyTriggered && self.oncodegoTriggered) {
      while(self.onloadHandlers.length) {
        self.onloadHandlers.shift()();
      }

      self.onloadTriggered = true;
    }
  }
};

exportPublicProperties(LifecycleEvents.prototype, [
  ["addOnScriptHandler", LifecycleEvents.prototype.addOnScriptHandler],
  ["addOnReadyHandler", LifecycleEvents.prototype.addOnReadyHandler],
  ["addOnCodeGoHandler", LifecycleEvents.prototype.addOnCodeGoHandler],
  ["addOnLoadHandler", LifecycleEvents.prototype.addOnLoadHandler]
]);

/**
 * require("./bootstrap/lifecycleEvents") &rArr; singleton instance of {@link LifecycleEvents}
 *
 * @module bootstrap/lifecycleEvents
 */
module.exports = new LifecycleEvents();

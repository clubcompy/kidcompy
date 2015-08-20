"use strict";

var extendKidcompyNamespace = require("../symbols/extendKidcompyNamespace"),
  XHConn2 = require("./XHConn2");

// There are four page lifecycle events we trigger, and we guarantee they trigger in the following order:
//   onscript:  all kidcompy scripts have finished loading (but not finished initializing)
//   onready:  DOM Ready state fired within the parent page
//   oncodego:  all kidcompy scripts have finished initializing, you may now create interactive kidcompy instances
//   onload:  window.onload triggered in the parent page's window

(function() {
  var onscriptHandlers = [],
    onscriptTriggered = false,
    onreadyHandlers = [],
    onreadyFired = false,
    onreadyTriggered = false,
    oncodegoHandlers = [],
    oncodegoFired = false,
    oncodegoTriggered = false,
    onloadHandlers = [],
    onloadFired = false,
    onloadTriggered = false;

  extendKidcompyNamespace(/** @lends kidcompy */ {
    /**
     * <p>Add a callback to be called once after all scripts have been loaded
     *
     * <p>If the onScript event has already triggered when this function is called, then cb will be invoked immediately
     *
     * @param {Function} cb callback
     */
    addOnScriptHandler: function(cb) {
      if(onscriptTriggered) {
        cb();
      }
      else {
        onscriptHandlers.push(cb);
      }
    },

    /**
     * Trigger onScript to fire
     *
     * @protected
     */
    triggerOnScript: function() {
      if(!onscriptTriggered) {
        while(onscriptHandlers.length) {
          onscriptHandlers.shift()();
        }

        onscriptTriggered = true;

        executeOnReadyIfNeccessary();
      }
    },

    /**
     * <p>Add a callback to be called once after the DOM ready event has occurred
     *
     * <p>If DOM ready occurs before onScript is triggered, then onReady triggering will be deferred until after onScript
     * completes.
     *
     * <p>If the onReady event has already triggered when this function is called, then cb will be invoked immediately
     *
     * @param {Function} cb callback
     */
    addOnReadyHandler: function(cb) {
      if(onreadyTriggered) {
        cb();
      }
      else {
        onreadyHandlers.push(cb);
      }
    },

    /**
     * Trigger onReady to fire
     *
     * @protected
     */
    triggerOnReady: function() {
      onreadyFired = true;

      executeOnReadyIfNeccessary();
    },

    /**
     * <p>Add a callback to be called once after the DOM ready event has occurred
     *
     * <p>If the code go event occurs before onReady is triggered, then onCodeGo triggering will be deferred until after
     * onReady completes.
     *
     * <p>If the onCodeGo event has already triggered when this function is called, then cb will be invoked immediately
     *
     * @param {Function} cb callback
     */
    addOnCodeGoHandler: function(cb) {
      if(oncodegoTriggered) {
        cb();
      }
      else {
        oncodegoHandlers.push(cb);
      }
    },

    /**
     * Trigger onCodeGo to fire
     *
     * @protected
     */
    triggerOnCodeGo: function() {
      oncodegoFired = true;

      executeOnCodeGoIfNeccessary();
    },

    /**
     * <p>Add a callback to be called once after the window's onLoad event has occurred
     *
     * <p>If the onLoad event occurs before onCodeGo is triggered, then onLoad triggering will be deferred until after
     * onCodeGo completes.
     *
     * <p>If the onLoad event has already triggered when this function is called, then cb will be invoked immediately
     *
     * @param {Function} cb callback
     */
    addOnLoadHandler: function(cb) {
      if(onloadTriggered) {
        cb();
      }
      else {
        onloadHandlers.push(cb);
      }
    },

    /**
     * Trigger onLoad to fire
     *
     * @protected
     */
    triggerOnLoad: function() {
      // force onReady to trigger if it hasn't already
      kidcompy.triggerOnReady();

      onloadFired = true;

      executeOnLoadIfNeccessary();
    },

    /**
     * register onReady and onLoad listeners
     *
     * @protected
     */
    initLifecycleEvents: function() {
      kidcompy.initLifecycleEvents = kidcompy.NOOP; // only allow this function to be called once

      // ready state is a different event for legacy IE browsers and the rest
      if(document.addEventListener) { // Mozilla, Opera, Webkit
        XHConn2.addOneShotEventListener(document, "DOMContentLoaded", kidcompy.triggerOnReady);
      }
      else if(document.attachEvent) { // If IE event model is used
        XHConn2.addOneShotEventListener(document, "readystatechange", kidcompy.triggerOnReady);
      }

      // if onReady never fires, onLoad will provide a fallback and trigger onReady so it won't be
      // a showstopper if onReady event never happens on its own
      XHConn2.addOneShotEventListener(window, "load", kidcompy.triggerOnLoad);
    }
  });

  /**
   * @private
   */
  function executeOnReadyIfNeccessary() {
    if(onreadyFired && !onreadyTriggered) {
      // only trigger onReady if onScript has already triggered
      if(onscriptTriggered) {
        while(onreadyHandlers.length) {
          onreadyHandlers.shift()();
        }

        onreadyTriggered = true;
        executeOnCodeGoIfNeccessary();
      }
    }
  }

  /**
   * @private
   */
  function executeOnCodeGoIfNeccessary() {
    if(oncodegoFired && !oncodegoTriggered) {
      // only trigger onCodeGo if onScript and onReady has already triggered
      if(onscriptTriggered && onreadyTriggered) {
        while(oncodegoHandlers.length) {
          oncodegoHandlers.shift()();
        }

        oncodegoTriggered = true;
        executeOnLoadIfNeccessary();
      }
    }
  }

  /**
   * @private
   */
  function executeOnLoadIfNeccessary() {
    if(onloadFired && !onloadTriggered) {
      // only trigger onLoad if onScript, onReady, and onCodeGo has already triggered
      if(onscriptTriggered && onreadyTriggered && oncodegoTriggered) {
        while(onloadHandlers.length) {
          onloadHandlers.shift()();
        }

        onloadTriggered = true;
      }
    }
  }

  // register for native onLoad and onDOMReadt events
  kidcompy.initLifecycleEvents();
})();

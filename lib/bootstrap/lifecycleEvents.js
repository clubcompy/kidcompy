"use strict";

var extendKidcompyNamespace = require("../symbols/extendKidcompyNamespace");

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
      onloadFired = true;

      executeOnLoadIfNeccessary();
    }
  });

  /**
   * @private
   */
  function executeOnReadyIfNeccessary() {
    if(onreadyFired && !onreadyTriggered) {
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
      if(onscriptTriggered && onreadyTriggered && oncodegoTriggered) {
        while(onloadHandlers.length) {
          onloadHandlers.shift()();
        }

        onloadTriggered = true;
      }
    }
  }

})();

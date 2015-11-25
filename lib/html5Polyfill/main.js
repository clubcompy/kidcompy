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

var exportPublicProperties = require("../symbols/exportPublicProperties"),
  initialized = false;

/**
 * Stub Object.freeze(), if necessary
 */
function stubObjectFreeze() {
  if(!Object.freeze) {
    /**
     * Object.freeze stub function
     */
    Object.freeze = function() {};

    // global export
    exportPublicProperties(Object, [
      ["freeze", Object.freeze]
    ]);
  }
}

/**
 * Polyfill Array.from(), if necessary
 */
function polyfillArrayFrom() {
  // jscs:disable requireMultipleVarDecl, requireCapitalizedConstructors

  // Production steps of ECMA-262, Edition 6, 22.1.2.1
  // Reference: https://people.mozilla.org/~jorendorff/es6-draft.html#sec-array.from
  if(!Array.from) {
    Array.from = (function() {
      var toStr = Object.prototype.toString;

      /**
       * Is fn a callable function?
       *
       * @param {Function} fn
       * @returns {boolean}
       */
      function isCallable(fn) {
        return typeof fn === "function" || toStr.call(fn) === "[object Function]";
      }

      /**
       * Convert value to an Integer
       *
       * @param {*} value
       * @returns {number}
       */
      function toInteger(value) {
        var number = Number(value);

        if(isNaN(number)) {
          return 0;
        }

        if(number === 0 || !isFinite(number)) {
          return number;
        }

        return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
      }

      var maxSafeInteger = Math.pow(2, 53) - 1;

      /**
       * Make a sane length out of value
       *
       * @param {*} value
       * @returns {number}
       */
      function toLength(value) {
        var len = toInteger(value);

        return Math.min(Math.max(len, 0), maxSafeInteger);
      }

      /**
       * Array.from polyfill
       *
       * @param {*} arrayLike An array-like or iterable object to convert to an array.
       * @param {(function(*,number): *)=} mapFn Optional. Map function to call on every value,index of the array.
       * @param {*=} thisArg Optional. Value to use as this when executing mapFn.
       * @returns {Array}
       */
      function from(arrayLike, mapFn, thisArg) {
        // 1. Let C be the this value.
        var self = this;

        // 2. Let items be ToObject(arrayLike).
        var items = Object(arrayLike);

        // 3. ReturnIfAbrupt(items).
        if(arrayLike === null) {
          throw new TypeError("Array.from requires an array-like object - not null or undefined");
        }

        // 4. If mapfn is undefined, then let mapping be false.
        if(arguments.length < 2) {
          mapFn = void undefined;
        }

        if(typeof mapFn !== "undefined") {
          // 5. else
          // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
          if(!isCallable(mapFn)) {
            throw new TypeError("Array.from: when provided, the second argument must be a function");
          }

          // 5. b. If thisArg was not supplied, let thisArg be undefined.
          if(arguments.length < 3) {
            thisArg = void undefined;
          }
        }

        // 10. Let lenValue be Get(items, "length").
        // 11. Let len be ToLength(lenValue).
        var len = toLength(items.length);

        // 13. If IsConstructor(C) is true, then
        // 13. a. Let A be the result of calling the [[Construct]] internal method of C with an argument list containing the single item len.
        // 14. a. Else, Let A be ArrayCreate(len).
        var A = isCallable(self) ? Object(new self(len)) : new Array(len);

        // 16. Let k be 0.
        var k = 0;

        // 17. Repeat, while k < len… (also steps a - h)
        var kValue;

        while(k < len) {
          kValue = items[k];
          if(mapFn) {
            A[k] = typeof thisArg === "undefined" ? mapFn(kValue, k) : mapFn.call(thisArg, kValue, k);
          }
          else {
            A[k] = kValue;
          }

          k += 1;
        }

        // 18. Let putStatus be Put(A, "length", len, true).
        A.length = len;

        // 20. Return A.
        return A;
      }

      return from;
    }());

    // global export
    exportPublicProperties(Array, [
      ["from", Array.from]
    ]);
  }
}

/**
 * Polyfill Object.assign if it does not already exist
 */
function polyfillObjectAssign() {
  if(!Object.assign) {
    Object.defineProperty(Object, "assign", {
      enumerable: false,
      configurable: true,
      writable: true,

      /**
       * Polyfill for Object.assign()
       *
       * @param {(Object|Function)} target object to be extended
       * @param {...*} sources 0 or more objects to extend target with
       * @returns {*} target, which is extended by the properties of sources
       */
      value: function(target, sources) {
        "use strict";

        if(target === undefined || target === null) {
          throw new TypeError("Cannot convert first argument to object");
        }

        var to = Object(target);

        for(var i = 1; i < arguments.length; i++) {
          var nextSource = arguments[i];

          if(nextSource === undefined || nextSource === null) {
            continue;
          }

          nextSource = Object(nextSource);

          var keysArray = Object.keys(nextSource);

          for(var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
            var nextKey = keysArray[nextIndex];
            var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);

            if(desc !== undefined && desc.enumerable) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }

        return to;
      }
    });
  }
}

/**
 * Called by lifecycle script to start Html5 Polyfills and ES6 polyfills
 *
 * @public
 * @param {function()} done callback to be called once HTML5 polyfills init is complete
 */
kidcompy.initializeHtml5Polyfills = function(done) {
  if(initialized) {
    return;
  }

  initialized = true;

  // load the es5-shim and es5-sham so that super legacy browsers can limp along with us
  require("es5-shim/es5-shim");
  require("es5-shim/es5-sham");

  // Object.freeze can't be polyfilled, so just sham it
  stubObjectFreeze();

  // Polyfill Array.from
  polyfillArrayFrom();

  // Polyfill Object.assign
  polyfillObjectAssign();

  // Make sure we have the JSON api on the window object
  if(typeof window["JSON"] === "undefined") {
    window["JSON"] = require("json3");
  }

  // Make sure we have es6 promises on the window object
  require("es6-promise").polyfill();

  // kidcompy.log("html5Polyfill loaded");

  done();
};

// global exports
exportPublicProperties(kidcompy, [
  ["initializeHtml5Polyfills", kidcompy.initializeHtml5Polyfills]
]);

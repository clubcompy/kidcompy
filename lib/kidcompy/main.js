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

var exportPublicProperties = require("../symbols/exportPublicProperties"),
  KidcompyHost = require("./KidcompyHost"),
  initialized = false;

/**
 * Kidcompy module main entry point
 */
function main() {
  var installWebpackHotReloadScript;

  if(!PRODUCTION_MODE) {
    /** Webpack hot reload for DEVELOPMENT_MODE builds only */
    installWebpackHotReloadScript = function() {
      /**
       * load webpack-dev-server.js for a kidcompy harness
       */
      function loadWebpackDevServerScript() {
        var pageUrl = "" + window.location.href,
          devServerUrl = /([^:]+:\/\/[^\/]+\/).*/.exec(pageUrl)[1] + "webpack-dev-server.js",
          scriptTag = document.createElement("script");

        // Write the webpack hot dev server script tag.  URL needs to be full and not relative, that's why it is built
        // using the window.location.href's URL above as the base
        scriptTag.setAttribute("type", "text/javascript");
        scriptTag.setAttribute("src", devServerUrl);
        document.getElementsByTagName("body")[0].appendChild(scriptTag);
        scriptTag = null;
      }

      // wait for kidcompy to appear before trying to register for the onCodeGo event
      kidcompy.lifecycleEvents.addOnCodeGoHandler(function() {
        // if we are NOT running karma, then we're in the harness and need to load the webpack-dev-server script
        if(typeof window["__karma__"] === "undefined") {
          loadWebpackDevServerScript();
        }
      });
    };
  }

  /**
   * Called by the bootstrap script to start initialing the kidcompy module
   *
   * @public
   * @param {function()} done callback called when the kidcompy module is initialized
   */
  kidcompy.initialize = function(done) {
    if(initialized) {
      return;
    }

    initialized = true;

    if(!PRODUCTION_MODE) {
      installWebpackHotReloadScript();
    }

    done();
  };

  /**
   * Create a new host for a Kidcompy instance (and start that instance)
   *
   * @param {!(Element|Node)} theDiv the DIV into which the compy should be instantiated
   * @returns {!KidcompyHost}
   */
  kidcompy.create = function(theDiv) {
    return new KidcompyHost(theDiv.getAttribute("id"), theDiv.ownerDocument);
  };

  // global exports
  exportPublicProperties(kidcompy, [
    ["initialize", kidcompy.initialize],
    ["create", kidcompy.create]
  ]);
}

// invoke main() immediately
main();

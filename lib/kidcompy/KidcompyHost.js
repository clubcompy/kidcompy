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

var FlipBuffer = require("./FlipBuffer"),
  DomNodeSurrogate = require("./DomNodeSurrogate"),
  DomNodeType = require("./DomNodeType"),
  DomNodeCache = require("./DomNodeCache"),
  DomMutationsLog = require("./DomMutationsLog"),
  SystemProperties = require("./SystemProperties"),
  DomTools = require("./DomTools"),
  constants = require("./constants"),
  exportPublicProperties = require("../symbols/exportPublicProperties"),
  KidcompyHostState = require("./KidcompyHostState"),
  rxjs = kidcompy.rxjs,
  UserDataStorage = require("./localStorage/UserDataStorage");

// apply global defaults to the system properties as this script loads

SystemProperties.setGlobalDefaultProperty(constants.KEY_DISPLAY_WIDTH, constants.DEFAULT_DISPLAY_WIDTH);
SystemProperties.setGlobalDefaultProperty(constants.KEY_DISPLAY_HEIGHT, constants.DEFAULT_DISPLAY_HEIGHT);

/**
 * KidcompyHost
 *
 * @constructor
 * @extends {DomNodeSurrogate}
 * @param {!string} nodeId This is ID of the DOM Node where the compy will be displayed, input captured, etc.
 * @param {Document=} ownerDocument optional DOM Document this KidcompyHost belongs to, defaults to window.document
 * @param {DomNodeCache=} nodeCache optional cache that will be used to find/update DOM Nodes
 * @param {DomMutationsLog=} mutationsLog optional log if you want to track the mutations made to the dom here
 */
function KidcompyHost(nodeId, ownerDocument, nodeCache, mutationsLog) {
  var self = this,
    resetLogWhenDone = false,
    kidcompyHostDiv, widthPx, heightPx;

  if(!nodeId) {
    throw new Error("theDiv was falsy");
  }

  if(!ownerDocument) {
    ownerDocument = window.document;
  }

  // make a temporary DomMutationsLog if one wasn't provided by the caller
  if(!mutationsLog) {
    resetLogWhenDone = true;
    mutationsLog = new DomMutationsLog();
  }

  if(!nodeCache) {
    nodeCache = new DomNodeCache(ownerDocument);
  }

  /* call super constructor */
  DomNodeSurrogate.call(self, null, nodeId, ownerDocument, DomNodeType.KIDCOMPY_HOST, nodeCache, mutationsLog);

  /**
   * @name KidcompyHost#systemProperties
   * @type {!SystemProperties}
   * @package
   */
  self.systemProperties = new SystemProperties();

  /**
   * @name KidcompyHost#flipBuffers
   * @type {!Array.<FlipBuffer>}
   */
  self.flipBuffers = KidcompyHost.attachFlipBuffers(self, nodeCache, self.systemProperties, mutationsLog);

  /**
   * The browser's native frame count, guaranteed to be >= gameFrameCount.
   *
   * <p>Whenever animationFrameCount increments and gameFrameCount does not, a frame skip has occurred
   *
   * @name KidcompyHost#animationFrameCount
   * @type {!number}
   */
  self.animationFrameCount = 0;

  /**
   * The browser's native frame flip time for the latest frame
   *
   * @name KidcompyHost#lastAnimationFrameTime
   * @type {!number}
   */
  self.lastAnimationFrameTime = 0;

  /**
   * The KidcompyHost main loop counter.  Each time this is incremented, we have flipped our FlipBuffers once
   *
   * @name KidcompyHost#gameFrameCount
   * @type {!number}
   */
  self.gameFrameCount = 0;

  /**
   * @name KidcompyHost#lastGameFrameTime
   * @type {!number}
   */
  self.lastGameFrameTime = 0;

  /**
   * @name KidcompyHost#state
   * @type {!KidcompyHostState}
   */
  self.state = KidcompyHostState.FLIP_BUFFERS;

  if(resetLogWhenDone) {
    // call mutationsLog.reset() here to free up the memory from our temporary DomMutationsLog
    mutationsLog.reset();
  }

  if(!self.nodeId || !self.nodeId.length) {
    throw new Error("theDiv must have an id");
  }

  // Apply css styling to host
  kidcompyHostDiv = self.nodeCache.findDomNode(self);
  DomTools.addClass(kidcompyHostDiv, "kcHost");

  // In order that the block-styled kcHost can be centered horizontally, we must programmatically set its width
  // Setting its height as well since we know it
  heightPx = self.systemProperties.getNumberProperty(constants.KEY_DISPLAY_HEIGHT) + "px";
  widthPx = self.systemProperties.getNumberProperty(constants.KEY_DISPLAY_WIDTH) + "px";
  DomTools.setInlineStyles(kidcompyHostDiv, {
    width: widthPx,
    height: heightPx
  });

  // Export some of the internals for the time being so they can be accessed directly from the harness
  exportPublicProperties(self, [
    [ "flipBuffers", self.flipBuffers ]
  ]);

  self.scheduleNextFrame();
}

KidcompyHost.prototype = Object.create(DomNodeSurrogate.prototype);

/**
 * Trigger the main rendering loop opportunity
 */
KidcompyHost.prototype.scheduleNextFrame = function() {
  var self = this;

  rxjs.Scheduler.animationFrame.schedule(self.onNextFrameCb());
};

/**
 * Returns a callback that will be called at the start of the next video frame
 *
 * @returns {!function(AnimationFrameScheduler, number)}
 */
KidcompyHost.prototype.onNextFrameCb = function() {
  var self = this;

  return function(animationFrameScheduler, frameTime) {
    if(!frameTime) {
      frameTime = kidcompy.now();
    }

    self.lastAnimationFrameTime = frameTime;

    // always schedule the next frame ASAP
    self.scheduleNextFrame();

    self.process();
  };
};

/**
 * Perform processing for current state
 */
KidcompyHost.prototype.process = function() {
  var self = this;

  switch(self.state) {
    case KidcompyHostState.FLIP_BUFFERS:
      self.lastGameFrameTime = self.lastAnimationFrameTime;
      self.gameFrameCount++;

      // flip which buffer is front
      self.flip();

      // kidcompy.log("Last game frame time: " + self.lastAnimationFrameTime);

      // Transition to the next KidcompyHostState here
      // self.state = KidcompyHostState.PROCESS_INPUTS;
      break;
  }
};

/**
 * Flip FlipBuffers from foreground to background and vice versa
 */
KidcompyHost.prototype.flip = function() {
  // jshint -W016
  var self = this;

  if(self.flipBuffers.length > 1) {
    // the zeroth flipBuffer always animates
    if(self.gameFrameCount & 1) { // even
      self.flipBuffers[0].flipToForeground();
    }
    else { // odd
      self.flipBuffers[0].flipToBackground();
    }
  }
};

Object.assign(KidcompyHost, /** @lends {KidcompyHost} */ {
  /**
   * Create FlipBuffers for constructor
   *
   * @package
   * @param {!DomNodeSurrogate} kidcompyHost {@link KidcompyHost} instance to modify
   * @param {!DomNodeCache} nodeCache the DomNodeCache used to find and cache nodes in the DOM
   * @param {!SystemProperties} systemProperties system properties
   * @param {!DomMutationsLog} mutationsLog
   * @returns {Array.<FlipBuffer>} array of 2 FlipBuffers
   */
  attachFlipBuffers: function(kidcompyHost, nodeCache, systemProperties, mutationsLog) {
    return [
      new FlipBuffer(kidcompyHost, nodeCache, 0, false, kidcompyHost.ownerDocument, systemProperties, mutationsLog),
      new FlipBuffer(kidcompyHost, nodeCache, 1, true, kidcompyHost.ownerDocument, systemProperties, mutationsLog)
    ];
  }
});

// make this available as a public export
kidcompy["KidcompyHost"] = KidcompyHost;

/**
 * <strong>require("./kidcompy/KidcompyHost")</strong> &rArr; {@link KidcompyHost}
 *
 * @protected
 * @module kidcompy/KidcompyHost
 */
module.exports = KidcompyHost;

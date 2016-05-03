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

// fake out closure compiler who is bonking on the AMD wrapper within rx.all.compat and its search for a global
// 'module' symbol

if(!window["module"]) {
  window["module"] = null;
}

if(!window["define"]) {
  window["define"] = null;
}

/**
 * <p>rxjs
 *
 * @license Kidcompy references components of RxJS.  RxJS is licensed for use in
 * Kidcompy under the Apache license.
 *
 * <p>Original copyright follows:
 * <blockquote>
 *      Copyright 2015-2016 Netflix, Inc., Microsoft Corp. and contributors
 * </blockquote>
 *
 * @namespace
 */
var rxjs = require("../../../node_modules/rx/dist/rx.all.compat");

/**
 * @private
 * @extends {rxjs.Scheduler}
 * @constructor
 */
rxjs.AnimationFrameScheduler = function() {
  rxjs.Scheduler.call(this);
};

rxjs.AnimationFrameScheduler.prototype = Object.create(rxjs.Scheduler.prototype);

/**
 * Schedule a tick on the next requestAnimationFrame firing
 *
 * @param {!Function} actionCb
 * @returns {Rx.Disposable}
 */
rxjs.AnimationFrameScheduler.prototype.schedule = function(actionCb) {
  var self = this,
    hasFired = false,
    animationFrameToken = window.requestAnimationFrame(function(frameTime) {
      hasFired = true;
      actionCb(self, frameTime);
    }),
    disposableInstance = rxjs.Disposable.create(function() {
      if(!hasFired) {
        window.cancelAnimationFrame(animationFrameToken);
      }
    });

  return disposableInstance;
};

rxjs.Scheduler.animationFrame = new rxjs.AnimationFrameScheduler();

/**
 * <strong>require("./kidcompy/tools/rxjs") &rArr;</strong> RxJS
 *
 * @module kidcompy/tools/rxjs
 */
module.exports = rxjs;

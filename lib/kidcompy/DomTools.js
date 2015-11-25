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

/* these utils were based on hints given at http://youmightnotneedjquery.com/ */

/**
 * DomTools
 */
var DomTools = {
  /**
   * <p>Add css class to DOM Element
   *
   * <p>IMPORTANT NOTE: for performance reasons, addClass DOES NOT verify whether el already has className assiged to
   * it or not.  Make sure in your testing related to code that uses this function that you guarantee a css class name
   * does not get added to the DOM Element more than once
   *
   * @param {!(Node|Element)} el
   * @param {!string} className
   */
  addClass: function(el, className) {
    if(!className) {
      throw new Error("class name expected");
    }

    if(el.classList) {
      el.classList.add(className);
    }
    else {
      el.className += " " + className;
    }
  },

  /**
   * <p>DOM Element has css class?
   *
   * <p>Hey, so are you here because you want to read from the DOM?  Because reading from the DOM is costly,
   * maybe you could cache this somewhere and/or not ever ever ever call this?  Just sayin'.  Aside from that,
   * this function is pretty useful for unit testing
   *
   * @param {!(Node|Element)} el
   * @param {!string} className
   * @returns {!boolean} true if className is set on el, false if not
   */
  hasClass: function(el, className) {
    if(!className) {
      throw new Error("className expected");
    }

    if(el.classList) {
      return el.classList.contains(className);
    }
    else {
      return (new RegExp("(^| )" + className + "( |$)", "gi")).test(el.className);
    }
  },

  /**
   * Remove CSS class from DOM Element
   *
   * @param {!(Node|Element)} el
   * @param {!string} className
   */
  removeClass: function(el, className) {
    if(!className) {
      throw new Error("class name expected");
    }

    if(el.classList) {
      el.classList.remove(className);
    }
    else {
      el.className = el.className.replace(new RegExp("(^|\\b)" + className.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    }
  },

  /**
   * Override a css INLINE style on el
   *
   * @param {!(Element|Node)} el
   * @param {!string} styleName
   * @param {!string} styleValue
   */
  setInlineStyle: function(el, styleName, styleValue) {
    el.style[styleName] = styleValue;
  },

  /**
   * Override a css INLINE style on el
   *
   * @param {!(Element|Node)} el
   * @param {!Object.<string,string>} styles
   */
  setInlineStyles: function(el, styles) {
    Object.assign(el.style, styles);
  },

  /**
   * Set a tag attribute on el
   *
   * @param {!(Element|Node)} el
   * @param {!string} attributeName
   * @param {!string} value
   */
  setTagAttribute: function(el, attributeName, value) {
    el.setAttribute(attributeName, value);
  },

  /**
   * Set a tag attribute on el
   *
   * @param {!(Element|Node)} el
   * @param {!string} attributeName
   * @returns {string}
   */
  getTagAttribute: function(el, attributeName) {
    return el.getAttribute(attributeName);
  },

  /**
   * Hey there!  I see you're looking to read styles on your dom element!  Did you know this causes reflows and other
   * havoc for like 90% of elements and styles?  Perhaps you should cache this data?  Better yet, don't ever call
   * me except in unit tests!  Thanks in advance - the mgmt
   *
   * @param {!(Element|Node)} el
   * @param {!string} styleName
   */
  getInlineStyle: function(el, styleName) {
    return el.style[styleName];
  },

  /**
   * @private
   * @param {!(Node|Element)} parentEl
   * @param {!function(!(Node|Element)): boolean} callback
   */
  iterateElementChildren: function(parentEl, callback) {
    var i,
      childEl;

    for(i = parentEl.children.length; i--;) {
      childEl = parentEl.children[i];

      // Skip comment nodes on IE8
      if(childEl && childEl.nodeType !== 8) {
        // stop looping if the callback for the child returns false
        if(callback(childEl) === false) {
          break;
        }
      }
    }
  },

  /**
   * Search immediate children of parentEl for the first Element that has css class childClassName
   *
   * @param {!(Node|Element)} parentEl
   * @param {!string} childClassName
   * @returns {?(Node|Element)} returns first child with matching class name, or null if not found
   */
  findChildByClass: function(parentEl, childClassName) {
    if(!childClassName) {
      throw new Error("class name expected");
    }

    var matchingEl = null;

    DomTools.iterateElementChildren(parentEl, function(childEl) {
      if(DomTools.hasClass(childEl, childClassName)) {
        matchingEl = childEl;
        return false;
      }

      return true;
    });

    return matchingEl;
  }
};

/**
 * <strong>require("./kidcompy/DomTools")</strong> &rArr; {@link DomTools}
 *
 * @protected
 * @module kidcompy/DomTools
 */
module.exports = DomTools;

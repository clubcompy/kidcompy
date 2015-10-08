"use strict";

/* these utils were based on hints given at http://youmightnotneedjquery.com/ */

/**
 * DomTools
 *
 * @const
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
   * <p>Hey, so are you here because you want to read from the DOM?  Because that's costly,
   * maybe you could cache this somewhere and not ever do it?  Just sayin'.  That said, this
   * is pretty useful for testing
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

;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
(function() {
  var Drag, setup;

  Drag = require("./polyfill.coffee");

  setup = function() {
    var drag;
    return drag = new Drag();
  };

  setup();

}).call(this);

},{"./polyfill.coffee":2}],2:[function(require,module,exports){
(function() {
  var Drag,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Drag = (function() {
    function Drag() {
      this.endDrag = __bind(this.endDrag, this);
      this.contDrag = __bind(this.contDrag, this);
      this.startDrag = __bind(this.startDrag, this);
      this.$root = $(document);
      this.draggedTarget = null;
      this.dragging = false;
      this.initListeners();
    }

    Drag.prototype.initListeners = function() {
      this.$root.on("mousedown", this.startDrag);
      this.$root.on("mousemove", this.contDrag);
      return this.$root.on("mouseup", this.endDrag);
    };

    Drag.prototype.startDrag = function(e) {
      return this.draggedTarget = e.target;
    };

    Drag.prototype.contDrag = function(e) {
      if (this.draggedTarget != null) {
        if (!this.dragging) {
          this.triggerEvent("p-dragstart", this.draggedTarget, e);
          return this.dragging = true;
        } else {
          return this.triggerEvent("p-dragmove", this.draggedTarget, e);
        }
      }
    };

    Drag.prototype.endDrag = function(e) {
      if (this.draggedTarget != null) {
        this.triggerEvent("p-dragend", this.draggedTarget, e);
        this.dragging = false;
        return this.draggedTarget = null;
      }
    };

    Drag.prototype.triggerEvent = function(type, target, e) {
      var newEvent;
      newEvent = $.Event(type);
      newEvent.pageX = e.pageX;
      newEvent.pageY = e.pageY;
      return $(target).trigger(newEvent);
    };

    return Drag;

  })();

  module.exports = Drag;

}).call(this);

},{}]},{},[1])
;
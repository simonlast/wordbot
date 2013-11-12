;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
(function() {
  var Drag, setup;

  require("./components/loadAll.coffee");

  Drag = require("./polyfill.coffee");

  setup = function() {
    var drag;
    return drag = new Drag();
  };

  window.onload = setup;

}).call(this);

},{"./components/loadAll.coffee":2,"./polyfill.coffee":3}],3:[function(require,module,exports){
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
          this.dragging = true;
        }
        return this.triggerEvent("p-dragmove", this.draggedTarget, e);
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
      newEvent.target = e.target;
      return $(target).trigger(newEvent);
    };

    return Drag;

  })();

  module.exports = Drag;

}).call(this);

},{}],2:[function(require,module,exports){
(function() {
  require("./node.coffee");

}).call(this);

},{"./node.coffee":4}],4:[function(require,module,exports){
(function() {
  var Node, html;

  Node = Object.create(HTMLElement.prototype);

  html = "<input class=\"node-text\"></input>\n<button class=\"node-connect\"></button>";

  Node.insertedCallback = function() {
    this.$el = $(this);
    this.innerHTML = html;
    return this.initListeners_();
  };

  Node.initListeners_ = function() {
    this.$el.on("p-dragstart", this.dragStart_.bind(this));
    this.$el.on("p-dragmove", this.dragMove_.bind(this));
    this.$el.on("p-dragend", this.dragEnd_.bind(this));
    this.$connect = this.$el.children(".node-connect");
    this.$connect.on("p-dragstart", this.connectDragStart_.bind(this));
    this.$connect.on("p-dragmove", this.connectDragMove_.bind(this));
    return this.$connect.on("p-dragend", this.connectDragEnd_.bind(this));
  };

  Node.dragStart_ = function(e) {
    var offset;
    if (e.target === this) {
      this.parentElement.appendChild(this);
      offset = this.$el.offset();
      return this.startOffset = [e.pageX - offset.left, e.pageY - offset.top];
    }
  };

  Node.dragMove_ = function(e) {
    if (this.startOffset != null) {
      return this.$el.css({
        left: (e.pageX - this.startOffset[0]) + "px",
        top: (e.pageY - this.startOffset[1]) + "px"
      });
    }
  };

  Node.dragEnd_ = function(e) {
    return this.startOffset = null;
  };

  Node.connectDragStart_ = function(e) {
    return console.log(e);
  };

  Node.connectDragMove_ = function(e) {
    return console.log(e);
  };

  Node.connectDragEnd_ = function(e) {
    return console.log(e);
  };

  document.register("p-node", {
    prototype: Node
  });

}).call(this);

},{}]},{},[1])
;
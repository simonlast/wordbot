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
  require("./ConnectionLayer.coffee");

  require("./Node.coffee");

}).call(this);

},{"./ConnectionLayer.coffee":4,"./Node.coffee":5}],4:[function(require,module,exports){
(function() {
  var ConnectionLayer, html;

  ConnectionLayer = Object.create(HTMLElement.prototype);

  html = "<svg></svg>";

  ConnectionLayer.insertedCallback = function() {
    this.$el = $(this);
    this.innerHTML = html;
    this.svg = this.querySelector("svg");
    return this.users = {};
  };

  ConnectionLayer.registerUser = function(id) {
    var group;
    group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.svg.appendChild(group);
    return this.users[id] = group;
  };

  ConnectionLayer.addLineEl = function(id, fromEl, toEl) {
    var fromMiddle, toMiddle;
    fromMiddle = this.getElMiddle(fromEl);
    toMiddle = this.getElMiddle(toEl);
    return this.addLine(id, fromMiddle, toMiddle);
  };

  ConnectionLayer.addLine = function(id, from, to) {
    var sub;
    this.addLineSimple(id, from, to);
    from = $V(from);
    to = $V(to);
    sub = from.subtract(to);
    sub = sub.rotate(Math.PI / 2, $V([0, 0]));
    sub = sub.toUnitVector();
    sub = sub.multiply(8);
    this.addLineSimple(id, from.add(sub).elements, to.elements);
    return this.addLineSimple(id, from.subtract(sub).elements, to.elements);
  };

  ConnectionLayer.addLineSimple = function(id, from, to) {
    var group, newLine;
    newLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    newLine.setAttribute("x1", from[0]);
    newLine.setAttribute("x2", to[0]);
    newLine.setAttribute("y1", from[1]);
    newLine.setAttribute("y2", to[1]);
    group = this.users[id];
    return group.appendChild(newLine);
  };

  ConnectionLayer.addLineTriangle = function(id, from, to) {
    var attrString, group, newLine, points, reduce, sub;
    newLine = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    from = $V(from);
    to = $V(to);
    sub = from.subtract(to);
    sub = sub.rotate(Math.PI / 2, $V([0, 0]));
    sub = sub.toUnitVector();
    sub = sub.multiply(20);
    points = [from.add(sub), from.subtract(sub), to];
    reduce = function(result, point) {
      return result += "" + point.elements[0] + "," + point.elements[1] + " ";
    };
    attrString = _.reduce(points, reduce, "");
    newLine.setAttribute("points", attrString);
    group = this.users[id];
    return group.appendChild(newLine);
  };

  ConnectionLayer.clear = function(id) {
    var group;
    group = this.users[id];
    return group.innerHTML = "";
  };

  ConnectionLayer.getElMiddle = function(el) {
    var $el, height, offset, width;
    $el = $(el);
    offset = $el.offset();
    width = $el.width();
    height = $el.height();
    return [offset.left + width / 2, offset.top + height / 2];
  };

  document.register("p-connection-layer", {
    prototype: ConnectionLayer
  });

}).call(this);

},{}],5:[function(require,module,exports){
(function() {
  var Node, html;

  Node = Object.create(HTMLElement.prototype);

  html = "<input class=\"node-text\"></input>\n<button class=\"node-connect\"></button>";

  Node.insertedCallback = function() {
    this.$el = $(this);
    this.innerHTML = html;
    this.connectionLayer = document.querySelector("p-connection-layer");
    this.nodeId = this.getAttribute("node-id");
    this.connectionLayer.registerUser(this.nodeId);
    this.connectedTo = [];
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
      return this.dragStartOffset = [e.pageX - offset.left, e.pageY - offset.top];
    }
  };

  Node.dragMove_ = function(e) {
    if (this.dragStartOffset != null) {
      this.$el.css({
        left: (e.pageX - this.dragStartOffset[0]) + "px",
        top: (e.pageY - this.dragStartOffset[1]) + "px"
      });
      return this.drawAllConnections(this.nodeId);
    }
  };

  Node.dragEnd_ = function(e) {
    this.dragStartOffset = null;
    return this.drawAllConnections(this.nodeId);
  };

  Node.connectDragStart_ = function(e) {
    var height, offset, width;
    offset = this.$el.offset();
    width = this.$el.width();
    height = this.$el.height();
    return this.connectStart = [offset.left + width / 2, offset.top + height / 2];
  };

  Node.connectDragMove_ = function(e) {
    if (this.connectStart != null) {
      this.drawConnections(this.nodeId);
      return this.connectionLayer.addLine(this.nodeId, this.connectStart, [e.pageX, e.pageY]);
    }
  };

  Node.connectDragEnd_ = function(e) {
    var $other;
    this.connectStart = null;
    $other = $(e.target).closest("p-node");
    if (($other.length > 0) && ($other[0] !== this)) {
      this.connectTo($other[0]);
      return this.drawConnections(this.nodeId);
    }
  };

  Node.drawConnections = function() {
    var other, _i, _len, _ref, _results;
    this.connectionLayer.clear(this.nodeId);
    _ref = this.connectedTo;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      other = _ref[_i];
      _results.push(this.connectionLayer.addLineEl(this.nodeId, this, other));
    }
    return _results;
  };

  Node.drawAllConnections = function() {
    var all, node, _i, _len, _results;
    all = document.querySelectorAll("p-node");
    _results = [];
    for (_i = 0, _len = all.length; _i < _len; _i++) {
      node = all[_i];
      _results.push(node.drawConnections());
    }
    return _results;
  };

  Node.connectTo = function(other) {
    return this.connectedTo = _.union(this.connectedTo, [other]);
  };

  document.register("p-node", {
    prototype: Node
  });

}).call(this);

},{}]},{},[1])
;
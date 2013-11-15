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
      newEvent.originalEvent = e;
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
    this.users[id] = group;
    return group;
  };

  ConnectionLayer.addLineEl = function(id, fromEl, toEl) {
    var fromMiddle, toMiddle;
    fromMiddle = this.getElMiddle(fromEl);
    toMiddle = this.getElMiddle(toEl);
    return this.addLine(id, fromMiddle, toMiddle);
  };

  ConnectionLayer.addTip = function(id, fromEl, toEl, fromMiddle, toMiddle) {
    var $fromEl, circle, from, fromHeight, fromOffset, fromWidth, group, intersections, lineTo, lines, nearest, to, valid;
    group = this.users[id];
    $fromEl = $(fromEl);
    fromOffset = $fromEl.offset();
    fromWidth = $fromEl.outerWidth();
    fromHeight = $fromEl.outerHeight();
    from = $V(fromMiddle);
    to = $V(toMiddle);
    lineTo = $L(from, to.subtract(from));
    lines = [$L($V([fromOffset.left, fromOffset.top]), $V([0, 1])), $L($V([fromOffset.left, fromOffset.top]), $V([1, 0])), $L($V([fromOffset.left + fromWidth, fromOffset.top]), $V([0, 1])), $L($V([fromOffset.left, fromOffset.top + fromHeight]), $V([1, 0]))];
    intersections = _.map(lines, function(line) {
      return line.intersectionWith(lineTo);
    });
    valid = _.filter(intersections, function(intersection) {
      var v;
      if (intersection == null) {
        return;
      }
      v = intersection.elements;
      if (v[0] < fromOffset.left || v[0] > fromOffset.left + fromWidth) {
        return false;
      }
      if (v[1] < fromOffset.top || v[1] > fromOffset.top + fromHeight) {
        return false;
      }
      return true;
    });
    nearest = _.min(valid, function(intersection) {
      intersection.elements.splice(2, 1);
      return intersection.distanceFrom(to);
    });
    circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", nearest.elements[0]);
    circle.setAttribute("cy", nearest.elements[1]);
    circle.setAttribute("r", 30);
    return group.appendChild(circle);
  };

  ConnectionLayer.addLine = function(id, from, to) {
    var group, idGroup, sub;
    idGroup = this.users[id];
    group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    idGroup.appendChild(group);
    group.classList.add("lineGroup");
    group.appendChild(this.makeLineSimple(from, to));
    from = $V(from);
    to = $V(to);
    sub = from.subtract(to);
    sub = sub.rotate(Math.PI / 2, $V([0, 0]));
    sub = sub.toUnitVector();
    sub = sub.multiply(12);
    group.appendChild(this.makeLineSimple(from.add(sub).elements, to.elements));
    return group.appendChild(this.makeLineSimple(from.subtract(sub).elements, to.elements));
  };

  ConnectionLayer.clear = function(id) {
    var group;
    group = this.users[id];
    return group.innerHTML = "";
  };

  ConnectionLayer.makeLineSimple = function(from, to) {
    var newLine;
    newLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    newLine.setAttribute("x1", from[0]);
    newLine.setAttribute("x2", to[0]);
    newLine.setAttribute("y1", from[1]);
    newLine.setAttribute("y2", to[1]);
    return newLine;
  };

  ConnectionLayer.getElMiddle = function(el) {
    var $el, height, offset, width;
    $el = $(el);
    offset = $el.offset();
    width = $el.outerWidth();
    height = $el.outerHeight();
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

  html = "<input class=\"node-text\"></input>\n<button class=\"node-connect left\"></button>\n<button class=\"node-connect top\"></button>\n<button class=\"node-connect right\"></button>\n<button class=\"node-connect bottom\"></button>";

  Node.insertedCallback = function() {
    this.$el = $(this);
    this.innerHTML = html;
    this.connectionLayer = document.querySelector("p-connection-layer");
    this.nodeId = this.getAttribute("node-id");
    this.layerGroup = this.connectionLayer.registerUser(this.nodeId);
    this.connectedTo = {
      left: null,
      top: null,
      right: null,
      bottom: null
    };
    return this.initListeners_();
  };

  Node.initListeners_ = function() {
    this.$el.on("p-dragstart", this.dragStart_.bind(this));
    this.$el.on("p-dragmove", this.dragMove_.bind(this));
    this.$el.on("p-dragend", this.dragEnd_.bind(this));
    this.$connect = this.$el.children(".node-connect");
    this.$connect.on("p-dragstart", this.connectDragStart_.bind(this));
    this.$connect.on("p-dragmove", this.connectDragMove_.bind(this));
    this.$connect.on("p-dragend", this.connectDragEnd_.bind(this));
    this.$layerGroup = $(this.layerGroup);
    this.$layerGroup.on("p-dragstart", this.layerGroupDragStart_.bind(this));
    this.$layerGroup.on("p-dragmove", this.layerGroupDragMove_.bind(this));
    return this.$layerGroup.on("p-dragend", this.layerGroupDragEnd_.bind(this));
  };

  /* ===========================================================================
  
    Node Dragging
  
  ===========================================================================
  */


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

  /* ===========================================================================
  
    Connecting
  
  ===========================================================================
  */


  Node.connectDragStart_ = function(e) {
    var $target, height, offset, width;
    $target = $(e.target);
    offset = $target.offset();
    width = $target.outerWidth();
    height = $target.outerHeight();
    this.connectStart = [offset.left + width / 2, offset.top + height / 2];
    return this.connectStartTarget = e.target;
  };

  Node.connectDragMove_ = function(e) {
    if (this.connectStart != null) {
      this.drawConnections(this.nodeId);
      return this.connectionLayer.addLine(this.nodeId, this.connectStart, [e.pageX, e.pageY]);
    }
  };

  Node.connectDragEnd_ = function(e) {
    var $other, type;
    $other = $(e.target).closest("p-node");
    if (($other.length > 0) && ($other[0] !== this)) {
      type = this.connectStartTarget.classList[1];
      this.connectTo($other[0], type);
      this.drawConnections(this.nodeId);
    }
    this.connectStart = null;
    return this.connectStartTarget = null;
  };

  /* ===========================================================================
  
    layerGroup
  
  ===========================================================================
  */


  Node.layerGroupDragStart_ = function(e) {
    return console.log(e);
  };

  Node.layerGroupDragEnd_ = function(e) {
    return console.log(e);
  };

  Node.layerGroupDragMove_ = function(e) {
    return console.log(e);
  };

  /* ===========================================================================
  
    Helpers
  
  ===========================================================================
  */


  Node.drawConnections = function() {
    var connectNib, other, type, _ref, _results;
    this.connectionLayer.clear(this.nodeId);
    _ref = this.connectedTo;
    _results = [];
    for (type in _ref) {
      other = _ref[type];
      if (other != null) {
        connectNib = this.querySelector("." + type);
        _results.push(this.connectionLayer.addLineEl(this.nodeId, this, other));
      } else {
        _results.push(void 0);
      }
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

  Node.connectTo = function(other, type) {
    return this.connectedTo[type] = other;
  };

  document.register("p-node", {
    prototype: Node
  });

}).call(this);

},{}]},{},[1])
;
;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
(function() {
  var Create, Drag, setup;

  require("./components/loadAll.coffee");

  Drag = require("./polyfill.coffee");

  Create = require("./create.coffee");

  setup = function() {
    var create, drag;
    drag = new Drag();
    return create = new Create();
  };

  $(setup);

}).call(this);

},{"./components/loadAll.coffee":2,"./polyfill.coffee":3,"./create.coffee":4}],3:[function(require,module,exports){
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
      var $parents, target;
      target = e.target;
      $parents = $(target).closest(".nodeGroup");
      if ($parents.length > 0) {
        target = $parents[0];
      }
      return this.draggedTarget = target;
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

},{}],4:[function(require,module,exports){
(function() {
  var Create, util,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  util = require("./util.coffee");

  Create = (function() {
    function Create() {
      this.addNewNode_ = __bind(this.addNewNode_, this);
      this.nodeContainer = document.querySelector(".node-container");
      this.initListeners_();
    }

    Create.prototype.initListeners_ = function() {
      var $doc;
      $doc = $(document);
      return $doc.on("dblclick", this.addNewNode_);
    };

    Create.prototype.addNewNode_ = function(e) {
      var $target, box, closestNode, node;
      $target = $(e.target);
      closestNode = $target.closest("p-node")[0];
      if (closestNode == null) {
        node = document.createElement("p-node");
        node.setAttribute("node-id", Math.floor(Math.random() * 1e20));
        this.nodeContainer.appendChild(node);
        box = util.getElOuterBox(node);
        return $(node).css({
          left: (e.pageX - box.width / 2) + "px",
          top: (e.pageY - box.height / 2) + "px"
        });
      }
    };

    return Create;

  })();

  module.exports = Create;

}).call(this);

},{"./util.coffee":5}],2:[function(require,module,exports){
(function() {
  require("./ConnectionLayer.coffee");

  require("./Node.coffee");

}).call(this);

},{"./ConnectionLayer.coffee":6,"./Node.coffee":7}],5:[function(require,module,exports){
(function() {
  var util;

  util = {};

  util.getElOuterBox = function(el) {
    var $el, box;
    $el = $(el);
    box = $el.offset();
    box.width = $el.outerWidth();
    box.height = $el.outerHeight();
    return box;
  };

  util.getElMiddle = function(el) {
    var box;
    box = util.getElOuterBox(el);
    return [box.left + box.width / 2, box.top + box.height / 2];
  };

  module.exports = util;

}).call(this);

},{}],6:[function(require,module,exports){
(function() {
  var ConnectionLayer, html, util;

  util = require("../util.coffee");

  ConnectionLayer = Object.create(HTMLElement.prototype);

  html = "<svg></svg>";

  ConnectionLayer.insertedCallback = function() {
    this.$el = $(this);
    this.innerHTML = html;
    this.svg = this.querySelector("svg");
    return this.users = {};
  };

  /* ===========================================================================
  
    Public
  
  ===========================================================================
  */


  ConnectionLayer.registerUser = function(id) {
    var group;
    group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.svg.appendChild(group);
    this.users[id] = group;
    group.classList.add("nodeGroup");
    return group;
  };

  ConnectionLayer.addLineEl = function(id, fromEl, toEl) {
    var fromMiddle, toMiddle;
    fromMiddle = util.getElMiddle(fromEl);
    toMiddle = util.getElMiddle(toEl);
    this.addLine(id, fromMiddle, toMiddle);
    this.addTip(id, fromEl, toEl);
    return this.addTip(id, toEl, fromEl);
  };

  ConnectionLayer.addNib = function(id, x, y, rad) {
    var circle, group;
    if (rad == null) {
      rad = 30;
    }
    group = this.users[id];
    circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", rad);
    circle.classList.add("nib");
    return group.appendChild(circle);
  };

  ConnectionLayer.addTip = function(id, fromEl, toEl) {
    var from, fromBox, fromMiddle, intersections, lineTo, lines, nearest, nib, to, toMiddle, valid;
    fromBox = util.getElOuterBox(fromEl);
    fromMiddle = util.getElMiddle(fromEl);
    toMiddle = util.getElMiddle(toEl);
    from = $V(fromMiddle);
    to = $V(toMiddle);
    lineTo = $L(from, to.subtract(from));
    lines = [$L($V([fromBox.left, fromBox.top]), $V([0, 1])), $L($V([fromBox.left, fromBox.top]), $V([1, 0])), $L($V([fromBox.left + fromBox.width, fromBox.top]), $V([0, 1])), $L($V([fromBox.left, fromBox.top + fromBox.height]), $V([1, 0]))];
    intersections = _.map(lines, function(line) {
      return line.intersectionWith(lineTo);
    });
    valid = _.filter(intersections, function(intersection) {
      var v;
      if (intersection == null) {
        return;
      }
      v = intersection.elements;
      if (v[0] < fromBox.left || v[0] > fromBox.left + fromBox.width) {
        return false;
      }
      if (v[1] < fromBox.top || v[1] > fromBox.top + fromBox.height) {
        return false;
      }
      return true;
    });
    nearest = _.min(valid, function(intersection) {
      intersection.elements.splice(2, 1);
      return intersection.distanceFrom(to);
    });
    nib = this.addNib(id, nearest.elements[0], nearest.elements[1]);
    return nib.info = {
      from: fromEl,
      to: toEl
    };
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
    return group != null ? group.innerHTML = "" : void 0;
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

  document.register("p-connection-layer", {
    prototype: ConnectionLayer
  });

}).call(this);

},{"../util.coffee":5}],7:[function(require,module,exports){
(function() {
  var Node, html, util;

  util = require("../util.coffee");

  Node = Object.create(HTMLElement.prototype);

  html = "<input class=\"node-text\"></input>";

  Node.insertedCallback = function() {
    this.$el = $(this);
    this.innerHTML = html;
    this.connectionLayer = document.querySelector("p-connection-layer");
    this.nodeId = this.getAttribute("node-id");
    this.layerGroup = this.connectionLayer.registerUser(this.nodeId);
    this.connectedTo = [];
    this.initListeners_();
    return this.drawConnections();
  };

  Node.initListeners_ = function() {
    this.$el.on("mousedown", this.mouseDown.bind(this));
    this.$el.on("p-dragstart", this.dragStart_.bind(this));
    this.$el.on("p-dragmove", this.dragMove_.bind(this));
    this.$el.on("p-dragend", this.dragEnd_.bind(this));
    this.$layerGroup = $(this.layerGroup);
    this.$layerGroup.on("p-dragstart", this.connectDragStart_.bind(this));
    this.$layerGroup.on("p-dragmove", this.connectDragMove_.bind(this));
    return this.$layerGroup.on("p-dragend", this.connectDragEnd_.bind(this));
  };

  /* ===========================================================================
  
    Selection
  
  ===========================================================================
  */


  Node.mouseDown = function(e) {
    return this.select();
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
    var $nib, height, nib, offset, width, _ref;
    nib = e.target;
    $nib = $(nib);
    if ($nib.is(".nib")) {
      offset = this.$el.offset();
      width = this.$el.outerWidth();
      height = this.$el.outerHeight();
      this.connectStartOffset = [offset.left + width / 2, offset.top + height / 2];
      if (((_ref = nib.info) != null ? _ref.to : void 0) != null) {
        this.disconnectFrom(nib.info.to);
        this.disconnectFrom(nib.info.from);
        return this.drawConnections(this.nodeId);
      }
    }
  };

  Node.connectDragMove_ = function(e) {
    if (this.connectStartOffset != null) {
      this.drawConnections(this.nodeId);
      this.connectionLayer.addLine(this.nodeId, this.connectStartOffset, [e.pageX, e.pageY]);
      return this.connectionLayer.addNib(this.nodeId, e.pageX, e.pageY);
    }
  };

  Node.connectDragEnd_ = function(e) {
    var other;
    this.connectStartOffset = null;
    other = $(e.target).closest("p-node")[0];
    if ((other != null) && other !== this) {
      this.connectTo(other);
    }
    return this.drawConnections(this.nodeId);
  };

  /* ===========================================================================
  
    Helpers
  
  ===========================================================================
  */


  Node.select = function() {
    var el, others, _i, _len;
    others = this.parentElement.querySelectorAll(".active");
    for (_i = 0, _len = others.length; _i < _len; _i++) {
      el = others[_i];
      el.classList.remove("active");
    }
    return this.classList.add("active");
  };

  Node.drawConnections = function() {
    var height, offset, other, width, _i, _len, _ref;
    this.connectionLayer.clear(this.nodeId);
    _ref = this.connectedTo;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      other = _ref[_i];
      this.connectionLayer.addLineEl(this.nodeId, this, other);
    }
    offset = this.$el.offset();
    width = this.$el.outerWidth();
    height = this.$el.outerHeight();
    return this.connectionLayer.addNib(this.nodeId, offset.left + width / 2, offset.top + height, 38);
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

  Node.disconnectFrom = function(other) {
    return this.connectedTo = _.without(this.connectedTo, other);
  };

  document.register("p-node", {
    prototype: Node
  });

}).call(this);

},{"../util.coffee":5}]},{},[1])
;
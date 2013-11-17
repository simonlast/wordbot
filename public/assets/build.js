;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
(function() {
  var setup;

  require("./db.coffee");

  require("./components/loadAll.coffee");

  setup = function() {
    require("./polyfill.coffee");
    require("./create.coffee");
    require("./Controller.coffee");
    return require("./persist.coffee");
  };

  window.addEventListener('WebComponentsReady', setup);

}).call(this);

},{"./db.coffee":2,"./components/loadAll.coffee":3,"./polyfill.coffee":4,"./create.coffee":5,"./Controller.coffee":6,"./persist.coffee":7}],2:[function(require,module,exports){
(function() {
  var db, socket;

  db = {};

  socket = io.connect(window.location.origin);

  db.get = function(id, callback) {
    var query;
    query = {
      id: id
    };
    return socket.emit("get", query, function(data) {
      return callback(data);
    });
  };

  db.set = function(id, data, callback) {
    var query;
    query = {
      id: id,
      data: data
    };
    return socket.emit("set", query, function(data) {
      return callback(data);
    });
  };

  module.exports = db;

}).call(this);

},{}],4:[function(require,module,exports){
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
      newEvent.originalEvent = e;
      return $(target).trigger(newEvent);
    };

    return Drag;

  })();

  module.exports = new Drag();

}).call(this);

},{}],5:[function(require,module,exports){
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
      return $doc.on("dblclick", ".graph", this.addNewNode_);
    };

    Create.prototype.addNewNode_ = function(e) {
      var $target, box, closestNode, node;
      $target = $(e.target);
      closestNode = $target.closest("p-node")[0];
      if (closestNode == null) {
        node = document.createElement("p-node");
        node.setAttribute("node-id", uuid());
        this.nodeContainer.appendChild(node);
        box = util.getElOuterBox(node);
        $(node).css({
          left: (e.pageX - box.width / 2) + "px",
          top: (e.pageY - box.height / 2) + "px"
        });
        return node.setup();
      }
    };

    return Create;

  })();

  module.exports = new Create();

}).call(this);

},{"./util.coffee":8}],6:[function(require,module,exports){
(function() {
  var Controller, util,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  util = require("./util.coffee");

  Controller = (function() {
    function Controller() {
      this.textEntered_ = __bind(this.textEntered_, this);
      this.textTyped_ = __bind(this.textTyped_, this);
      this.selectNode_ = __bind(this.selectNode_, this);
      this.nodeContainer = document.querySelector(".node-container");
      this.conversation = document.querySelector("p-conversation");
      this.initListeners_();
    }

    Controller.prototype.initListeners_ = function() {
      $(this.conversation).on("enter", this.textEntered_);
      $(this.conversation).on("input", this.textTyped_);
      $(document).on("mousedown", "p-node", this.selectNode_);
      return $(document).on("input", "p-node", this.selectNode_);
    };

    Controller.prototype.selectNode_ = function(e) {
      this.conversation.clear();
      return this.setActiveNode_(e.currentTarget);
    };

    Controller.prototype.textTyped_ = function(e) {
      var activeNode, consumedNodes, tokens, value;
      value = this.conversation.getValue();
      tokens = this.getTokens_(value);
      activeNode = this.getActiveNode_();
      consumedNodes = this.getConsumedNodes_([activeNode], tokens);
      console.log(consumedNodes);
      return this.setPotentialNodes_(consumedNodes);
    };

    Controller.prototype.textEntered_ = function(e) {
      var activeNode, consumedNodes, node, tokens, value, _i, _len, _results;
      value = this.conversation.getValue();
      tokens = this.getTokens_(value);
      activeNode = this.getActiveNode_();
      consumedNodes = this.getConsumedNodes_([activeNode], tokens);
      if (consumedNodes.length > 0) {
        this.setActiveNode_(consumedNodes[consumedNodes.length - 1]);
        this.setPotentialNodes_([]);
        _results = [];
        for (_i = 0, _len = consumedNodes.length; _i < _len; _i++) {
          node = consumedNodes[_i];
          if (node.classList.contains("output")) {
            _results.push(this.conversation.addOutput(node.getValue()));
          } else {
            _results.push(this.conversation.addInput(node.getValue()));
          }
        }
        return _results;
      }
    };

    Controller.prototype.getConsumedNodes_ = function(nodes, tokens) {
      var bestInputData, consumeData, consumed, consumedNodes, inputs, lastNode, outputs, rest,
        _this = this;
      lastNode = nodes[nodes.length - 1];
      outputs = this.getConnectedOutputs_(lastNode);
      if (outputs.length > 0) {
        nodes = _.clone(nodes);
        nodes.push(outputs[0]);
        consumedNodes = this.getConsumedNodes_(nodes, tokens);
        return consumedNodes;
      }
      if (tokens.length === 0) {
        return nodes;
      }
      inputs = this.getConnectedInputs_(lastNode);
      consumeData = _.map(inputs, function(input) {
        var inputText, inputTokens, isConsumed, numEqual;
        inputText = input.getValue();
        inputTokens = _this.getTokens_(inputText);
        numEqual = _this.numEqual_(tokens, inputTokens);
        isConsumed = numEqual >= inputTokens.length;
        return {
          input: input,
          numEqual: numEqual,
          isConsumed: isConsumed
        };
      });
      bestInputData = _.max(consumeData, function(data) {
        return data.numEqual;
      });
      consumed = _.first(tokens, bestInputData.numEqual);
      rest = _.rest(tokens, bestInputData.numEqual);
      if (bestInputData.isConsumed) {
        nodes = _.clone(nodes);
        nodes.push(bestInputData.input);
        consumedNodes = this.getConsumedNodes_(nodes, rest);
        return consumedNodes;
      }
      return nodes;
    };

    Controller.prototype.numEqual_ = function(tokens1, tokens2) {
      var index, larger, largerToken, num, ordered, smaller, smallerToken, _i, _len;
      ordered = _.sortBy([tokens1, tokens2], function(tokens) {
        return tokens.length;
      });
      smaller = ordered[0];
      larger = ordered[1];
      num = 0;
      for (index = _i = 0, _len = larger.length; _i < _len; index = ++_i) {
        largerToken = larger[index];
        smallerToken = smaller[index];
        if (largerToken === smallerToken) {
          num++;
        } else {
          return num;
        }
      }
      return num;
    };

    Controller.prototype.getTokens_ = function(text) {
      text = text.toLowerCase();
      return text.split(" ");
    };

    Controller.prototype.getConnectedOutputs_ = function(node) {
      var connectedTo, outputs;
      connectedTo = node.connectedTo;
      outputs = _.filter(connectedTo, function(el) {
        return el.classList.contains("output");
      });
      return outputs;
    };

    Controller.prototype.getConnectedInputs_ = function(node) {
      var connectedTo, inputs;
      connectedTo = node.connectedTo;
      inputs = _.filter(connectedTo, function(el) {
        return !el.classList.contains("output");
      });
      return inputs;
    };

    Controller.prototype.getActiveNode_ = function() {
      return this.nodeContainer.querySelector(".active");
    };

    Controller.prototype.setPotentialNodes_ = function(nodes) {
      var node, potentialActive, _i, _j, _len, _len1, _results;
      potentialActive = this.nodeContainer.querySelectorAll(".potentialActive");
      for (_i = 0, _len = potentialActive.length; _i < _len; _i++) {
        node = potentialActive[_i];
        node.deselectPotentialNode();
      }
      _results = [];
      for (_j = 0, _len1 = nodes.length; _j < _len1; _j++) {
        node = nodes[_j];
        _results.push(node.selectPotentialNode());
      }
      return _results;
    };

    Controller.prototype.setActiveNode_ = function(node) {
      var active, el, outputs, _i, _len;
      active = this.nodeContainer.querySelectorAll(".active");
      for (_i = 0, _len = active.length; _i < _len; _i++) {
        el = active[_i];
        el.deselectNode();
      }
      node.selectNode();
      if (node.classList.contains("output")) {
        this.conversation.addOutput(node.getValue());
      }
      outputs = this.getConnectedOutputs_(node);
      if (outputs.length > 0) {
        return this.setActiveNode_(outputs[0]);
      }
    };

    return Controller;

  })();

  module.exports = new Controller();

}).call(this);

},{"./util.coffee":8}],7:[function(require,module,exports){
(function() {
  var Controller, Persist, db, observerOpts, persistWait, urlRegex,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Controller = require("./Controller.coffee");

  db = require("./db.coffee");

  observerOpts = {
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true
  };

  persistWait = 250;

  urlRegex = /\/(.*)/;

  Persist = (function() {
    function Persist() {
      this.persistAll_ = __bind(this.persistAll_, this);
      this.persistAllNext_ = __bind(this.persistAllNext_, this);
      this.graph = document.querySelector(".graph");
      this.nodeContainer = document.querySelector(".node-container");
      this.lastData = null;
      this.dataRendered = false;
      this.initListeners_();
      this.loadData_();
    }

    /* ===========================================================================
    
      Persisting data
    
    ===========================================================================
    */


    Persist.prototype.initListeners_ = function() {
      var callback, observer;
      callback = _.throttle(this.persistAll_, persistWait);
      observer = new MutationObserver(callback);
      observer.observe(this.graph, observerOpts);
      return $(document).on("input", ".node-text", callback);
    };

    Persist.prototype.persistAllNext_ = function(e) {
      return setTimeout(this.persistAll_, 0);
    };

    Persist.prototype.getPersisUrl_ = function() {
      var matches;
      matches = urlRegex.exec(window.location.pathname);
      return matches[1];
    };

    Persist.prototype.persistAll_ = function(e) {
      var data, url;
      if (!this.dataRendered) {
        return;
      }
      data = this.serializeAll_();
      if (!_.isEqual(data, this.lastData)) {
        this.lastData = data;
        url = this.getPersisUrl_();
        if (url != null) {
          return db.set(url, data, function(data) {
            if (data.err != null) {
              return console.log("save error: ", data.err);
            }
          });
        }
      }
    };

    Persist.prototype.serializeAll_ = function() {
      var all, nodes;
      nodes = $(this.nodeContainer).children();
      all = _.map(nodes, function(node) {
        return node.serialize();
      });
      return all;
    };

    /* ===========================================================================
    
      Loading data
    
    ===========================================================================
    */


    Persist.prototype.loadData_ = function() {
      var data;
      data = window.bootstrapData;
      if (data != null) {
        return this.renderData_(data);
      } else {
        return this.dataRendered = true;
      }
    };

    Persist.prototype.renderData_ = function(nodes) {
      var activeNode, id, node, nodeData, other, _i, _j, _k, _len, _len1, _len2, _ref;
      this.dataRendered = true;
      if ((nodes == null) || (nodes.length === 0)) {
        return;
      }
      for (_i = 0, _len = nodes.length; _i < _len; _i++) {
        nodeData = nodes[_i];
        node = document.createElement("p-node");
        node.setAttribute("node-id", nodeData.id);
        if (nodeData.type === "output") {
          node.classList.add("output");
        }
        if (nodeData.active) {
          node.classList.add("active");
        }
        this.nodeContainer.appendChild(node);
        $(node).css({
          left: nodeData.position.left + "px",
          top: nodeData.position.top + "px"
        });
        node.setup();
      }
      for (_j = 0, _len1 = nodes.length; _j < _len1; _j++) {
        nodeData = nodes[_j];
        node = this.findNode_(nodeData.id);
        node.setValue(nodeData.text);
        _ref = nodeData.connectedTo;
        for (_k = 0, _len2 = _ref.length; _k < _len2; _k++) {
          id = _ref[_k];
          other = this.findNode_(id);
          if (other != null) {
            node.connectTo(other);
          }
        }
      }
      this.nodeContainer.querySelector("p-node").drawAllConnections();
      activeNode = this.nodeContainer.querySelector(".active");
      if (activeNode != null) {
        return Controller.setActiveNode_(activeNode);
      }
    };

    Persist.prototype.findNode_ = function(id) {
      return this.nodeContainer.querySelector("[node-id='" + id + "']");
    };

    return Persist;

  })();

  module.exports = new Persist();

}).call(this);

},{"./Controller.coffee":6,"./db.coffee":2}],3:[function(require,module,exports){
(function() {
  require("./ConnectionLayer.coffee");

  require("./Node.coffee");

  require("./Conversation.coffee");

}).call(this);

},{"./ConnectionLayer.coffee":9,"./Node.coffee":10,"./Conversation.coffee":11}],8:[function(require,module,exports){
(function() {
  var util;

  util = {};

  util.setCursor = function(type) {
    if (type != null) {
      return document.body.setAttribute("data-cursor", type);
    } else {
      return document.body.removeAttribute("data-cursor");
    }
  };

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

  window.getElMiddle = util.getElMiddle;

  module.exports = util;

}).call(this);

},{}],9:[function(require,module,exports){
(function() {
  var ConnectionLayer, html, util;

  util = require("../util.coffee");

  ConnectionLayer = Object.create(HTMLElement.prototype);

  html = "<svg></svg>";

  ConnectionLayer.readyCallback = function() {
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
    var fromMiddle, lineGroup, toMiddle;
    fromMiddle = util.getElMiddle(fromEl);
    toMiddle = util.getElMiddle(toEl);
    lineGroup = this.addLine(id, fromMiddle, toMiddle);
    return lineGroup.info = {
      from: fromEl,
      to: toEl
    };
  };

  ConnectionLayer.addNib = function(id, x, y, rad) {
    var circle, group;
    if (rad == null) {
      rad = 20;
    }
    group = this.users[id];
    circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", rad);
    circle.classList.add("nib");
    circle.classList.add("canDragstart");
    return group.appendChild(circle);
  };

  ConnectionLayer.addLine = function(id, from, to) {
    var idGroup, lineGroup, sub;
    idGroup = this.users[id];
    lineGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    idGroup.appendChild(lineGroup);
    lineGroup.classList.add("lineGroup");
    lineGroup.classList.add("canDragstart");
    lineGroup.appendChild(this.makeLineSimple(from, to));
    from = $V(from);
    to = $V(to);
    sub = from.subtract(to);
    sub = sub.rotate(Math.PI / 2, $V([0, 0]));
    sub = sub.toUnitVector();
    sub = sub.multiply(12);
    lineGroup.appendChild(this.makeLineSimple(from.add(sub).elements, to.elements));
    lineGroup.appendChild(this.makeLineSimple(from.subtract(sub).elements, to.elements));
    return lineGroup;
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

},{"../util.coffee":8}],10:[function(require,module,exports){
(function() {
  var Node, html, util;

  util = require("../util.coffee");

  Node = Object.create(HTMLElement.prototype);

  html = "<input class=\"node-text\" placeholder=\"Type something\">\n<button class=\"swap-type\">↺</button>\n<button class=\"remove\">×</button>";

  /* ===========================================================================
  
    Setup
  
  ===========================================================================
  */


  Node.setup = function() {
    this.$el = $(this);
    this.innerHTML = html;
    this.querySelector(".node-text").select();
    this.connectionLayer = document.querySelector("p-connection-layer");
    this.nodeId = this.getAttribute("node-id");
    this.layerGroup = this.connectionLayer.registerUser(this.nodeId);
    this.connectedTo = [];
    this.initListeners_();
    return this.drawConnections();
  };

  Node.initListeners_ = function() {
    this.$el.on("mousedown", this.mouseDown_.bind(this));
    this.$el.on("click", ".swap-type", this.swapType_.bind(this));
    this.$el.on("click", ".remove", this.removeNode.bind(this));
    this.$el.on("p-dragstart", this.dragStart_.bind(this));
    this.$el.on("p-dragmove", this.dragMove_.bind(this));
    this.$el.on("p-dragend", this.dragEnd_.bind(this));
    this.$layerGroup = $(this.layerGroup);
    this.$layerGroup.on("p-dragstart", this.connectDragStart_.bind(this));
    this.$layerGroup.on("p-dragmove", this.connectDragMove_.bind(this));
    return this.$layerGroup.on("p-dragend", this.connectDragEnd_.bind(this));
  };

  /* ===========================================================================
  
    Public
  
  ===========================================================================
  */


  Node.getValue = function() {
    return this.querySelector(".node-text").value;
  };

  Node.setValue = function(value) {
    return this.querySelector(".node-text").value = value;
  };

  Node.swapType_ = function(e) {
    return this.classList.toggle("output");
  };

  Node.serialize = function() {
    var box, connectedToIds, type;
    connectedToIds = _.map(this.connectedTo, function(node) {
      return node.getAttribute("node-id");
    });
    type = "input";
    if (this.classList.contains("output")) {
      type = "output";
    }
    box = util.getElOuterBox(this);
    return {
      id: this.getAttribute("node-id"),
      type: type,
      connectedTo: connectedToIds,
      text: this.getValue(),
      position: {
        left: box.left,
        top: box.top
      },
      active: this.classList.contains("active")
    };
  };

  Node.selectNode = function() {
    return this.classList.add("active");
  };

  Node.deselectNode = function() {
    return this.classList.remove("active");
  };

  Node.selectPotentialNode = function() {
    return this.classList.add("potentialActive");
  };

  Node.deselectPotentialNode = function() {
    return this.classList.remove("potentialActive");
  };

  Node.drawConnections = function() {
    var elBox, other, _i, _len, _ref;
    this.connectionLayer.clear(this.nodeId);
    _ref = this.connectedTo;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      other = _ref[_i];
      this.connectionLayer.addLineEl(this.nodeId, this, other);
    }
    elBox = util.getElOuterBox(this);
    return this.connectionLayer.addNib(this.nodeId, elBox.left + elBox.width / 2, elBox.top + elBox.height, 25);
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

  Node.removeNode = function() {
    var all, node, _i, _len;
    all = document.querySelectorAll("p-node");
    for (_i = 0, _len = all.length; _i < _len; _i++) {
      node = all[_i];
      node.disconnectFrom(this);
    }
    $(this).remove();
    this.connectionLayer.clear(this.nodeId);
    return this.drawAllConnections();
  };

  /* ===========================================================================
  
    Prevent Default
  
  ===========================================================================
  */


  Node.mouseDown_ = function(e) {
    if (e.target === e.currentTarget) {
      e.preventDefault();
      return this.$el.css({
        scale: 1
      });
    }
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
    this.drawAllConnections(this.nodeId);
    return this.$el.css({
      transform: ""
    });
  };

  /* ===========================================================================
  
    Connecting
  
  ===========================================================================
  */


  Node.connectDragStart_ = function(e) {
    var $dragTarget, dragTarget, height, offset, width, _ref;
    $dragTarget = $(e.target);
    $dragTarget = $dragTarget.closest(".canDragstart");
    dragTarget = $dragTarget[0];
    if ($dragTarget.length > 0) {
      offset = this.$el.offset();
      width = this.$el.outerWidth();
      height = this.$el.outerHeight();
      this.connectStartOffset = [offset.left + width / 2, offset.top + height / 2];
      if (((_ref = dragTarget.info) != null ? _ref.to : void 0) != null) {
        this.disconnectFrom(dragTarget.info.to);
        this.disconnectFrom(dragTarget.info.from);
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

  document.register("p-node", {
    prototype: Node
  });

}).call(this);

},{"../util.coffee":8}],11:[function(require,module,exports){
(function() {
  var Conversation, html, util;

  util = require("../util.coffee");

  Conversation = Object.create(HTMLElement.prototype);

  html = "<div class=\"log\"></div>\n<input type=\"text\" class=\"conversation-input\" placeholder=\"Type to talk\">";

  Conversation.readyCallback = function() {
    this.$el = $(this);
    this.innerHTML = html;
    return this.initListeners_();
  };

  Conversation.getValue = function() {
    return this.querySelector(".conversation-input").value;
  };

  Conversation.clear = function() {
    var log;
    log = this.querySelector(".log");
    return log.innerHTML = "";
  };

  Conversation.addInput = function(text) {
    var input;
    input = this.querySelector(".conversation-input");
    this.addMessage(text, "input");
    return input.value = "";
  };

  Conversation.addOutput = function(text) {
    return this.addMessage(text, "output");
  };

  Conversation.addMessage = function(text, type) {
    var $log, log, p;
    log = this.querySelector(".log");
    p = document.createElement("p");
    p.classList.add(type);
    p.innerText = text;
    log.appendChild(p);
    $log = $(log);
    return $log.scrollTop(log.scrollHeight);
  };

  Conversation.initListeners_ = function() {
    var input;
    input = this.querySelector(".conversation-input");
    $(input).on("input", this.inputTyped_.bind(this));
    return $(input).on("keydown", this.inputTyped_.bind(this));
  };

  Conversation.inputTyped_ = function(e) {
    if (e.keyCode === 13) {
      return $(this).trigger("enter");
    }
  };

  document.register("p-conversation", {
    prototype: Conversation
  });

}).call(this);

},{"../util.coffee":8}]},{},[1])
;
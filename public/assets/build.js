;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
(function() {
  var setup;

  require("./components/loadAll.coffee");

  setup = function() {
    return $("body").append("<p-grid></pgrid>");
  };

  setup();

}).call(this);

},{"./components/loadAll.coffee":2}],2:[function(require,module,exports){
(function() {
  require("./brick.coffee");

  require("./grid.coffee");

  require("./cell.coffee");

}).call(this);

},{"./brick.coffee":3,"./grid.coffee":4,"./cell.coffee":5}],3:[function(require,module,exports){
(function() {
  var Brick;

  Brick = Object.create(HTMLElement.prototype);

  Brick.insertedCallback = function() {
    this.$el = $(this);
    return this.initListeners();
  };

  Brick.initListeners = function() {
    this.$el.on("p-dragstart", this.onDragstart.bind(this));
    this.$el.on("p-dragmove", this.onDragmove.bind(this));
    return this.$el.on("p-dragend", this.onDragend.bind(this));
  };

  Brick.onDragstart = function(e) {
    this.startOffset = [e.pageX, e.pageY];
    return this.startPos = this.$el.offset();
  };

  Brick.onDragmove = function(e) {
    var diff;
    diff = [e.pageX - this.startOffset[0], e.pageY - this.startOffset[1]];
    return this.$el.css({
      left: (this.startPos.left + diff[0]) + "px",
      top: (this.startPos.top + diff[1]) + "px"
    });
  };

  Brick.onDragend = function(e) {};

  document.register("p-brick", {
    prototype: Brick
  });

}).call(this);

},{}],4:[function(require,module,exports){
(function() {
  var Grid, cellDimen, colHtml, msecs;

  Grid = Object.create(HTMLElement.prototype);

  cellDimen = 80;

  msecs = 800;

  colHtml = "\"\n<div class=\"grid-col\"></div>";

  Grid.readyCallback = function() {
    this.$el = $(this);
    this.currCol = 0;
    this.computSizes();
    this.initEls();
    return this.startTimer();
  };

  Grid.computSizes = function() {
    var $doc, height, width;
    $doc = $(document);
    width = $doc.width();
    height = $doc.height();
    this.numCellsX = Math.floor(width / cellDimen);
    return this.numCellsY = Math.floor(height / cellDimen);
  };

  Grid.initEls = function() {
    var $col, cell, x, y, _i, _j, _ref, _ref1, _results;
    _results = [];
    for (x = _i = 1, _ref = this.numCellsX; 1 <= _ref ? _i <= _ref : _i >= _ref; x = 1 <= _ref ? ++_i : --_i) {
      $col = $(colHtml);
      for (y = _j = 1, _ref1 = this.numCellsY; 1 <= _ref1 ? _j <= _ref1 : _j >= _ref1; y = 1 <= _ref1 ? ++_j : --_j) {
        cell = document.createElement("p-cell");
        $col.append(cell);
      }
      _results.push(this.$el.append($col));
    }
    return _results;
  };

  Grid.startTimer = function() {
    return this.interval = setInterval(this.nextCol.bind(this), msecs);
  };

  Grid.nextCol = function() {
    return console.log("nextCol");
  };

  document.register("p-grid", {
    prototype: Grid
  });

}).call(this);

},{}],5:[function(require,module,exports){
(function() {
  var Cell;

  Cell = Object.create(HTMLElement.prototype);

  Cell.readyCallback = function() {
    this.$el = $(this);
    this.active = false;
    return this.initListeners();
  };

  Cell.initListeners = function() {
    return this.$el.on("mousedown", this.toggleActive.bind(this));
  };

  Cell.toggleActive = function() {
    this.active = !this.active;
    return this.$el.toggleClass("active");
  };

  document.register("p-cell", {
    prototype: Cell
  });

}).call(this);

},{}]},{},[1])
;
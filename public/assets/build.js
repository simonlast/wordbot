;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
(function() {
  var Drag, setup, sound;

  require("./components/loadAll.coffee");

  Drag = require("./polyfill.coffee");

  sound = require("./sound.coffee");

  setup = function() {
    var drag;
    sound.load();
    drag = new Drag();
    return $("body").append("<p-grid></pgrid>");
  };

  window.onload = setup;

}).call(this);

},{"./components/loadAll.coffee":2,"./polyfill.coffee":3,"./sound.coffee":4}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
(function() {
  var sound;

  sound = {};

  sound.load = function() {
    sound.ready = false;
    return MIDI.loadPlugin({
      soundfontUrl: "/midi/soundfont/",
      instrument: "acoustic_grand_piano",
      callback: function() {
        sound.ready = true;
        return MIDI.setVolume(0, 127);
      }
    });
  };

  sound.play = function(note) {
    var delay, velocity;
    delay = 0;
    velocity = 127;
    MIDI.noteOn(0, note, velocity, delay);
    return MIDI.noteOff(0, note, delay + 0.75);
  };

  module.exports = sound;

}).call(this);

},{}],2:[function(require,module,exports){
(function() {
  require("./brick.coffee");

  require("./grid.coffee");

  require("./cell.coffee");

}).call(this);

},{"./brick.coffee":5,"./grid.coffee":6,"./cell.coffee":7}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
(function() {
  var Grid, cellDimen, colHtml, msecs, notes;

  notes = require("../notes.coffee");

  Grid = Object.create(HTMLElement.prototype);

  cellDimen = 80;

  msecs = 500;

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
    var $col, cell, x, y, _i, _j, _ref, _ref1;
    for (x = _i = 1, _ref = this.numCellsX; 1 <= _ref ? _i <= _ref : _i >= _ref; x = 1 <= _ref ? ++_i : --_i) {
      $col = $(colHtml);
      for (y = _j = 1, _ref1 = this.numCellsY; 1 <= _ref1 ? _j <= _ref1 : _j >= _ref1; y = 1 <= _ref1 ? ++_j : --_j) {
        cell = document.createElement("p-cell");
        $col.append(cell);
      }
      this.$el.append($col);
    }
    return this.$cols = this.$el.children();
  };

  Grid.startTimer = function() {
    return this.interval = setInterval(this.nextCol.bind(this), msecs);
  };

  Grid.nextCol = function() {
    var $newCol, $oldCol;
    $oldCol = this.$cols.eq(this.currCol);
    this.currCol++;
    if (this.currCol >= this.$cols.length) {
      this.currCol = 0;
    }
    $newCol = this.$cols.eq(this.currCol);
    $oldCol.css({
      opacity: .7
    });
    $newCol.css({
      opacity: 1
    });
    return this.playCol($newCol);
  };

  Grid.playCol = function($col) {
    var $cells, el, i, index, len, note, _i, _len, _results;
    $cells = $col.children();
    len = $cells.length;
    _results = [];
    for (i = _i = 0, _len = $cells.length; _i < _len; i = ++_i) {
      el = $cells[i];
      index = len - i;
      note = notes[index + Math.floor(notes.length / 2)];
      _results.push(el.play(note));
    }
    return _results;
  };

  document.register("p-grid", {
    prototype: Grid
  });

}).call(this);

},{"../notes.coffee":8}],7:[function(require,module,exports){
(function() {
  var Cell, sound;

  sound = require("../sound.coffee");

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

  Cell.play = function(offset) {
    if (this.active) {
      return sound.play(offset);
    }
  };

  document.register("p-cell", {
    prototype: Cell
  });

}).call(this);

},{"../sound.coffee":4}],8:[function(require,module,exports){
(function() {
  module.exports = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76, 78, 80, 82, 84, 86, 88, 90, 92, 94, 96, 98, 100, 102, 104, 106, 108, 110, 112, 114, 116, 118, 120, 122, 124, 126];

}).call(this);

},{}]},{},[1])
;
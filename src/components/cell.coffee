sound = require("../sound.coffee")

Cell = Object.create(HTMLElement.prototype)

Cell.readyCallback = ->
  @$el = $(this)
  @active = false
  @initListeners()

Cell.initListeners = ->
  @$el.on("mousedown", @toggleActive.bind(this))

Cell.toggleActive = ->
  @active = !@active
  @$el.toggleClass("active")

Cell.play = (offset) ->
  if @active
    sound.play(offset)


document.register("p-cell", {
  prototype: Cell
})
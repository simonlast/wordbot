sound = require("../sound.coffee")

Cell = Object.create(HTMLElement.prototype)

Cell.readyCallback = ->
  @$el = $(this)
  @active = false
  @initListeners()

Cell.initListeners = ->
  @$el.on("click", @toggleActive.bind(this))
  @$el.on("p-dragstart", @startDrag.bind(this))
  @$el.on("p-dragmove", @drag.bind(this))
  @$el.on("p-dragend", @endDrag.bind(this))

Cell.startDrag = (e) ->
  @$ghost = @$el.clone()
  @$ghost.css({
    position: "absolute"
  })
  $('body').append(@$ghost)

Cell.drag = (e) ->
  @$ghost.css({
    top: e.pageY + "px"
    left: e.pageX + "px"
  })
  console.log "drag"

Cell.endDrag = (e) ->
  console.log "endDrag"

Cell.toggleActive = ->
  @active = !@active
  @$el.toggleClass("active")

Cell.play = (offset) ->
  if @active
    sound.play(offset)


document.register("p-cell", {
  prototype: Cell
})
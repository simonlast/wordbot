Brick = Object.create(HTMLElement.prototype)

Brick.insertedCallback = ->
  @$el = $(this)
  @initListeners()

Brick.initListeners = ->
  @$el.on("p-dragstart", @onDragstart.bind(this))
  @$el.on("p-dragmove", @onDragmove.bind(this))
  @$el.on("p-dragend", @onDragend.bind(this))

Brick.onDragstart = (e) ->
  @startOffset = [e.pageX, e.pageY]
  @startPos = @$el.offset()

Brick.onDragmove = (e) ->
  diff = [e.pageX - @startOffset[0],
    e.pageY - @startOffset[1]]
  @$el.css({
    left: (@startPos.left + diff[0]) + "px"
    top: (@startPos.top + diff[1]) + "px"
  })

Brick.onDragend = (e) ->

document.register("p-brick", {
  prototype: Brick
})
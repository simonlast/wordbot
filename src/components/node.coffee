Node = Object.create(HTMLElement.prototype)

html = """
  <input class="node-text"></input>
  <button class="node-connect"></button>
"""

Node.insertedCallback = ->
  @$el = $(this)
  @innerHTML = html
  @initListeners_()

Node.initListeners_ = ->
  @$el.on("p-dragstart", @dragStart_.bind(this))
  @$el.on("p-dragmove", @dragMove_.bind(this))
  @$el.on("p-dragend", @dragEnd_.bind(this))

  @$connect = @$el.children(".node-connect")
  @$connect.on("p-dragstart", @connectDragStart_.bind(this))
  @$connect.on("p-dragmove", @connectDragMove_.bind(this))
  @$connect.on("p-dragend", @connectDragEnd_.bind(this))


# Node dragging

Node.dragStart_ = (e) ->
  if e.target is this
    offset = @$el.offset()
    @startOffset = [e.pageX - offset.left, e.pageY - offset.top]

Node.dragMove_ = (e) ->
  if @startOffset?
    @$el.css({
      left: (e.pageX - @startOffset[0]) + "px"
      top: (e.pageY - @startOffset[1]) + "px"
    })

Node.dragEnd_ = (e) ->
  @startOffset = null


# Connecting

Node.connectDragStart_ = (e) ->
  console.log e

Node.connectDragMove_ = (e) ->
    console.log e

Node.connectDragEnd_ = (e) ->
    console.log e



document.register("p-node", {
  prototype: Node
})
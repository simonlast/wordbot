util = require("../util.coffee")

Node = Object.create(HTMLElement.prototype)

html = """
  <input class="node-text"></input>
  <button class="node-connect"></button>
"""

Node.insertedCallback = ->
  @$el = $(this)
  @innerHTML = html

  @connectionLayer = document.querySelector("p-connection-layer")
  @nodeId = @getAttribute("node-id")
  @layerGroup = @connectionLayer.registerUser(@nodeId)

  @connectedTo = []
  @initListeners_()
  @drawConnections()


Node.initListeners_ = ->
  @$el.on("p-dragstart", @dragStart_.bind(this))
  @$el.on("p-dragmove", @dragMove_.bind(this))
  @$el.on("p-dragend", @dragEnd_.bind(this))

  @$layerGroup = $(@layerGroup)
  @$layerGroup.on("p-dragstart", @connectDragStart_.bind(this))
  @$layerGroup.on("p-dragmove", @connectDragMove_.bind(this))
  @$layerGroup.on("p-dragend", @connectDragEnd_.bind(this))


### ===========================================================================

  Node Dragging

=========================================================================== ###


Node.dragStart_ = (e) ->
  if e.target is this
    @parentElement.appendChild(this)
    offset = @$el.offset()
    @dragStartOffset = [e.pageX - offset.left, e.pageY - offset.top]


Node.dragMove_ = (e) ->
  if @dragStartOffset?
    @$el.css({
      left: (e.pageX - @dragStartOffset[0]) + "px"
      top: (e.pageY - @dragStartOffset[1]) + "px"
    })
    @drawAllConnections(@nodeId)


Node.dragEnd_ = (e) ->
  @dragStartOffset = null
  @drawAllConnections(@nodeId)



### ===========================================================================

  Connecting

=========================================================================== ###


Node.connectDragStart_ = (e) ->
  nib = e.target
  $nib = $(nib)

  if $nib.is(".nib")
    console.log nib.info
    offset = @$el.offset()
    width = @$el.outerWidth()
    height = @$el.outerHeight()
    @connectStartOffset = [offset.left + width/2, offset.top + height/2]

    if nib.info?.to?
      # Could be either from or to
      @disconnectFrom(nib.info.to)
      @disconnectFrom(nib.info.from)
      @drawConnections(@nodeId)



Node.connectDragMove_ = (e) ->
  if @connectStartOffset?
    @drawConnections(@nodeId)
    @connectionLayer.addLine(@nodeId, @connectStartOffset, [e.pageX, e.pageY])



Node.connectDragEnd_ = (e) ->
  @connectStartOffset = null

  $other = $(e.target).closest("p-node")
  if ($other.length > 0) and ($other[0] isnt this)
    @connectTo($other[0])

  @drawConnections(@nodeId)



### ===========================================================================

  Helpers

=========================================================================== ###


Node.drawConnections = ->
  @connectionLayer.clear(@nodeId)
  for other in @connectedTo
    @connectionLayer.addLineEl(@nodeId, this, other)

  offset = @$el.offset()
  width = @$el.outerWidth()
  height = @$el.outerHeight()
  @connectionLayer.addNib(@nodeId, offset.left + width/2, offset.top + height)


Node.drawAllConnections = ->
  all = document.querySelectorAll("p-node")
  for node in all
    node.drawConnections()


Node.connectTo = (other) ->
  @connectedTo = _.union(@connectedTo, [other])


Node.disconnectFrom = (other) ->
  console.log "disconnect: ", other
  console.log @connectedTo
  @connectedTo = _.without(@connectedTo, other)
  console.log @connectedTo


document.register("p-node", {
  prototype: Node
})
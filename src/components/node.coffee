util = require("../util.coffee")

Node = Object.create(HTMLElement.prototype)

html = """
  <input class="node-text"></input>
  <button class="swap-type">↺</button>
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
  @$el.on("click", ".swap-type", @swapType_.bind(this))

  @$el.on("p-dragstart", @dragStart_.bind(this))
  @$el.on("p-dragmove", @dragMove_.bind(this))
  @$el.on("p-dragend", @dragEnd_.bind(this))

  @$layerGroup = $(@layerGroup)
  @$layerGroup.on("p-dragstart", @connectDragStart_.bind(this))
  @$layerGroup.on("p-dragmove", @connectDragMove_.bind(this))
  @$layerGroup.on("p-dragend", @connectDragEnd_.bind(this))


Node.getValue = ->
  @querySelector(".node-text").value



Node.swapType_ = (e) ->
  @classList.toggle("output")



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
    @connectionLayer.addNib(@nodeId, e.pageX, e.pageY)



Node.connectDragEnd_ = (e) ->
  @connectStartOffset = null

  other = $(e.target).closest("p-node")[0]
  if (other? and other isnt this)
    @connectTo(other)

  @drawConnections(@nodeId)



### ===========================================================================

  Helpers

=========================================================================== ###

Node.select = ->
  @classList.add("active")


Node.deselect = ->
  @classList.remove("active")


Node.drawConnections = ->
  @connectionLayer.clear(@nodeId)
  for other in @connectedTo
    @connectionLayer.addLineEl(@nodeId, this, other)

  elBox = util.getElOuterBox(this)
  @connectionLayer.addNib(@nodeId, elBox.left + elBox.width/2, elBox.top + elBox.height, 30)


Node.drawAllConnections = ->
  all = document.querySelectorAll("p-node")
  for node in all
    node.drawConnections()


Node.connectTo = (other) ->
  @connectedTo = _.union(@connectedTo, [other])


Node.disconnectFrom = (other) ->
  @connectedTo = _.without(@connectedTo, other)


document.register("p-node", {
  prototype: Node
})
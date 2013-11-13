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

Node.initListeners_ = ->
  @$el.on("p-dragstart", @dragStart_.bind(this))
  @$el.on("p-dragmove", @dragMove_.bind(this))
  @$el.on("p-dragend", @dragEnd_.bind(this))

  @$connect = @$el.children(".node-connect")
  @$connect.on("p-dragstart", @connectDragStart_.bind(this))
  @$connect.on("p-dragmove", @connectDragMove_.bind(this))
  @$connect.on("p-dragend", @connectDragEnd_.bind(this))

  @$layerGroup = $(@layerGroup)
  @$layerGroup.on("p-dragstart", @layerGroupDragStart_.bind(this))
  @$layerGroup.on("p-dragmove", @layerGroupDragMove_.bind(this))
  @$layerGroup.on("p-dragend", @layerGroupDragEnd_.bind(this))



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
  offset = @$el.offset()
  width = @$el.outerWidth()
  height = @$el.outerHeight()
  @connectStart = [offset.left + width/2, offset.top + height/2]


Node.connectDragMove_ = (e) ->
    if @connectStart?
      @drawConnections(@nodeId)
      @connectionLayer.addLine(@nodeId, @connectStart, [e.pageX, e.pageY])


Node.connectDragEnd_ = (e) ->
    @connectStart = null

    $other = $(e.target).closest("p-node")
    if ($other.length > 0) and ($other[0] isnt this)
      @connectTo($other[0])
      @drawConnections(@nodeId)



### ===========================================================================

  layerGroup

=========================================================================== ###


Node.layerGroupDragStart_ = (e) ->
  console.log e


Node.layerGroupDragEnd_ = (e) ->
  console.log e


Node.layerGroupDragMove_ = (e) ->
  console.log e



### ===========================================================================

  Helpers

=========================================================================== ###


Node.drawConnections = ->
  @connectionLayer.clear(@nodeId)
  for other in @connectedTo
    @connectionLayer.addLineEl(@nodeId, this, other)


Node.drawAllConnections = ->
  all = document.querySelectorAll("p-node")
  for node in all
    node.drawConnections()


Node.connectTo = (other) ->
  @connectedTo = _.union(@connectedTo, [other])


document.register("p-node", {
  prototype: Node
})
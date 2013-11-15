Node = Object.create(HTMLElement.prototype)

html = """
  <input class="node-text"></input>
  <button class="node-connect left"></button>
  <button class="node-connect top"></button>
  <button class="node-connect right"></button>
  <button class="node-connect bottom"></button>
"""

Node.insertedCallback = ->
  @$el = $(this)
  @innerHTML = html

  @connectionLayer = document.querySelector("p-connection-layer")
  @nodeId = @getAttribute("node-id")
  @layerGroup = @connectionLayer.registerUser(@nodeId)

  @connectedTo = {
    left: null
    top: null
    right: null
    bottom: null
  }

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
  $target = $(e.target)
  offset = $target.offset()
  width = $target.outerWidth()
  height = $target.outerHeight()
  @connectStart = [offset.left + width/2, offset.top + height/2]
  @connectStartTarget = e.target


Node.connectDragMove_ = (e) ->
  if @connectStart?
    @drawConnections(@nodeId)
    @connectionLayer.addLine(@nodeId, @connectStart, [e.pageX, e.pageY])


Node.connectDragEnd_ = (e) ->
  $other = $(e.target).closest("p-node")
  if ($other.length > 0) and ($other[0] isnt this)
    type = @connectStartTarget.classList[1]
    @connectTo($other[0], type)
    @drawConnections(@nodeId)

  @connectStart = null
  @connectStartTarget = null



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
  for type, other of @connectedTo
    if other?
      connectNib = @querySelector(".#{type}")
      @connectionLayer.addLineEl(@nodeId, this, other)


Node.drawAllConnections = ->
  all = document.querySelectorAll("p-node")
  for node in all
    node.drawConnections()


Node.connectTo = (other, type) ->
  @connectedTo[type] = other


document.register("p-node", {
  prototype: Node
})
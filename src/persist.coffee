Controller = require("./Controller.coffee")
db = require("./db.coffee")

observerOpts = {
  attributes    : true
  characterData : true
  childList     : true
  subtree       : true
}

persistWait = 250
urlRegex = /\/(.*)/


class Persist

  constructor: ->
    @graph = document.querySelector(".graph")
    @nodeContainer = document.querySelector(".node-container")
    @lastData = null
    @dataRendered = false
    @initListeners_()
    @loadData_()


  toggleEditing_: ->
    document.querySelector(".conversation").classList.toggle("conversation-mode")
    @conversation.scrollToBottom()


  ### ===========================================================================

    Persisting data

  =========================================================================== ###

  initListeners_: ->
    callback = _.throttle(@persistAll_, persistWait)
    observer = new MutationObserver(callback)
    observer.observe(@graph, observerOpts)

    # No mutation events from inputs, so this is manual.
    $(document).on("input", ".node-text", callback)


  persistAllNext_: (e) =>
    setTimeout(@persistAll_, 0)


  getPersisUrl_: ->
    matches = urlRegex.exec(window.location.pathname)
    return matches[1]


  persistAll_: (e) =>
    # Check to see if data has been retrieved first
    if not @dataRendered
      return

    data = @serializeAll_()
    if not _.isEqual(data, @lastData)
      @lastData = data

      url = @getPersisUrl_()
      if url?
        db.set url, data, (data) ->
          if data.err?
            console.log "save error: ", data.err


  serializeAll_: ->
    nodes = $(@nodeContainer).children()

    all = _.map nodes, (node) ->
      return node.serialize()

    return all



  ### ===========================================================================

    Loading data

  =========================================================================== ###

  loadData_: ->
    data = window.bootstrapData
    if data?
      @renderData_(data)
    else
      @dataRendered = true

      # If there is no data, go into editing mode.
      # @toggleEditing_()



  renderData_: (nodes) ->
    @dataRendered = true

    if (not nodes?) or (nodes.length is 0)
      return

    # Create nodes
    for nodeData in nodes
      node = document.createElement("p-node")
      node.setAttribute("node-id", nodeData.id)
      if nodeData.type is "output"
        node.classList.add("output")
      if nodeData.active
        node.classList.add("active")
      @nodeContainer.appendChild(node)

      $(node).css({
        left: nodeData.position.left + "px"
        top: nodeData.position.top + "px"
      })

      # Explicit setup
      node.setup()


    # Connect nodes
    for nodeData in nodes
      node = @findNode_(nodeData.id)

      # Set input value
      node.setValue(nodeData.text)

      for id in nodeData.connectedTo
        other = @findNode_(id)
        if other?
          node.connectTo(other)

    @nodeContainer.querySelector("p-node").drawAllConnections()

    # If there is an active node, set it.
    activeNode = @nodeContainer.querySelector(".active")
    if activeNode?
      Controller.setActiveNode_(activeNode)


  findNode_: (id) ->
    return @nodeContainer.querySelector("[node-id='#{id}']")


module.exports = new Persist()
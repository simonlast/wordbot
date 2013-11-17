db = require("./db.coffee")

observerOpts = {
  attributes    : true
  characterData : true
  childList     : true
  subtree       : true
}

persistWait = 1000
urlRegex = /\?(.*)/


class Persist

  constructor: ->
    @graph = document.querySelector(".graph")
    @nodeContainer = document.querySelector(".node-container")
    @lastData = null
    @dataRendered = false
    @initListeners_()
    @loadData_()


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
    matches = urlRegex.exec(window.location.search)
    if not matches?
      window.location.href = "/?" + uuid()
    else
      return matches[1]


  persistAll_: (e) =>
    # Check to see if data has been retrieved first
    if not @dataRendered
      return

    data = @serializeAll_()
    if not _.isEqual(data, @lastData)
      @lastData = data
      console.log "newData"

      url = @getPersisUrl_()
      if url?
        db.set url, data, (data) ->
          if data.err?
            console.log data.err


  serializeAll_: ->
    nodes = $(@nodeContainer).children()

    all = _.map nodes, (node) ->
      return node.serialize()

    return all



  ### ===========================================================================

    Loading data

  =========================================================================== ###

  loadData_: ->
    url = @getPersisUrl_()

    if url?
      db.get url, (data) =>
        if data.err?
          @dataRendered = true
        else
          @renderData_(data.value)


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
      @nodeContainer.appendChild(node)

      $(node).css({
        left: nodeData.position.left + "px"
        top: nodeData.position.top + "px"
      })

    # Wait until inserted is called
    redraw = =>

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

    setTimeout(redraw, 0)


  findNode_: (id) ->
    return @nodeContainer.querySelector("[node-id='#{id}']")


module.exports = Persist
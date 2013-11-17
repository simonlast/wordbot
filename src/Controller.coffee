util = require("./util.coffee")


class Controller

  constructor: ->
    @nodeContainer = document.querySelector(".node-container")
    @conversation = document.querySelector("p-conversation")

    @initListeners_()


  initListeners_: ->
    $(@conversation).on("enter", @textEntered_)

    # $(document).on "mousedown", "p-node", (e) =>
    #   console.log @getConnections_(e.target)


  textEntered_: (e) =>
    value = @conversation.getValue()
    consumedTokens = @tryConsume_(@getTokens_(value))
    console.log "consumedTokens: ", consumedTokens
    if consumedTokens.length > 0
      @conversation.setValue("")


  # Returns tokens left
  tryConsume_: (tokens) ->
    activeNode = @getActiveNode_()
    return if not activeNode?

    branches = @getConnections_(activeNode)
    console.log "branches: ", branches

    all = _.map branches, (branch) =>
      branchText = branch.getValue()
      branchTokens = @getTokens_(branchText)
      console.log "compare: ", tokens, branchTokens
      numEqual = @numEqual_(tokens, branchTokens)
      isConsumed = (numEqual >= branchTokens.length)
      return {branch, numEqual, isConsumed}

    best = _.max all, (data) ->
      return data.numEqual


    consumed = _.first(tokens, best.numEqual)
    rest = _.rest(tokens, best.numEqual)

    # A node was consumed.
    if (best.isConsumed)
      @setActiveNode_(best.branch)

      # Still more to go
      if (best.numEqual < tokens.length)
        moreConsumed = @tryConsume_(rest)
        return _.union(consumed, moreConsumed)
      else
        return consumed

    # Otherwise, nothing was consumed.
    else
      return []


  numEqual_: (tokens1, tokens2) ->
    ordered = _.sortBy [tokens1, tokens2], (tokens) ->
      return tokens.length

    smaller = ordered[0]
    larger = ordered[1]
    num = 0

    for largerToken, index in larger

      smallerToken = smaller[index]

      if largerToken is smallerToken
        num++
      else
        return num

    return num


  getTokens_: (text) ->
    text = text.toLowerCase()
    return text.split(" ")


  getConnections_: (node) ->
    connectedTo = node.connectedTo

    outputs = _.filter connectedTo, (el) ->
      return el.classList.contains("output")

    inputs = _.difference(connectedTo, outputs)

    allConnections = _.map outputs, (output) =>
      return @getConnections_(output)

    allConnections.unshift(inputs)

    flattened = _.flatten(allConnections)
    unique = _.uniq(flattened)

    return unique


  getActiveNode_: ->
    return @nodeContainer.querySelector(".active")


  setActiveNode_: (node) ->
    active = @nodeContainer.querySelectorAll(".active")

    for el in active
      el.classList.remove("active")

    node.classList.add("active")



module.exports = Controller
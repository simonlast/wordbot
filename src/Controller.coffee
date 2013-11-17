util = require("./util.coffee")


class Controller

  constructor: ->
    @nodeContainer = document.querySelector(".node-container")
    @conversation = document.querySelector("p-conversation")
    @initListeners_()


  initListeners_: ->
    $(@conversation).on("enter", @textEntered_)
    $(@conversation).on("input", @textTyped_)
    $(document).on("mousedown", "p-node", @selectNode_)
    $(document).on("input", "p-node", @selectNode_)


  selectNode_: (e) =>
    @conversation.clear()
    @setActiveNode_(e.currentTarget)


  textTyped_: (e) =>
    value = @conversation.getValue()
    tokens = @getTokens_(value)
    activeNode = @getActiveNode_()

    consumedNodes = @getConsumedNodes_([activeNode], tokens)

    console.log consumedNodes
    @setPotentialNodes_(consumedNodes)


  textEntered_: (e) =>
    value = @conversation.getValue()
    tokens = @getTokens_(value)
    activeNode = @getActiveNode_()
    consumedNodes = @getConsumedNodes_([activeNode], tokens)

    if consumedNodes.length > 0
      @setActiveNode_(consumedNodes[consumedNodes.length-1])
      @setPotentialNodes_([])
      @conversation.addInput()


  getConsumedNodes_: (nodes, tokens) ->

    lastNode = nodes[nodes.length - 1]

    outputs = @getConnectedOutputs_(lastNode)

    # If there are any outputs, consume the first and recur
    if outputs.length > 0
      nodes = _.union(nodes, [outputs[0]])
      consumedNodes = @getConsumedNodes_(nodes, tokens)
      return consumedNodes


    # If no tokens left to consume, return.
    if tokens.length is 0
      return nodes

    inputs = @getConnectedInputs_(lastNode)

    # Find the input that will consume the most tokens.
    consumeData = _.map inputs, (input) =>
      inputText = input.getValue()
      inputTokens = @getTokens_(inputText)
      numEqual = @numEqual_(tokens, inputTokens)
      isConsumed = (numEqual >= inputTokens.length)
      return {input, numEqual, isConsumed}

    bestInputData = _.max consumeData, (data) ->
      return data.numEqual

    consumed = _.first(tokens, bestInputData.numEqual)
    rest = _.rest(tokens, bestInputData.numEqual)

    # A node was consumed.
    if (bestInputData.isConsumed)
      nodes = _.union(nodes, [bestInputData.input])
      consumedNodes = @getConsumedNodes_(nodes, rest)
      return consumedNodes


    return nodes


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


  getConnectedOutputs_: (node) ->
    connectedTo = node.connectedTo
    outputs = _.filter connectedTo, (el) ->
      return el.classList.contains("output")

    return outputs


  getConnectedInputs_: (node) ->
    connectedTo = node.connectedTo
    inputs = _.filter connectedTo, (el) ->
      return not el.classList.contains("output")

    return inputs


  getActiveNode_: ->
    return @nodeContainer.querySelector(".active")


  setPotentialNodes_: (nodes) ->
    potentialActive = @nodeContainer.querySelectorAll(".potentialActive")

    for node in potentialActive
      node.classList.remove("potentialActive")

    for node in nodes
      node.classList.add("potentialActive")



  setActiveNode_: (node) ->
    active = @nodeContainer.querySelectorAll(".active")
    for el in active
      el.deselectNode()

    node.selectNode()

    if node.classList.contains("output")
      @conversation.addOutput(node.getValue())


    # If there are any outputs, recur.
    outputs = @getConnectedOutputs_(node)

    if outputs.length > 0
      @setActiveNode_(outputs[0])




module.exports = Controller
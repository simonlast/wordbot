util = require("./util.coffee")


class Controller

  constructor: ->
    @nodeContainer = document.querySelector(".node-container")
    @conversation = document.querySelector("p-conversation")

    @initListeners_()


  initListeners_: ->
    $(@conversation).on("enter", @textEntered_)
    $(document).on("mousedown", "p-node", @selectNode_)


  selectNode_: (e) =>
    @setActiveNode_(e.target)


  textEntered_: (e) =>
    value = @conversation.getValue()
    tokens = @getTokens_(value)
    consumedTokens = @tryConsume_(tokens)
    console.log "consumedTokens: ", consumedTokens


  # Returns tokens left
  tryConsume_: (tokens) ->
    # If there's no active node, return an empty array.
    activeNode = @getActiveNode_()
    return [] if not activeNode?

    outputs = @getConnectedOutputs_(activeNode)

    # If there's an output, consume that and recur.
    if outputs.length > 0
      @setActiveNode_(outputs[0])
      return @tryConsume_(tokens)

    else

      # If no tokens left to consume, return an empty array.
      if tokens.length is 0
        return []

      inputs = @getConnectedInputs_(activeNode)

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
        @setActiveNode_(bestInputData.input)

        reduce = (text, curr) ->
          text += curr

        inputText = _.reduce(consumed, reduce, "")

        @conversation.addInput(inputText)

        moreConsumed = @tryConsume_(rest)
        return _.union(consumed, moreConsumed)


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


  setActiveNode_: (node) ->
    active = @nodeContainer.querySelectorAll(".active")

    for el in active
      el.classList.remove("active")

    node.classList.add("active")


    if node.classList.contains("output")
      @conversation.addOutput(node.getValue())


module.exports = Controller
class Persist

  constructor: ->
    @nodeContainer = document.querySelector(".node-container")
    @lastData = null


  persistAllNext_: (e) =>
    setTimeout(@persistAll_, 0)


  persistAll_: (e) =>
    data = @serializeAll_()

    if not _.isEqual(data, @lastData)
      @lastData = data
      # TODO persist.


  serializeAll_: ->
    nodes = $(@nodeContainer).children()

    all = _.map nodes, (node) ->
      return node.serialize()

    return all



module.exports = Persist
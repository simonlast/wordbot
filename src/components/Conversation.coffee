util = require("../util.coffee")

Conversation = Object.create(HTMLElement.prototype)

html = """

"""

Conversation.insertedCallback = ->
  @$el = $(this)
  @innerHTML = html
  @initListeners_()


Conversation.initListeners_ = ->


document.register("p-conversation", {
  prototype: Conversation
})
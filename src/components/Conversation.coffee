util = require("../util.coffee")

Conversation = Object.create(HTMLElement.prototype)

html = """

  <input type="text" class="conversation-input">
"""

Conversation.insertedCallback = ->
  @$el = $(this)
  @innerHTML = html
  @initListeners_()


Conversation.getValue = ->
  return @querySelector(".conversation-input").value


Conversation.setValue = (value) ->
  @querySelector(".conversation-input").value = value


Conversation.initListeners_ = ->
  input = @querySelector(".conversation-input")
  $(input).on("input", @inputTyped_.bind(this))
  $(input).on("keydown", @inputTyped_.bind(this))



Conversation.inputTyped_ = (e) ->
  if e.keyCode is 13
    $(this).trigger("enter")



document.register("p-conversation", {
  prototype: Conversation
})
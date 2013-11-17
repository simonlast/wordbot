util = require("../util.coffee")

Conversation = Object.create(HTMLElement.prototype)

html = """
  <div class="log"></div>
  <input type="text" class="conversation-input">
"""

Conversation.insertedCallback = ->
  @$el = $(this)
  @innerHTML = html
  @initListeners_()


Conversation.getValue = ->
  return @querySelector(".conversation-input").value


Conversation.addInput = (text) ->
  input = @querySelector(".conversation-input")
  input.value = ""
  @addMessage(text, "input")


Conversation.addOutput = (text) ->
  @addMessage(text, "output")


Conversation.addMessage = (text, type) ->
  log = @querySelector(".log")
  p = document.createElement("p")
  p.classList.add(type)
  p.innerText = text
  log.appendChild(p)

  # Auto-scroll
  $log = $(log)
  $log.scrollTop(log.scrollHeight)


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
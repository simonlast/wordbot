ConnectionLayer = Object.create(HTMLElement.prototype)

html = """
  <svg></svg>
"""

ConnectionLayer.insertedCallback = ->
  @$el = $(this)
  @innerHTML = html
  @svg = @querySelector("svg")
  @users = {}


ConnectionLayer.registerUser = (id) ->
  group = document.createElementNS("http://www.w3.org/2000/svg", "g")
  @svg.appendChild(group)
  @users[id] = group


ConnectionLayer.addLineEl = (id, fromEl, toEl) ->
  fromMiddle = @getElMiddle(fromEl)
  toMiddle = @getElMiddle(toEl)
  @addLine(id, fromMiddle, toMiddle)


ConnectionLayer.addLine = (id, from, to) ->
  newLine = document.createElementNS("http://www.w3.org/2000/svg", "line")
  newLine.setAttribute("x1", from[0])
  newLine.setAttribute("x2", to[0])
  newLine.setAttribute("y1", from[1])
  newLine.setAttribute("y2", to[1])

  group = @users[id]
  group.appendChild(newLine)


ConnectionLayer.clear = (id) ->
  group = @users[id]
  group.innerHTML = ""


ConnectionLayer.getElMiddle = (el) ->
  $el = $(el)
  offset = $el.offset()
  width = $el.width()
  height = $el.height()
  return [offset.left + width/2, offset.top + height/2]


document.register("p-connection-layer", {
  prototype: ConnectionLayer
})
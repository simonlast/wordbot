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
  # One in the middle
  @addLineSimple(id, from, to)

  # One on either side
  from = $V(from)
  to = $V(to)

  sub = from.subtract(to)
  sub = sub.rotate(Math.PI/2, $V([0,0]))
  sub = sub.toUnitVector()
  sub = sub.multiply(8)

  @addLineSimple(id, from.add(sub).elements, to.elements)
  @addLineSimple(id, from.subtract(sub).elements, to.elements)


ConnectionLayer.addLineSimple = (id, from, to) ->
  newLine = document.createElementNS("http://www.w3.org/2000/svg", "line")
  newLine.setAttribute("x1", from[0])
  newLine.setAttribute("x2", to[0])
  newLine.setAttribute("y1", from[1])
  newLine.setAttribute("y2", to[1])

  group = @users[id]
  group.appendChild(newLine)


ConnectionLayer.addLineTriangle = (id, from, to) ->
  newLine = document.createElementNS("http://www.w3.org/2000/svg", "polygon")
  from = $V(from)
  to = $V(to)

  sub = from.subtract(to)
  sub = sub.rotate(Math.PI/2, $V([0,0]))
  sub = sub.toUnitVector()
  sub = sub.multiply(20)
  points = [from.add(sub), from.subtract(sub), to]

  reduce = (result, point) ->
    result += "#{point.elements[0]},#{point.elements[1]} "

  attrString = _.reduce(points, reduce, "")
  newLine.setAttribute("points", attrString)

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
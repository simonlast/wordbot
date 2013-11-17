util = require("../util.coffee")

ConnectionLayer = Object.create(HTMLElement.prototype)

html = """
  <svg></svg>
"""

ConnectionLayer.insertedCallback = ->
  @$el = $(this)
  @innerHTML = html
  @svg = @querySelector("svg")
  @users = {}



### ===========================================================================

  Public

=========================================================================== ###


# Must be called before use. Id must be unique.
ConnectionLayer.registerUser = (id) ->
  group = document.createElementNS("http://www.w3.org/2000/svg", "g")
  @svg.appendChild(group)
  @users[id] = group
  group.classList.add("nodeGroup")
  return group


# Draw an edge from one el to another, including a nib and either end.
ConnectionLayer.addLineEl = (id, fromEl, toEl) ->
  fromMiddle = util.getElMiddle(fromEl)
  toMiddle = util.getElMiddle(toEl)
  lineGroup = @addLine(id, fromMiddle, toMiddle)
  lineGroup.info = {
    from: fromEl,
    to: toEl
  }


# Draw a nib at location [x, y]
ConnectionLayer.addNib = (id, x, y, rad=20) ->
  group = @users[id]
  circle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
  circle.setAttribute("cx", x)
  circle.setAttribute("cy", y)
  circle.setAttribute("r", rad)
  circle.classList.add("nib")
  circle.classList.add("canDragstart")
  group.appendChild(circle)


ConnectionLayer.addLine = (id, from, to) ->
  idGroup = @users[id]
  lineGroup = document.createElementNS("http://www.w3.org/2000/svg", "g")
  idGroup.appendChild(lineGroup)
  lineGroup.classList.add("lineGroup")
  lineGroup.classList.add("canDragstart")

  # One in the middle
  lineGroup.appendChild(@makeLineSimple(from, to))

  # One on either side
  from = $V(from)
  to = $V(to)

  sub = from.subtract(to)
  sub = sub.rotate(Math.PI/2, $V([0,0]))
  sub = sub.toUnitVector()
  sub = sub.multiply(12)

  lineGroup.appendChild(@makeLineSimple(from.add(sub).elements, to.elements))
  lineGroup.appendChild(@makeLineSimple(from.subtract(sub).elements, to.elements))

  return lineGroup


ConnectionLayer.clear = (id) ->
  group = @users[id]
  group?.innerHTML = ""


ConnectionLayer.makeLineSimple = (from, to) ->
  newLine = document.createElementNS("http://www.w3.org/2000/svg", "line")
  newLine.setAttribute("x1", from[0])
  newLine.setAttribute("x2", to[0])
  newLine.setAttribute("y1", from[1])
  newLine.setAttribute("y2", to[1])
  return newLine


document.register("p-connection-layer", {
  prototype: ConnectionLayer
})
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
  @addLine(id, fromMiddle, toMiddle)
  @addTip(id, fromEl, toEl)
  @addTip(id, toEl, fromEl)


# Draw a nib at location [x, y]
ConnectionLayer.addNib = (id, x, y, rad=20) ->
  group = @users[id]
  circle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
  circle.setAttribute("cx", x)
  circle.setAttribute("cy", y)
  circle.setAttribute("r", rad)
  circle.classList.add("nib")
  group.appendChild(circle)


# Adds a nib at the proper location, going from fromEl to toEl
ConnectionLayer.addTip = (id, fromEl, toEl) ->
  fromBox = util.getElOuterBox(fromEl)
  fromMiddle = util.getElMiddle(fromEl)
  toMiddle = util.getElMiddle(toEl)

  from = $V(fromMiddle)
  to = $V(toMiddle)
  lineTo = $L(from, to.subtract(from))

  # lines for element rect
  lines = [
     $L($V([fromBox.left, fromBox.top]), $V([0,1])) # left
     $L($V([fromBox.left, fromBox.top]), $V([1,0])) # top
     $L($V([fromBox.left + fromBox.width, fromBox.top]), $V([0,1])) # right
     $L($V([fromBox.left, fromBox.top + fromBox.height]), $V([1,0])) # right
  ]

  intersections = _.map lines, (line) ->
    return line.intersectionWith(lineTo)

  # Intersections must be within element rect
  valid = _.filter intersections, (intersection) ->
    return if not intersection?
    v = intersection.elements
    if (v[0] < fromBox.left or v[0] > fromBox.left + fromBox.width)
      return false
    if (v[1] < fromBox.top or v[1] > fromBox.top + fromBox.height)
      return false
    return true

  # Find nearest intersection to toElement
  nearest = _.min valid, (intersection) ->
    # Remove 3rd dimension
    intersection.elements.splice(2,1)
    return intersection.distanceFrom(to)

  nib = @addNib(id, nearest.elements[0], nearest.elements[1])

  # Store data as property
  nib.info = {
    from: fromEl
    to: toEl
  }


ConnectionLayer.addLine = (id, from, to) ->
  idGroup = @users[id]
  group = document.createElementNS("http://www.w3.org/2000/svg", "g")
  idGroup.appendChild(group)
  group.classList.add("lineGroup")

  # One in the middle
  group.appendChild(@makeLineSimple(from, to))

  # One on either side
  from = $V(from)
  to = $V(to)

  sub = from.subtract(to)
  sub = sub.rotate(Math.PI/2, $V([0,0]))
  sub = sub.toUnitVector()
  sub = sub.multiply(12)

  group.appendChild(@makeLineSimple(from.add(sub).elements, to.elements))
  group.appendChild(@makeLineSimple(from.subtract(sub).elements, to.elements))


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
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
  return group


ConnectionLayer.addLineEl = (id, fromEl, toEl) ->
  fromMiddle = @getElMiddle(fromEl)
  toMiddle = @getElMiddle(toEl)
  @addLine(id, fromMiddle, toMiddle)
  @addTip(id, fromEl, toEl, fromMiddle, toMiddle)
  @addTip(id, toEl, fromEl, toMiddle, fromMiddle)


ConnectionLayer.addTip = (id, fromEl, toEl, fromMiddle, toMiddle) ->
  group = @users[id]

  $fromEl = $(fromEl)
  fromOffset = $fromEl.offset()
  fromWidth = $fromEl.outerWidth()
  fromHeight = $fromEl.outerHeight()

  from = $V(fromMiddle)
  to = $V(toMiddle)
  lineTo = $L(from, to.subtract(from))

  # lines for element rect
  lines = [
     $L($V([fromOffset.left, fromOffset.top]), $V([0,1])) # left
     $L($V([fromOffset.left, fromOffset.top]), $V([1,0])) # top
     $L($V([fromOffset.left + fromWidth, fromOffset.top]), $V([0,1])) # right
     $L($V([fromOffset.left, fromOffset.top + fromHeight]), $V([1,0])) # right
  ]

  intersections = _.map lines, (line) ->
    return line.intersectionWith(lineTo)

  # Intersections must be within element rect
  valid = _.filter intersections, (intersection) ->
    return if not intersection?
    v = intersection.elements
    if (v[0] < fromOffset.left or v[0] > fromOffset.left + fromWidth)
      return false
    if (v[1] < fromOffset.top or v[1] > fromOffset.top + fromHeight)
      return false
    return true

  # Find nearest intersection to toElement
  nearest = _.min valid, (intersection) ->
    # Remove 3rd dimension
    intersection.elements.splice(2,1)
    return intersection.distanceFrom(to)

  circle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
  circle.setAttribute("cx", nearest.elements[0])
  circle.setAttribute("cy", nearest.elements[1])
  circle.setAttribute("r", 30)
  group.appendChild(circle)


ConnectionLayer.addLine = (id, from, to) ->
  group = @users[id]
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
  group.innerHTML = ""


ConnectionLayer.makeLineSimple = (from, to) ->
  newLine = document.createElementNS("http://www.w3.org/2000/svg", "line")
  newLine.setAttribute("x1", from[0])
  newLine.setAttribute("x2", to[0])
  newLine.setAttribute("y1", from[1])
  newLine.setAttribute("y2", to[1])
  return newLine


ConnectionLayer.getElMiddle = (el) ->
  $el = $(el)
  offset = $el.offset()
  width = $el.outerWidth()
  height = $el.outerHeight()
  return [offset.left + width/2, offset.top + height/2]


document.register("p-connection-layer", {
  prototype: ConnectionLayer
})
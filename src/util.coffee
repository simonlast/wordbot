util = {}


util.setCursor = (type) ->
  if type?
    document.body.setAttribute("data-cursor", type)
  else
    document.body.removeAttribute("data-cursor")


util.getElOuterBox = (el) ->
  $el = $(el)
  box = $el.position()
  box.width = $el.outerWidth()
  box.height = $el.outerHeight()
  return box


util.getElMiddle = (el) ->
  box = util.getElOuterBox(el)
  return [box.left + box.width/2, box.top + box.height/2]


window.getElMiddle = util.getElMiddle


module.exports = util
util = {}

util.getElOuterBox = (el) ->
  $el = $(el)
  box = $el.offset()
  box.width = $el.outerWidth()
  box.height = $el.outerHeight()
  return box


util.getElMiddle = (el) ->
  box = util.getElOuterBox(el)
  return [box.left + box.width/2, box.top + box.height/2]

module.exports = util
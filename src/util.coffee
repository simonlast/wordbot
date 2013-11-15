util = {}

util.getElMiddle = (el) ->
  $el = $(el)
  offset = $el.offset()
  width = $el.outerWidth()
  height = $el.outerHeight()
  return [offset.left + width/2, offset.top + height/2]

module.exports = util
class Drag

  constructor: ->
    @$root = $(document)
    @draggedTarget = null
    @dragging = false
    @initListeners()

  initListeners: ->
    @$root.on("mousedown", @startDrag)
    @$root.on("mousemove", @contDrag)
    @$root.on("mouseup", @endDrag)

  startDrag: (e) =>
    @draggedTarget = e.target

  contDrag: (e) =>
    if @draggedTarget?
      if not @dragging
        @triggerEvent("p-dragstart", @draggedTarget, e)
        @dragging = true
      @triggerEvent("p-dragmove", @draggedTarget, e)

  endDrag: (e) =>
    if @draggedTarget?
      @triggerEvent("p-dragend", @draggedTarget, e)
      @dragging = false
      @draggedTarget = null

  triggerEvent: (type, target, e) ->
    newEvent = $.Event(type)
    newEvent.pageX = e.pageX
    newEvent.pageY = e.pageY
    newEvent.target = e.target
    $(target).trigger(newEvent)

module.exports = Drag
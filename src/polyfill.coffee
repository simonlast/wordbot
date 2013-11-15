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
    target = e.target

    # HACK: svg stuff gets deleted a lot, so fire on g's
    $parents = $(target).closest(".nodeGroup")
    if $parents.length > 0
      target = $parents[0]

    @draggedTarget = target

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
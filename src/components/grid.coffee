notes = require("../notes.coffee")

Grid = Object.create(HTMLElement.prototype)

cellDimen = 80
msecs = 500

colHtml = """"
  <div class="grid-col"></div>
"""

Grid.readyCallback = ->
  @$el = $(this)
  @currCol = 0
  @computSizes()
  @initEls()
  @startTimer()

Grid.computSizes = ->
  $doc = $(document)
  width = $doc.width()
  height = $doc.height()

  @numCellsX = Math.floor(width/cellDimen)
  @numCellsY = Math.floor(height/cellDimen)
  
Grid.initEls = ->
  for x in [1..@numCellsX]
    $col = $(colHtml)
    for y in [1..@numCellsY]
      cell = document.createElement("p-cell")
      $col.append(cell)
    @$el.append($col)
  @$cols = @$el.children()

Grid.startTimer = ->
  @interval = setInterval(@nextCol.bind(this), msecs)

Grid.nextCol = ->
  $oldCol = @$cols.eq(@currCol)
  @currCol++
  if @currCol >= @$cols.length
    @currCol = 0

  $newCol = @$cols.eq(@currCol)
  $oldCol.css({
    opacity: .7
  })
  $newCol.css({
    opacity: 1
  })

  @playCol($newCol)

Grid.playCol = ($col) ->
  $cells = $col.children()
  len = $cells.length

  for el, i in $cells
    index = (len - i)
    note = notes[index + Math.floor(notes.length/2)]
    el.play(note)


document.register("p-grid", {
  prototype: Grid
})